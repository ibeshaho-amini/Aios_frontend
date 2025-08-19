"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchInbox } from "../../Redux/Recommendation/cropRecommendation"
import {
  FiRefreshCw,
  FiTrendingUp,
  FiPercent,
  FiCalendar,
  FiClock,
  FiFileText,
  FiUserCheck,
  FiDownload,
  FiPieChart,
  FiBarChart2,
} from "react-icons/fi"
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from "recharts"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Import the component
import MyReviewsReport from "../agronomist/report"

// Status colors matching your domain
const STATUS_COLORS = {
  pending_review: "#F59E0B", // amber
  in_review: "#06B6D4",      // cyan
  translated: "#10B981",     // emerald
  returned: "#EF4444",       // red
  other: "#6B7280",          // gray
}

// Utils
const toDateKey = (dateLike) => {
  if (!dateLike) return ""
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}
const fmtDate = (d) => (d ? toDateKey(d) : "—")
const titleCase = (s) => (s ? s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) : "")

export default function AgronomistAnalytics() {
  const dispatch = useDispatch()
  const { inbox = [], isLoading, error } = useSelector((s) => s.recommendation || {})
  const { userInfo } = useSelector((s) => s.auth || {})

  // current user (from localStorage like your inbox page)
  const [currentUserId, setCurrentUserId] = useState(null)
  useEffect(() => {
    setCurrentUserId(localStorage.getItem("user_id") || null)
  }, [])

  // Who prepared this report (for MyReviewsReport)
  const preparedBy = useMemo(
    () => userInfo?.fullnames || userInfo?.username || `User ${currentUserId || ""}`,
    [userInfo, currentUserId]
  )

  // Fetch data
  useEffect(() => {
    dispatch(fetchInbox())
  }, [dispatch])

  // Filters
  const [quickRange, setQuickRange] = useState("30") // 7 | 30 | 90 | custom
  const [startDate, setStartDate] = useState("")     // yyyy-mm-dd
  const [endDate, setEndDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const todayKey = toDateKey(new Date().toISOString())
  const getQuickRangeDates = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (Number(days) - 1))
    return { startKey: toDateKey(start.toISOString()), endKey: toDateKey(end.toISOString()) }
  }
  const rangeKeys = useMemo(() => {
    if (quickRange === "custom") {
      return { startKey: startDate || null, endKey: endDate || null }
    }
    return getQuickRangeDates(quickRange)
  }, [quickRange, startDate, endDate])

  const withinRange = (dKey, sKey, eKey) => {
    if (!dKey) return false
    if (sKey && dKey < sKey) return false
    if (eKey && dKey > eKey) return false
    return true
  }

  // Normalize records (added updated for report/component)
  const normalized = useMemo(() => {
    return (inbox || []).map((r, i) => ({
      id: r.id ?? i,
      ts: r.timestamp ?? r.created_at ?? r.createdAt ?? null,
      updated: r.updated_at ?? r.updatedAt ?? r.reviewed_at ?? null,
      status: r.status || "pending_review",
      agrId: r.agronomist_id ? String(r.agronomist_id) : null,
      agrUser: r.agronomist_username || null,
      crop: r.crop_predicted || r.ai_outputs?.crop_predicted || "Unknown",
    }))
  }, [inbox])

  // Apply filters (main analytics)
  const filtered = useMemo(() => {
    const sKey = rangeKeys.startKey
    const eKey = rangeKeys.endKey || todayKey
    const q = searchTerm.trim().toLowerCase()
    return normalized.filter((r) => {
      const dKey = toDateKey(r.ts)
      if (!withinRange(dKey, sKey, eKey)) return false
      if (filterStatus !== "all" && r.status !== filterStatus) return false
      if (q && !`${r.crop}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [normalized, rangeKeys, todayKey, searchTerm, filterStatus])

  // KPIs (claimed = has agrId OR in_review; reviewed = translated/returned)
  const total = filtered.length
  const newCount = filtered.filter((r) => r.status === "pending_review").length
  const claimedCount = filtered.filter((r) => r.agrId || r.status === "in_review").length
  const reviewedCount = filtered.filter((r) => r.status === "translated" || r.status === "returned").length
  const myClaimedCount = filtered.filter((r) => currentUserId && r.agrId === String(currentUserId)).length
  const myReviewedCount = filtered.filter(
    (r) => currentUserId && r.agrId === String(currentUserId) && (r.status === "translated" || r.status === "returned")
  ).length
  const reviewRate = total ? Math.round((reviewedCount / total) * 100) : 0

  // Charts (main)
  const incomingByDay = useMemo(() => {
    const map = {}
    filtered.forEach((r) => {
      const k = toDateKey(r.ts)
      if (!k) return
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ date: k.slice(5), incoming: v }))
  }, [filtered])

  const statusCounts = useMemo(() => {
    const acc = { pending_review: 0, in_review: 0, translated: 0, returned: 0 }
    filtered.forEach((r) => {
      const key = Object.prototype.hasOwnProperty.call(acc, r.status) ? r.status : "other"
      acc[key] = (acc[key] || 0) + 1
    })
    return acc
  }, [filtered])

  const statusPie = useMemo(() => {
    return Object.entries(statusCounts)
      .filter(([k, v]) => v > 0)
      .map(([k, v]) => ({ name: titleCase(k), value: v, color: STATUS_COLORS[k] || STATUS_COLORS.other }))
  }, [statusCounts])

  const topCrops = useMemo(() => {
    const map = {}
    filtered.forEach((r) => {
      map[r.crop] = (map[r.crop] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [filtered])

  const myVsOthers = useMemo(() => {
    const mineC = myClaimedCount
    const othersC = Math.max(claimedCount - mineC, 0)
    const mineR = myReviewedCount
    const othersR = Math.max(reviewedCount - mineR, 0)
    return [
      { name: "Claimed", mine: mineC, others: othersC },
      { name: "Reviewed", mine: mineR, others: othersR },
    ]
  }, [myClaimedCount, myReviewedCount, claimedCount, reviewedCount])

  // Export (main analytics content area)
  const reportRef = useRef(null)
  const exportCSV = () => {
    const headers = ["id", "crop", "timestamp", "status", "agronomist_id", "agronomist_username"]
    const rows = filtered.map((r) => [r.id, r.crop, fmtDate(r.ts), r.status, r.agrId || "", r.agrUser || ""])
    const csv = [headers.join(","), ...rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agronomist-analytics-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  const exportPDF = async () => {
    const el = reportRef.current
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#FFFFFF" })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width

    let pos = 0
    while (pos < imgH) {
      pdf.addImage(imgData, "PNG", 0, -pos, imgW, imgH)
      pos += pageH
      if (pos < imgH) pdf.addPage()
    }
    pdf.save(`agronomist-analytics-${Date.now()}.pdf`)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header / Filters */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Agronomist Analytics</h1>
            <p className="text-emerald-100 mt-1">Claimed vs reviewed insights from your inbox</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={quickRange}
              onChange={(e) => setQuickRange(e.target.value)}
              className="bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="custom">Custom</option>
            </select>

            {quickRange === "custom" && (
              <>
                <div className="bg-white/10 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiCalendar />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent outline-none text-sm text-white placeholder-white/70"
                    />
                  </div>
                </div>
                <div className="bg-white/10 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiCalendar />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent outline-none text-sm text-white placeholder-white/70"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => dispatch(fetchInbox())}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg text-sm"
              disabled={isLoading}
              title="Refresh"
            >
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg text-sm"
              title="Export CSV"
            >
              <FiDownload />
              CSV
            </button>
            <button
              onClick={exportPDF}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg text-sm"
              title="Export PDF"
            >
              <FiFileText />
              PDF
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
          <KPI title="Total" value={total} icon={<FiFileText />} />
          <KPI title="New" value={newCount} icon={<FiClock />} />
          <KPI title="Claimed" value={claimedCount} icon={<FiUserCheck />} />
          <KPI title="Reviewed" value={reviewedCount} icon={<FiTrendingUp />} />
          <KPI title="My Claimed" value={myClaimedCount} icon={<FiUserCheck />} />
          <KPI title="Review Rate" value={`${reviewRate}%`} icon={<FiPercent />} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {typeof error === "string" ? error : error?.detail || "Failed to load analytics"}
        </div>
      )}

      {/* Filters: search + status */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by crop..."
          className="px-3 py-2 border rounded-lg text-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending_review">Pending</option>
          <option value="in_review">In review</option>
          <option value="translated">Translated</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Report content (captured into PDF) */}
      <div ref={reportRef} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incoming over time */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <FiBarChart2 className="text-emerald-600" />
              <h2 className="font-semibold text-gray-800">Incoming Over Time</h2>
            </div>
            <div className="p-4 h-72">
              {incomingByDay.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomingByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="incoming" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center text-gray-500">No data</div>
              )}
            </div>
          </div>

          {/* Status pie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <FiPieChart className="text-emerald-600" />
              <h2 className="font-semibold text-gray-800">Status Distribution</h2>
            </div>
            <div className="p-4 h-72">
              {statusPie.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPie} innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={4}>
                      {statusPie.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center text-gray-500">No data</div>
              )}
            </div>
            {statusPie.length > 0 && (
              <div className="p-4 grid grid-cols-2 gap-2">
                {statusPie.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.name}</span>
                    </div>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top crops + My vs Others */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top crops */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Top Crops</h2>
            </div>
            <div className="p-4 h-72">
              {topCrops.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCrops}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center text-gray-500">No data</div>
              )}
            </div>
          </div>

          {/* My vs Others */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">My Activity vs Others</h2>
            </div>
            <div className="p-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={myVsOthers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mine" name="Mine" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="others" name="Others" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* My Reviews Report (component) */}
        <MyReviewsReport
          normalizedRecords={normalized}
          currentUserId={currentUserId}
          preparedBy={preparedBy}
          title="My Reviews Report"
          brand="AIOS Agronomist"
          months={6}
          weeks={8}
        />
      </div>
    </div>
  )
}

// KPI card
const KPI = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold mt-1 text-gray-900">{value}</div>
      </div>
      <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800">
        {icon}
      </div>
    </div>
  </div>
)