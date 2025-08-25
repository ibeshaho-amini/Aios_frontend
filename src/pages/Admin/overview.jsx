"use client"

import React, { useEffect, useMemo, useState } from "react"
import { FiTrendingUp, FiMessageSquare, FiAlertCircle, FiCheckCircle, FiPieChart, FiFilter, FiRefreshCw } from "react-icons/fi"
import axios from "../../Redux/axiosInstance"

// Charts
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Doughnut } from "react-chartjs-2"

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

// Helpers
const toDate = (d) => {
  if (!d) return null
  const t = new Date(d)
  return isNaN(t) ? null : t
}
const fmtDay = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const lastNDaysLabels = (days = 7) => {
  const labels = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    labels.push(fmtDay(d))
  }
  return labels
}

const groupByDay = (arr, dateField, days = 7) => {
  const labels = lastNDaysLabels(days)
  const map = Object.fromEntries(labels.map((l) => [l, 0]))
  arr.forEach((item) => {
    const dt = toDate(item[dateField])
    if (!dt) return
    const key = fmtDay(dt)
    if (map[key] !== undefined) map[key] += 1
  })
  return { labels, data: labels.map((l) => map[l]) }
}

export default function AdminFeedbackOverview() {
  // Filters and range
  const [role, setRole] = useState("all") // all | farmer | supplier
  const [days, setDays] = useState(14)

  // Local state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])

  // Derived counts (simple, fast)
  const counts = useMemo(() => {
    const total = items.length
    const byStatus = items.reduce(
      (acc, f) => {
        const s = String(f.status || "new").toLowerCase()
        acc[s] = (acc[s] || 0) + 1
        return acc
      },
      { new: 0, reviewed: 0, responded: 0 }
    )
    return {
      total,
      new: byStatus.new || 0,
      reviewed: byStatus.reviewed || 0,
      responded: byStatus.responded || 0,
    }
  }, [items])

  const unresolved = counts.new + counts.reviewed
  const responseRate = counts.total ? Math.round((counts.responded / counts.total) * 100) : 0

  // Trend series (by created_at)
  const createdSeries = useMemo(() => groupByDay(items, "created_at", days), [items, days])

  // Charts data
  const donutData = useMemo(
    () => ({
      labels: ["New", "Reviewed", "Responded"],
      datasets: [
        {
          data: [counts.new, counts.reviewed, counts.responded],
          backgroundColor: ["#FCD34D", "#93C5FD", "#86EFAC"],
          borderWidth: 1,
        },
      ],
    }),
    [counts]
  )

  const trendData = useMemo(
    () => ({
      labels: createdSeries.labels.map((d) => d.slice(5)),
      datasets: [
        {
          label: "New Feedback",
          data: createdSeries.data,
          borderColor: "#22C55E",
          backgroundColor: "rgba(34,197,94,0.2)",
          tension: 0.3,
        },
      ],
    }),
    [createdSeries]
  )

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Pull a single page with a generous size for the overview; filter by role if chosen
      const params = {
        page: 1,
        page_size: 1000,
      }
      if (role !== "all") params.role = role
      const res = await axios.get("/feedbacks/", { params })
      const list = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setItems(list)
    } catch (e) {
      setError(e?.response?.data || e?.message || "Failed to load feedback")
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  const filtersLabel = `${role === "all" ? "all roles" : role}`

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 flex items-center gap-2">
          <FiTrendingUp className="text-green-600" /> Admin Overview
        </h1>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="farmer">Farmer</option>
            <option value="supplier">Supplier</option>
          </select>

          <label className="text-sm text-gray-600">Range</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>

          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            title="Refresh"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {typeof error === "string" ? error : error?.detail || "Failed to load summary"}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FiMessageSquare />}
          title="Total Feedback"
          value={counts.total}
          chip={`Filters: ${filtersLabel}`}
          color="bg-emerald-50 text-emerald-700"
          loading={isLoading}
        />
        <StatCard
          icon={<FiAlertCircle />}
          title="Unresolved"
          value={unresolved}
          chip="New + Reviewed"
          color="bg-yellow-50 text-yellow-700"
          loading={isLoading}
        />
        <StatCard
          icon={<FiCheckCircle />}
          title="Responded"
          value={counts.responded}
          chip={`${responseRate}% response rate`}
          color="bg-blue-50 text-blue-700"
          loading={isLoading}
        />
        <StatCard
          icon={<FiPieChart />}
          title="Reviewed"
          value={counts.reviewed}
          chip="Awaiting final response"
          color="bg-purple-50 text-purple-700"
          loading={isLoading}
        />
      </div>

      {/* Charts (compact) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiPieChart /> Feedback by Status
          </h3>
          <Doughnut data={donutData} />
        </div>

        <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-3">New Feedback Trend</h3>
          <Line data={trendData} />
        </div>
      </div>

      {/* Mini breakdown */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Quick Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <BreakdownPill label="New" value={counts.new} color="bg-amber-50 text-amber-700 border-amber-200" />
          <BreakdownPill label="Reviewed" value={counts.reviewed} color="bg-blue-50 text-blue-700 border-blue-200" />
          <BreakdownPill label="Responded" value={counts.responded} color="bg-emerald-50 text-emerald-700 border-emerald-200" />
          <BreakdownPill label="Total" value={counts.total} color="bg-gray-50 text-gray-700 border-gray-200" />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Summary view based on recent data. Visit the Feedback page for full management.
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, chip, color, loading }) {
  return (
    <div className="rounded-xl shadow bg-white p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`text-2xl ${color} p-2 rounded-lg`}>{icon}</div>
        <div className="text-2xl font-bold text-gray-800">
          {loading ? <span className="inline-block h-6 w-12 bg-gray-100 rounded animate-pulse" /> : value ?? 0}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {chip && <p className="text-xs text-gray-500 mt-1">{chip}</p>}
      </div>
    </div>
  )
}

function BreakdownPill({ label, value, color }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${color}`}>
      <span className="font-medium">{label}</span>
      <span className="text-gray-800">{value ?? 0}</span>
    </div>
  )
}