"use client"

import React, { useMemo, useRef, useState } from "react"
import { FiBarChart2, FiDownload, FiFileText } from "react-icons/fi"
import {
  ResponsiveContainer,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from "recharts"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Utils
const getMonthKey = (dateLike) => {
  if (!dateLike) return ""
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
const labelMonthKey = (key) => {
  const [y, m] = key.split("-").map(Number)
  const d = new Date(y, (m || 1) - 1, 1)
  return d.toLocaleString("en-US", { month: "short", year: "numeric" })
}
const getISOWeekKey = (dateLike) => {
  if (!dateLike) return ""
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return ""
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`
}
const labelWeekKey = (key) => {
  const [y, wk] = key.split("-W")
  return `W${wk} ${y}`
}
const lastNMonths = (n = 6) => {
  const keys = []
  const cur = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(cur.getFullYear(), cur.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return keys
}
const lastNWeeks = (n = 8) => {
  const keys = []
  const cur = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(cur.getDate() - i * 7)
    keys.push(getISOWeekKey(d))
  }
  return keys
}

export default function MyReviewsReport({
  normalizedRecords = [],
  currentUserId = null,
  preparedBy = "Unknown",
  title = "My Reviews Report",
  brand = "AIOS Agronomist",
  months = 6,
  weeks = 8,
}) {
  const [reportMode, setReportMode] = useState("monthly") // 'weekly' | 'monthly'
  const detailsRef = useRef(null)

  // Mine = items assigned to me (agronomist_id == currentUserId). If no user, fall back to all.
  const mine = useMemo(() => {
    if (!currentUserId) return normalizedRecords
    return normalizedRecords.filter(r => String(r.agrId) === String(currentUserId))
  }, [normalizedRecords, currentUserId])

  // Build report rows per period
  const buildReport = (keys, type) => {
    return keys.map((k) => {
      let received = 0
      let translated = 0
      let returned = 0
      mine.forEach((r) => {
        const keyTs = type === "month" ? getMonthKey(r.ts) : getISOWeekKey(r.ts)
        if (keyTs === k) received += 1
        // Use updated (reviewed time) if present; fallback to ts
        const doneKey = type === "month" ? getMonthKey(r.updated || r.ts) : getISOWeekKey(r.updated || r.ts)
        if (r.status === "translated" && doneKey === k) translated += 1
        if (r.status === "returned" && doneKey === k) returned += 1
      })
      return {
        key: k,
        period: type === "month" ? labelMonthKey(k) : labelWeekKey(k),
        received,
        translated,
        returned,
      }
    })
  }

  const monthlyReport = useMemo(() => buildReport(lastNMonths(months), "month"), [mine, months])
  const weeklyReport  = useMemo(() => buildReport(lastNWeeks(weeks), "week"), [mine, weeks])
  const reportData    = reportMode === "monthly" ? monthlyReport : weeklyReport
  const latest        = reportData[reportData.length - 1] || { period: "—", received: 0, translated: 0, returned: 0 }

  // CSV export for this section
  const exportCSV = () => {
    const headers = ["period", "received", "translated", "returned"]
    const rows = reportData.map(r => [r.period, r.received, r.translated, r.returned].join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `my-reviews-${reportMode}-report-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Styled PDF export (cover + details)
  const exportStyledPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4")
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()

    // Colors
    const emerald = { r: 16, g: 185, b: 129 }
    const blue    = { r: 59, g: 130, b: 246 }
    const red     = { r: 239, g: 68, b: 68 }
    const gray700 = { r: 55, g: 65, b: 81 }
    const gray500 = { r: 107, g: 114, b: 128 }
    const light   = { r: 240, g: 253, b: 244 }
    const border  = { r: 229, g: 231, b: 235 }

    // Metadata
    pdf.setProperties({
      title: `${title} (${reportMode})`,
      subject: "Agronomist Reviews",
      author: preparedBy,
    })

    // Header band
    pdf.setFillColor(emerald.r, emerald.g, emerald.b)
    pdf.rect(0, 0, pageW, 28, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(18)
    pdf.text(title, 14, 18)
    pdf.setFontSize(11)
    pdf.text(`${reportMode === "monthly" ? "Monthly" : "Weekly"} Summary`, pageW - 14, 18, { align: "right" })

    // Period label (first → last)
    const periodLabel = reportData?.length ? `${reportData[0].period} — ${reportData[reportData.length - 1].period}` : "—"

    let y = 42
    pdf.setTextColor(gray700.r, gray700.g, gray700.b)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(12)
    pdf.text(`Prepared by: ${preparedBy}`, 14, y); y += 8
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, y); y += 8
    pdf.text(`Period: ${periodLabel}`, 14, y); y += 12

    // Summary cards
    const cards = [
      { label: "Received",   value: String(latest.received),   color: emerald },
      { label: "Translated", value: String(latest.translated), color: blue },
      { label: "Returned",   value: String(latest.returned),   color: red },
    ]
    const margin = 14
    const gap = 6
    const boxW = (pageW - margin * 2 - gap * 2) / 3
    const boxH = 28

    cards.forEach((c, i) => {
      const x = margin + i * (boxW + gap)
      pdf.setDrawColor(border.r, border.g, border.b)
      pdf.setFillColor(light.r, light.g, light.b)
      pdf.rect(x, y, boxW, boxH, "FD")
      pdf.setTextColor(gray500.r, gray500.g, gray500.b)
      pdf.setFontSize(10)
      pdf.text(c.label, x + 4, y + 8)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(c.color.r, c.color.g, c.color.b)
      pdf.setFontSize(16)
      pdf.text(c.value, x + 4, y + 21)
      pdf.setFont("helvetica", "normal")
    })
    y += boxH + 14

    pdf.setTextColor(gray500.r, gray500.g, gray500.b)
    pdf.setFontSize(9)
    pdf.text("This report summarizes items assigned to you (received) and outcomes (translated/returned) in the selected period.", margin, y)

    // Details page (screenshot of the section)
    pdf.addPage()
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(emerald.r, emerald.g, emerald.b)
    pdf.setFontSize(13)
    pdf.text(`${title} – Details`, 14, 16)

    if (detailsRef?.current) {
      const canvas = await html2canvas(detailsRef.current, { scale: 2, backgroundColor: "#FFFFFF" })
      const imgData = canvas.toDataURL("image/png")
      const maxW = pageW - 28
      const imgH = (canvas.height * maxW) / canvas.width
      const drawArea = pageH - 28

      if (imgH <= drawArea) {
        pdf.addImage(imgData, "PNG", 14, 22, maxW, imgH)
      } else {
        let offset = 0
        while (offset < imgH) {
          pdf.addImage(imgData, "PNG", 14, 22 - offset, maxW, imgH)
          offset += drawArea
          if (offset < imgH) pdf.addPage()
        }
      }
    } else {
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(gray700.r, gray700.g, gray700.b)
      pdf.text("No details to render.", 14, 32)
    }

    // Footer with page numbers
    const pageCount = pdf.internal.getNumberOfPages()
    pdf.setFontSize(9)
    pdf.setTextColor(gray500.r, gray500.g, gray500.b)
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      const footerText = `${brand} • Page ${i} of ${pageCount}`
      pdf.text(footerText, pageW / 2, pageH - 8, { align: "center" })
    }

    pdf.save(`my-reviews-${reportMode}-report-${Date.now()}.pdf`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiBarChart2 className="text-emerald-600" />
          <h2 className="font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setReportMode("weekly")}
              className={`px-3 py-1.5 text-sm ${reportMode === "weekly" ? "bg-emerald-600 text-white" : "bg-white text-gray-700"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportMode("monthly")}
              className={`px-3 py-1.5 text-sm ${reportMode === "monthly" ? "bg-emerald-600 text-white" : "bg-white text-gray-700"}`}
            >
              Monthly
            </button>
          </div>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-emerald-50">
            <FiDownload /> CSV
          </button>
          <button onClick={exportStyledPDF} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            <FiFileText /> Styled PDF
          </button>
        </div>
      </div>

      <div ref={detailsRef} className="p-4 space-y-4">
        {/* Latest summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="text-xs text-emerald-700/70">Latest period</div>
            <div className="text-lg font-semibold text-emerald-900">{(reportData[reportData.length - 1]?.period) || "—"}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-xs text-gray-500">Received</div>
            <div className="text-2xl font-bold text-gray-900">{(reportData[reportData.length - 1]?.received) || 0}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-xs text-gray-500">Translated / Returned</div>
            <div className="text-2xl font-bold text-gray-900">
              {(reportData[reportData.length - 1]?.translated) || 0} / {(reportData[reportData.length - 1]?.returned) || 0}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="received" fill="#10B981" name="Received" radius={[6, 6, 0, 0]} />
              <Bar dataKey="translated" fill="#3B82F6" name="Translated" radius={[6, 6, 0, 0]} />
              <Bar dataKey="returned" fill="#EF4444" name="Returned" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-4">Period</th>
                <th className="py-2 pr-4">Received</th>
                <th className="py-2 pr-4">Translated</th>
                <th className="py-2 pr-4">Returned</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((r) => (
                <tr key={r.key} className="border-b last:border-0">
                  <td className="py-2 pr-4">{r.period}</td>
                  <td className="py-2 pr-4">{r.received}</td>
                  <td className="py-2 pr-4">{r.translated}</td>
                  <td className="py-2 pr-4">{r.returned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!reportData.length && (
          <div className="text-gray-500 text-sm">No data to display for this report.</div>
        )}
      </div>
    </div>
  )
}