"use client"

import React, { useMemo, useState } from "react"
import { FiFilter, FiSearch, FiDownload, FiFileText } from "react-icons/fi"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const toDate = (d) => {
  if (!d) return null
  const t = new Date(d)
  return isNaN(t) ? null : t
}
const pad2 = (n) => String(n).padStart(2, "0")
const fmtDateLabel = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

export default function ReportBuilder({ 
  recs = [], 
  users = [], 
  systemName = "", 
  logoPath = "/logo.png"
}) {
  // Build user map (id -> user)
  const userMap = useMemo(() => new Map((users || []).map((u) => [String(u.id ?? u.user_id), u])), [users])

  // Filters
  const [status, setStatus] = useState("all")
  const [farmerQuery, setFarmerQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTable, setShowTable] = useState(false)

  // Get current user from localStorage
  const currentUser = useMemo(() => {
    if (typeof window === 'undefined') return null
    
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) return null
      
      // Find user in the users array by user_id
      const user = users.find(u => String(u.id ?? u.user_id) === String(userId))
      return user || null
    } catch (error) {
      console.warn('Error accessing localStorage:', error)
      return null
    }
  }, [users])

  // Get current user name for the report
  const generatedBy = currentUser?.username || currentUser?.full_name || currentUser?.email || "System User"

  // Normalize records to table rows
  const allRows = useMemo(() => {
    return (recs || []).map((r, i) => {
      const farmerId =
        r.user_id ??
        r.farmer_user_id ??
        (typeof r.user === "object" ? r.user?.id : r.user) ??
        r.farmer_id ??
        r.farmer?.id

      const farmerUser = farmerId ? userMap.get(String(farmerId)) : null
      const farmerName =
        farmerUser?.username ||
        farmerUser?.full_name ||
        farmerUser?.email ||
        (farmerId ? `User #${farmerId}` : "Unknown")

      const agronomistId = r.agronomist_id ?? r.reviewer_id ?? r.agronomist?.id
      const agronomistUser = agronomistId ? userMap.get(String(agronomistId)) : null
      const agronomistName =
        r.agronomist_username ||
        agronomistUser?.username ||
        (agronomistId ? `User #${agronomistId}` : "—")

      const createdAt = toDate(r.timestamp || r.created_at)
      const reviewedAt = toDate(r.reviewed_at || r.updated_at) || null
      const crop = r.crop_predicted || r.ai_outputs?.crop_predicted || "—"

      return {
        id: r.id || `${i}`,
        i: i + 1,
        farmerId: farmerId ?? null,
        farmer: farmerName,
        crop,
        status: r.status || "unknown",
        reviewedBy: agronomistName,
        createdAt,
        createdAtLabel: createdAt ? createdAt.toLocaleString() : "—",
        reviewedAt,
        reviewedAtLabel: reviewedAt ? reviewedAt.toLocaleString() : "—",
      }
    })
  }, [recs, userMap])

  // Apply filters
  const filteredRows = useMemo(() => {
    const sd = startDate ? new Date(`${startDate}T00:00:00`) : null
    const ed = endDate ? new Date(`${endDate}T23:59:59.999`) : null
    const q = (farmerQuery || "").trim().toLowerCase()
    const qIsId = /^\d+$/.test(q)

    return allRows
      .filter((row) => {
        if (status !== "all" && row.status !== status) return false
        if (sd && (!row.createdAt || row.createdAt < sd)) return false
        if (ed && (!row.createdAt || row.createdAt > ed)) return false

        if (q) {
          if (qIsId) {
            if (String(row.farmerId || "").toLowerCase() !== q) return false
          } else {
            const nameStr = `${row.farmer}`.toLowerCase()
            if (!nameStr.includes(q)) return false
          }
        }
        return true
      })
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
  }, [allRows, status, startDate, endDate, farmerQuery])

  const resetFilters = () => {
    setStatus("all")
    setFarmerQuery("")
    setStartDate("")
    setEndDate("")
    setShowTable(false)
  }

  // Function to add logo to PDF
  const addLogoToPDF = async (doc, x, y, width = 40, height = 40) => {
    try {
      // Create an image element to load the logo
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Create canvas to convert image to base64
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            const imgData = canvas.toDataURL('image/png')
            doc.addImage(imgData, 'PNG', x, y, width, height)
            resolve()
          } catch (error) {
            console.warn('Failed to add logo to PDF:', error)
            resolve() // Continue without logo
          }
        }
        
        img.onerror = () => {
          console.warn('Failed to load logo image')
          resolve() // Continue without logo
        }
        
        img.src = logoPath
      })
    } catch (error) {
      console.warn('Error loading logo:', error)
      return Promise.resolve()
    }
  }

  // PDF generation for current filtered rows
  const downloadPDF = async () => {
    if (filteredRows.length === 0) return
    setIsGenerating(true)
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      const marginLeft = 40
      const headerHeight = 120 // Increased to accommodate logo
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Build natural-language filters line
      const humanizeStatus = (s) => String(s || "").replace(/_/g, " ").toLowerCase()
      const statusPhrase = status === "all" ? "All statuses" : `Only ${humanizeStatus(status)}`
      let datePhrase = ""
      if (startDate && endDate) {
        datePhrase = startDate === endDate ? `on ${startDate}` : `from ${startDate} to ${endDate}`
      } else if (startDate) {
        datePhrase = `from ${startDate}`
      } else if (endDate) {
        datePhrase = `up to ${endDate}`
      } else {
        datePhrase = "for all dates"
      }
      const q = (farmerQuery || "").trim()
      const farmerPhrase = q
        ? /^\d+$/.test(q)
          ? `for farmer #${q}`
          : `for farmers matching "${q}"`
        : "for all farmers"
      const filtersLine = [statusPhrase, datePhrase, farmerPhrase].filter(Boolean).join(" ")

      const body = filteredRows.map((r, idx) => ({
        i: idx + 1,
        farmer: r.farmer,
        crop: r.crop,
        status: r.status,
        reviewedBy: r.reviewedBy,
        createdAt: r.createdAtLabel,
      }))

      doc.setProperties({
        title: `${systemName} - Filtered Input Recommendation Report`,
        subject: "Filtered Report",
        creator: systemName,
        author: generatedBy,
      })

      // Add logo to the first page
      await addLogoToPDF(doc, marginLeft, 20, 50, 50)

      autoTable(doc, {
  columns: [
    { header: "#", dataKey: "i" },
    { header: "Farmer", dataKey: "farmer" },
    { header: "Crop", dataKey: "crop" },
    { header: "Status", dataKey: "status" },
    { header: "Reviewed By", dataKey: "reviewedBy" },
    { header: "Created At", dataKey: "createdAt" },
  ],
  body,
  startY: headerHeight,
  margin: { top: headerHeight + 10, bottom: 40, left: marginLeft, right: marginLeft },
  theme: 'grid', // plain grid with lines
  styles: { fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.5 },
  headStyles: { fillColor: [255, 255, 255], textColor: 20 }, // no green
  didDrawPage: async (data) => {
    if (data.pageNumber > 1) {
      await addLogoToPDF(doc, marginLeft, 20, 40, 40)
    }
    const logoWidth = 60
    const textStartX = marginLeft + logoWidth + 15

    doc.setDrawColor(230)
    doc.line(marginLeft, headerHeight - 12, pageWidth - marginLeft, headerHeight - 12)
    doc.setTextColor(40)
    doc.setFontSize(16)
    doc.text(`IMBARAGA FARMERS ORGANIZATION`, textStartX, 38)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, textStartX, 55)

    const availableWidth = pageWidth - textStartX - marginLeft
    const wrapped = doc.splitTextToSize(filtersLine, availableWidth)
    doc.text(wrapped, textStartX, 85)

    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(`Page ${data.pageNumber}`, pageWidth - marginLeft - 30, pageHeight - 20)
    doc.text(`Prepared by: ${generatedBy}`, marginLeft, pageHeight - 490)
  },
})

      const startPart = startDate ? startDate.replace(/-/g, "") : "ALL"
      const endPart = endDate ? endDate.replace(/-/g, "") : "ALL"
      const statusPart = status === "all" ? "ALL" : humanizeStatus(status).replace(/\s+/g, "-")
      const fileName = `${systemName}_Report_${statusPart}_${startPart}_${endPart}.pdf`
      doc.save(fileName)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      {/* Header with logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={logoPath} 
            alt={`${systemName} Logo`} 
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiFilter /> Build a Filtered Report
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          Rows: <span className="font-medium text-gray-700">{filteredRows.length}</span>
        </div>
      </div>



      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending_review">Pending</option>
            <option value="in_review">In Review</option>
            <option value="translated">Translated</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            max={endDate || undefined}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            min={startDate || undefined}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Search farmer (name or user_id)</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              value={farmerQuery}
              onChange={(e) => setFarmerQuery(e.target.value)}
              placeholder="e.g., alice or 123"
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowTable((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <FiFileText />
          {showTable ? "Hide Table" : "Make Report"}
        </button>

        <button
          onClick={downloadPDF}
          disabled={filteredRows.length === 0 || isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <FiDownload />
          {isGenerating ? "Generating…" : "Download PDF"}
        </button>

        <button
          onClick={resetFilters}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
        >
          Reset
        </button>
      </div>

      {/* Table (hidden by default, toggled by "Make Report") */}
      {showTable && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">Farmer</th>
                <th className="py-2 px-3 text-left">Crop</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Reviewed By</th>
                <th className="py-2 px-3 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="py-4 px-3 text-gray-500" colSpan={7}>
                    No matching records.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-g-50 transition">
                    <td className="py-2 px-3">{r.i}</td>
                    <td className="py-2 px-3">{r.farmer}</td>
                    <td className="py-2 px-3">{r.crop}</td>
                    <td className="py-2 px-3 capitalize">{r.status}</td>
                    <td className="py-2 px-3">{r.reviewedBy}</td>
                    <td className="py-2 px-3">{r.createdAtLabel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}