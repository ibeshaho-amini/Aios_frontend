"use client"

import React, { useMemo, useState } from "react"
import { FiFilter, FiDownload, FiFileText } from "react-icons/fi"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Utils
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const pad2 = (n) => String(n).padStart(2, "0")
const monthShort = (m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1] || ""
function formatMoney(v, currency = "") {
  const num = toNumber(v)
  const s = num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return currency ? `${currency} ${s}` : s
}
function parseYMD(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "")
  if (!m) return null
  const [_, y, mo, d] = m
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
}
function getISOWeekInfo(dateUTC) {
  const d = new Date(Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return { isoYear: d.getUTCFullYear(), isoWeek: week }
}

// Load an image and return a base64 dataURL (for reliable PDF embedding)
function loadImageAsDataURL(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          const dataUrl = canvas.toDataURL("image/png")
          resolve(dataUrl)
        } catch (e) {
          console.warn("Failed to convert logo to dataURL:", e)
          resolve(null)
        }
      }
      img.onerror = () => {
        console.warn("Failed to load logo image:", src)
        resolve(null)
      }
      img.src = src
    } catch (e) {
      console.warn("Error loading logo:", e)
      resolve(null)
    }
  })
}

const typeLabels = {
  fertilizer: "Fertilizer",
  pesticide: "Pesticide",
  seed: "Seed",
}

export default function UsageReportBuilder({
  usages = [],
  seasons = ["Season A", "Season B", "Season C"],
  years,                        // optional: pass [2025, 2024, ...]; if omitted, inferred from data
  systemName = "IMBARAGA FARMERS ORGANIZATION",
  currency = "",                // e.g., "KES", "$", "UGX"
  users = [],                   // to resolve current user name by user_id from localStorage
  logoPath = "/logo.png",       // logo path (same-origin or CORS-enabled)
}) {
  // Build selects from data if not provided
  const availableYears = useMemo(() => {
    if (Array.isArray(years) && years.length) return years
    const set = new Set(usages.filter(u => u.season_year != null).map(u => Number(u.season_year)))
    return Array.from(set).sort((a, b) => b - a)
  }, [years, usages])

  // Map of users
  const userMap = useMemo(() => new Map((users || []).map((u) => [String(u.id ?? u.user_id), u])), [users])

  // Derive current user from localStorage (to show as "Prepared by")
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null
    try {
      const userId = localStorage.getItem("user_id")
      if (userId) {
        const user = users.find(u => String(u.id ?? u.user_id) === String(userId))
        if (user) return user
      }
      const stored = localStorage.getItem("auth_user") || localStorage.getItem("user")
      if (stored) {
        try { return JSON.parse(stored) } catch {}
      }
      return null
    } catch {
      return null
    }
  }, [users])

  const generatedBy =
    currentUser?.username ||
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.email ||
    "System User"

  // Filters
  const [period, setPeriod] = useState("month") // "month" | "week"
  const [seasonYear, setSeasonYear] = useState("")  // empty = all
  const [seasonName, setSeasonName] = useState("")  // empty = all
  const [inputType, setInputType] = useState("")    // empty = all
  const [query, setQuery] = useState("")            // product/crop/brand search
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showBreakdown, setShowBreakdown] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // Filter records first (by season/date/type/search), then group by period
  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sd = startDate ? new Date(`${startDate}T00:00:00Z`) : null
    const ed = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null

    return (usages || []).filter((u) => {
      if (seasonYear && String(u.season_year) !== String(seasonYear)) return false
      if (seasonName && String(u.season_name) !== String(seasonName)) return false
      if (inputType && u.input_type !== inputType) return false

      if (sd || ed) {
        const d = parseYMD(u.application_date)
        if (!d) return false
        if (sd && d < sd) return false
        if (ed && d > ed) return false
      }

      if (q) {
        const hay = [
          u.product_name,
          u.crop,
          u.brand,
          u.field_name,
          u.input_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!hay.includes(q)) return false
      }

      return true
    })
  }, [usages, seasonYear, seasonName, inputType, startDate, endDate, query])

  const rows = useMemo(() => groupUsagesByPeriod(filteredRecords, period), [filteredRecords, period])

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.totalCost += r.totalCost
        acc.count += r.count
        acc.byType.fertilizer += r.byType.fertilizer
        acc.byType.pesticide += r.byType.pesticide
        acc.byType.seed += r.byType.seed
        return acc
      },
      { totalCost: 0, count: 0, byType: { fertilizer: 0, pesticide: 0, seed: 0 } }
    )
  }, [rows])

  // Dynamically choose which breakdown columns to show:
  // - If showBreakdown = false => no breakdown columns.
  // - If inputType is chosen => only that one column.
  // - Otherwise => all three columns.
  const breakdownColumns = useMemo(() => {
    if (!showBreakdown) return []
    return inputType ? [inputType] : ["fertilizer", "pesticide", "seed"]
  }, [showBreakdown, inputType])

  const resetFilters = () => {
    setPeriod("month")
    setSeasonYear("")
    setSeasonName("")
    setInputType("")
    setQuery("")
    setStartDate("")
    setEndDate("")
    setShowBreakdown(true)
  }

  const downloadPDF = async () => {
    if (!rows.length) return
    setIsGenerating(true)
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      const marginLeft = 40
      const headerHeight = 120 // room for logo + header
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Load logo as base64 for reliable embedding
      const logoDataURL = await loadImageAsDataURL(logoPath)

      // Build filters line
      const periodPhrase = period === "month" ? "Monthly" : "Weekly"
      const seasonPhrase =
        seasonYear && seasonName
          ? `for ${seasonYear} ${seasonName}`
          : seasonYear
          ? `for ${seasonYear} (all seasons)`
          : "for all seasons"
      const typePhrase = inputType ? `only ${inputType}` : "all input types"
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
      const qPhrase = query ? `matching "${query}"` : "no text filter"
      const filtersLine = `${periodPhrase} report ${seasonPhrase}, ${typePhrase}, ${datePhrase}, ${qPhrase}`

      // Columns (dynamic breakdown)
      const columns = [
        { header: "Period", dataKey: "period" },
        ...breakdownColumns.map((t) => ({ header: typeLabels[t] || t, dataKey: t })),
        { header: "Total Spent", dataKey: "totalSpent" },
        { header: "Applications", dataKey: "count" },
      ]

      const body = rows.map((r) => {
        const base = {
          period: r.label,
          totalSpent: formatMoney(r.totalCost, currency),
          count: r.count,
        }
        breakdownColumns.forEach((t) => {
          base[t] = formatMoney(r.byType[t] || 0, currency)
        })
        return base
      })

      // Add a total row
      const totalRow = {
        period: "TOTAL",
        totalSpent: formatMoney(totals.totalCost, currency),
        count: totals.count,
      }
      breakdownColumns.forEach((t) => {
        totalRow[t] = formatMoney(totals.byType[t] || 0, currency)
      })
      body.push(totalRow)

      doc.setProperties({
        title: `${systemName} - Inputs Usage Report`,
        subject: "Inputs usage (cost) report",
        creator: systemName,
        author: generatedBy,
      })

      // First page logo
      if (logoDataURL) {
        doc.addImage(logoDataURL, "PNG", marginLeft, 20, 50, 50)
      }

      autoTable(doc, {
        columns,
        body,
        startY: headerHeight,
        margin: { top: headerHeight + 10, bottom: 40, left: marginLeft, right: marginLeft },
        theme: "grid",
        styles: { fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.5 },
        headStyles: { fillColor: [255, 255, 255], textColor: 20 },
        didDrawPage: (data) => {
          if (data.pageNumber > 1 && logoDataURL) {
            doc.addImage(logoDataURL, "PNG", marginLeft, 20, 40, 40)
          }

          const logoWidth = logoDataURL ? 60 : 0
          const textStartX = marginLeft + (logoDataURL ? logoWidth + 15 : 0)

          // Header
          doc.setDrawColor(230)
          doc.line(marginLeft, headerHeight - 12, pageWidth - marginLeft, headerHeight - 12)
          doc.setTextColor(40)
          doc.setFontSize(16)
          doc.text(`${systemName}`, textStartX || marginLeft, 38)
          doc.setFontSize(12)
          doc.text(`Inputs Usage Report`, textStartX || marginLeft, 55)
          doc.setFontSize(10)
          doc.text(`Generated: ${new Date().toLocaleString()}`, textStartX || marginLeft, 72)
          doc.text(`Prepared by: ${generatedBy}`, textStartX || marginLeft, 86)

          // Filters line (wrap within available width)
          const availableWidth = pageWidth - (textStartX || marginLeft) - marginLeft
          const wrapped = doc.splitTextToSize(filtersLine, availableWidth)
          doc.text(wrapped, textStartX || marginLeft, 104)

          // Footer
          doc.setFontSize(9)
          doc.setTextColor(120)
          doc.text(`Page ${data.pageNumber}`, pageWidth - marginLeft - 30, pageHeight - 20)
        },
      })

      const yr = seasonYear || "ALL"
      const sn = seasonName ? seasonName.replace(/\s+/g, "") : "ALL"
      const per = period === "month" ? "Monthly" : "Weekly"
      const sd = startDate ? startDate.replace(/-/g, "") : "ALL"
      const ed = endDate ? endDate.replace(/-/g, "") : "ALL"
      const it = inputType ? inputType.toUpperCase() : "ALL"
      const fileName = `${systemName.replace(/\s+/g, "_")}_Inputs_${per}_${yr}_${sn}_${it}_${sd}_${ed}.pdf`
      doc.save(fileName)
    } finally {
      setIsGenerating(false)
    }
  }

  // Dynamic column count for "No data" message
  const colCount = 1 + breakdownColumns.length + 2 // Period + breakdown + Total + Applications

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
              e.target.style.display = "none"
            }}
          />
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiFilter /> Build Inputs Usage Report
          </h3>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>
            Periods: <span className="font-medium text-gray-700">{rows.length}</span>
            <span className="mx-2 text-gray-300">|</span>
            Records: <span className="font-medium text-gray-700">{filteredRecords.length}</span>
          </div>
          <div className="mt-0.5 text-gray-600">Prepared by: <span className="text-gray-800">{generatedBy}</span></div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Group by</label>
          <div className="bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setPeriod("month")}
              className={`px-3 py-1 rounded-md text-sm ${
                period === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod("week")}
              className={`px-3 py-1 rounded-md text-sm ${
                period === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Season year</label>
          <select
            value={seasonYear}
            onChange={(e) => setSeasonYear(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Season name</label>
          <select
            value={seasonName}
            onChange={(e) => setSeasonName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {seasons.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Input type</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="pesticide">Pesticide</option>
            <option value="seed">Seed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Search (product, crop, brand, field)</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., DAP, maize, Yara…"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
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

        <div className="flex items-center gap-2">
          <input
            id="breakdown"
            type="checkbox"
            checked={showBreakdown}
            onChange={(e) => setShowBreakdown(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="breakdown" className="text-sm text-gray-700">Show breakdown by input type</label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={downloadPDF}
          disabled={!rows.length || isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <FiDownload />
          {isGenerating ? "Generating…" : "Download PDF"}
        </button>

        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <FiFileText /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-3 text-left">Period</th>
              {breakdownColumns.map((t) => (
                <th key={t} className="py-2 px-3 text-left">{typeLabels[t] || t}</th>
              ))}
              <th className="py-2 px-3 text-left">Total Spent</th>
              <th className="py-2 px-3 text-left">Applications</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-4 px-3 text-gray-500" colSpan={colCount}>
                  No data for the selected filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.key} className="border-t hover:bg-green-50 transition">
                  <td className="py-2 px-3">{r.label}</td>
                  {breakdownColumns.map((t) => (
                    <td key={t} className="py-2 px-3">{formatMoney(r.byType[t] || 0, currency)}</td>
                  ))}
                  <td className="py-2 px-3 font-medium">{formatMoney(r.totalCost, currency)}</td>
                  <td className="py-2 px-3">{r.count}</td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 border-t">
                <th className="py-2 px-3 text-left">TOTAL</th>
                {breakdownColumns.map((t) => (
                  <th key={t} className="py-2 px-3 text-left">{formatMoney(totals.byType[t] || 0, currency)}</th>
                ))}
                <th className="py-2 px-3 text-left">{formatMoney(totals.totalCost, currency)}</th>
                <th className="py-2 px-3 text-left">{totals.count}</th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

// Group usages into periods and sum cost
function groupUsagesByPeriod(usages = [], period = "month") {
  const map = new Map()

  for (const u of usages) {
    const dateStr = u.application_date
    const d = parseYMD(dateStr)
    if (!d) continue

    let key, label, sortVal
    if (period === "month") {
      const y = d.getUTCFullYear()
      const m = d.getUTCMonth() + 1
      key = `${y}-${pad2(m)}`
      label = `${monthShort(m)} ${y}`
      sortVal = y * 100 + m
    } else {
      const { isoYear, isoWeek } = getISOWeekInfo(d)
      key = `${isoYear}-W${pad2(isoWeek)}`
      label = `Week ${isoWeek}, ${isoYear}`
      sortVal = isoYear * 100 + isoWeek
    }

    if (!map.has(key)) {
      map.set(key, {
        key,
        label,
        sortVal,
        totalCost: 0,
        count: 0,
        byType: { fertilizer: 0, pesticide: 0, seed: 0 },
      })
    }

    const cost = toNumber(u.cost)
    const rec = map.get(key)
    rec.totalCost += cost
    rec.count += 1
    const t = u.input_type
    if (t && rec.byType[t] !== undefined) {
      rec.byType[t] += cost
    }
  }

  const rows = Array.from(map.values())
  rows.sort((a, b) => b.sortVal - a.sortVal) // newest first
  return rows
}