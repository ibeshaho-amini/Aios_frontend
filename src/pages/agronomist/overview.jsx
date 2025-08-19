"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchInbox, getMyReviews } from "../../Redux/Recommendation/cropRecommendation"
import {
  FiRefreshCw, FiInbox, FiUserCheck, FiCheckCircle, FiClock,
  FiTrendingUp, FiAlertCircle, FiChevronRight, FiUsers
} from "react-icons/fi"
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar
} from "recharts"

const COLORS = {
  pending_review: "#F59E0B", // amber
  in_review: "#3B82F6",      // blue
  translated: "#16A34A",     // green
  returned: "#10B981",       // emerald
  other: "#6B7280",
}

const toDateKey = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}
const lastNDays = (n) => {
  const arr = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    arr.push({
      key: toDateKey(d.toISOString()),
      label: d.toLocaleDateString("default", { weekday: "short" })
    })
  }
  return arr
}
const hoursBetween = (start, end) => {
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s) || isNaN(e)) return null
  return Math.max(0, (e - s) / (1000 * 60 * 60))
}

const AgronomistOverview = () => {
  const dispatch = useDispatch()
  const { inbox = [], myReviewed = [], isLoading, error } = useSelector((s) => s.recommendation || {})
  const { userId, userInfo } = useSelector((s) => s.auth || {})

  const myId = String(userId || (userInfo?.id ?? ""))

  useEffect(() => {
    dispatch(fetchInbox())
    dispatch(getMyReviews())
  }, [dispatch])

  // Split data
  const pending = useMemo(
    () => (inbox || []).filter(r => (r.status || "").toLowerCase() === "pending_review"),
    [inbox]
  )
  const mineInReview = useMemo(
    () => (inbox || []).filter(r =>
      (r.status || "").toLowerCase() === "in_review" &&
      String(r.agronomist_id || r.agronomist) === myId
    ),
    [inbox, myId]
  )
  const mineCompleted = useMemo(
    () => (myReviewed || []).filter(r =>
      ["translated", "returned"].includes((r.status || "").toLowerCase()) &&
      String(r.agronomist_id || r.agronomist) === myId
    ),
    [myReviewed, myId]
  )

  // KPIs
  const backlogCount = pending.length
  const inReviewCount = mineInReview.length

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const completed30d = mineCompleted.filter(r => {
    const d = new Date(r.updated_at || r.timestamp)
    return !isNaN(d) && d >= thirtyDaysAgo
  }).length

  // Average turnaround (submission → completion) for my completed items
  const turnaroundHours = useMemo(() => {
    const durations = mineCompleted.map(r => hoursBetween(r.timestamp, r.updated_at || r.timestamp)).filter(v => v != null)
    if (!durations.length) return 0
    return Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
  }, [mineCompleted])

  // Throughput (last 7 days) from myReviewed completion date
  const throughput7 = useMemo(() => {
    const days = lastNDays(7)
    const counts = mineCompleted.reduce((acc, r) => {
      const k = toDateKey(r.updated_at || r.timestamp)
      if (!k) return acc
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})
    return days.map(d => ({ name: d.label, count: counts[d.key] || 0 }))
  }, [mineCompleted])

  // Workload by status for "my" items (pending/in_review from inbox + my completed)
  const myWorkStatusCounts = useMemo(() => {
    const acc = { pending_review: 0, in_review: 0, translated: 0, returned: 0 }
    pending.forEach(() => acc.pending_review++)
    mineInReview.forEach(() => acc.in_review++)
    mineCompleted.forEach(r => {
      const st = (r.status || "other").toLowerCase()
      if (st === "translated") acc.translated++
      else if (st === "returned") acc.returned++
    })
    return acc
  }, [pending, mineInReview, mineCompleted])

  const statusPie = useMemo(() => {
    return Object.entries(myWorkStatusCounts)
      .map(([k, v]) => ({
        name: k.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()),
        value: v,
        color: COLORS[k] || COLORS.other
      }))
      .filter(s => s.value > 0)
  }, [myWorkStatusCounts])

  // Incoming by crop (from inbox)
  const cropCounts = useMemo(() => {
    const map = {}
    ;(inbox || []).forEach(r => {
      const crop = r.crop_predicted || r.ai_outputs?.crop_predicted || "Unknown"
      map[crop] = (map[crop] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [inbox])

  // Oldest waiting (pending only)
  const oldestPending = useMemo(() => {
    const arr = [...pending].sort((a, b) => {
      const da = new Date(a.timestamp)
      const db = new Date(b.timestamp)
      return da - db
    })
    return arr.slice(0, 5)
  }, [pending])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Agronomist Dashboard</h1>
            <p className="text-emerald-100 mt-1">Track your review workload and progress</p>
          </div>
          <button
            onClick={() => {
              dispatch(fetchInbox())
              dispatch(getMyReviews())
            }}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg text-sm"
            disabled={isLoading}
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <KPI title="Backlog" value={backlogCount} icon={<FiInbox />} chip="bg-amber-100 text-amber-800" />
          <KPI title="In Review" value={inReviewCount} icon={<FiUserCheck />} chip="bg-blue-100 text-blue-800" />
          <KPI title="Completed (30d)" value={completed30d} icon={<FiCheckCircle />} chip="bg-green-100 text-green-800" />
          <KPI title="Avg Turnaround" value={`${turnaroundHours} h`} icon={<FiClock />} chip="bg-emerald-100 text-emerald-800" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <FiAlertCircle className="inline mr-2" />
          {typeof error === "string" ? error : error.detail || "Failed to load data"}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Throughput over last 7 days */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Throughput (Last 7 days)</h2>
          </div>
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughput7}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload by status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">My Work by Status</h2>
          </div>
          <div className="p-4 h-72">
            {statusPie.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie} innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={4}>
                    {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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

      {/* Crop distribution + Oldest pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming by crop */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Incoming by Crop</h2>
          </div>
          <div className="p-4 h-72">
            {cropCounts.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropCounts}>
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

        {/* Oldest waiting items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Oldest Waiting</h2>
          </div>
          <div className="p-2">
            {oldestPending.length ? (
              oldestPending.map((r) => {
                const ageHrs = hoursBetween(r.timestamp, new Date())
                const ageTxt = ageHrs >= 24 ? `${Math.floor(ageHrs / 24)}d ${Math.floor(ageHrs % 24)}h` : `${Math.floor(ageHrs)}h`
                return (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-800">{r.crop_predicted || r.ai_outputs?.crop_predicted || "Unknown crop"}</div>
                      <div className="text-xs text-gray-500">
                        Farmer: {r.user_username || r.user || "—"} • Submitted: {new Date(r.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded">{ageTxt}</div>
                  </div>
                )
              })
            ) : (
              <div className="p-4 text-center text-gray-500">No pending items</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
          <a href="/agronomist-dashboard/myReviews" className="text-emerald-600 text-sm inline-flex items-center gap-1">
            View My Reviews <FiChevronRight />
          </a>
        </div>
        <div className="divide-y">
          {(mineCompleted.slice(0, 5)).map((r, idx) => (
            <div key={r.id || idx} className="p-4 flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-800">
                  {r.status === "translated" ? "Translated" : "Returned"}: {r.crop_predicted || r.ai_outputs?.crop_predicted || "Unknown crop"}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(r.updated_at || r.timestamp).toLocaleString()}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                (r.status || "").toLowerCase() === "translated" ? "bg-green-100 text-green-800" :
                "bg-emerald-100 text-emerald-800"
              }`}>
                {(r.status || "").replace("_", " ")}
              </span>
            </div>
          ))}
          {!mineCompleted.length && (
            <div className="p-4 text-center text-gray-500">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  )
}

const KPI = ({ title, value, icon, chip }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold mt-1 text-gray-900">{value}</div>
      </div>
      <div className={`p-3 rounded-lg ${chip}`}>{icon}</div>
    </div>
  </div>
)

export default AgronomistOverview