"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  FiUsers,
  FiCheckCircle,
  FiBell,
  FiShoppingCart,
  FiTrendingUp,
  FiPieChart,
} from "react-icons/fi"

import { fetchAllUsers } from "../../Redux/authentication/userSlice"
import { fetchAllAgronomistRecommendations } from "../../Redux/Recommendation/reviews"
import { fetchInbox } from "../../Redux/Recommendation/cropRecommendation"
import axios from "../../Redux/axiosInstance"
import ReportBuilder from "./reportComponent" 

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Doughnut, Bar } from "react-chartjs-2"

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
)

const roleColors = {
  admin: "bg-gray-200 text-gray-800",
  supplier: "bg-blue-100 text-blue-700",
  farmer: "bg-green-100 text-green-700",
  agronomist: "bg-purple-100 text-purple-700",
  leader: "bg-orange-100 text-orange-700",
}

const SYSTEM_NAME = "AIOS"

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

export default function AdminAnalyticsDashboard() {
  const dispatch = useDispatch()
  const [days, setDays] = useState(7)

  // Redux state
  const usersState = useSelector((s) => s.users || {})
  const recommendState = useSelector((s) => s.recommendation || s.recommend || {})
  const users = usersState.users || []
  const recs =
    (Array.isArray(recommendState.allRecommendations) && recommendState.allRecommendations.length > 0
      ? recommendState.allRecommendations
      : recommendState.inbox) || []

  // Optional orders
  const [ordersRaw, setOrdersRaw] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchAllUsers())
    if (typeof fetchAllAgronomistRecommendations === "function") {
      dispatch(fetchAllAgronomistRecommendations())
    }
    dispatch(fetchInbox())

    let ignore = false
    ;(async () => {
      try {
        setOrdersLoading(true)
        const res = await axios.get("/orders/")
        if (!ignore) {
          const data = Array.isArray(res.data) ? res.data : res.data?.results || []
          setOrdersRaw(data)
        }
      } catch {
        try {
          const res2 = await axios.get("/orders/admin/summary/")
          if (!ignore) {
            const list = res2.data?.orders || []
            setOrdersRaw(Array.isArray(list) ? list : [])
          }
        } catch {
          if (!ignore) setOrdersRaw([])
        }
      } finally {
        if (!ignore) setOrdersLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [dispatch])

  // Derived metrics
  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        const role = String(u.role || "unknown").toLowerCase()
        acc[role] = (acc[role] || 0) + 1
        return acc
      },
      { admin: 0, farmer: 0, supplier: 0, agronomist: 0, leader: 0, unknown: 0 }
    )
  }, [users])

  const recStatusCounts = useMemo(() => {
    return recs.reduce(
      (acc, r) => {
        const s = r.status || "unknown"
        acc[s] = (acc[s] || 0) + 1
        return acc
      },
      { pending_review: 0, in_review: 0, translated: 0, returned: 0, unknown: 0 }
    )
  }, [recs])

  const totalReviews = useMemo(
    () => recs.filter((r) => ["translated", "returned"].includes(r.status)).length,
    [recs]
  )

  const newRecs = recStatusCounts.pending_review || 0
  const totalUsers = users.length

  const topAgronomists = useMemo(() => {
    const counts = {}
    for (const r of recs) {
      if (!["translated", "returned"].includes(r.status)) continue
      const who = r.agronomist_username || r.agronomist_id || "Unknown"
      counts[who] = (counts[who] || 0) + 1
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [recs])

  const recCreatedSeries = useMemo(() => {
    const normalized = recs.map((r) => ({ ...r, _created: r.timestamp || r.created_at }))
    return groupByDay(normalized, "_created", days)
  }, [recs, days])

  const reviewsSeries = useMemo(() => {
    const reviewed = recs
      .filter((r) => ["translated", "returned"].includes(r.status))
      .map((r) => ({
        ...r,
        _reviewed: r.reviewed_at || r.updated_at || r.timestamp || r.created_at,
      }))
    return groupByDay(reviewed, "_reviewed", days)
  }, [recs, days])

  const ordersCount = ordersRaw.length
  const ordersRevenue = useMemo(
    () => ordersRaw.reduce((sum, o) => sum + Number(o.total || o.amount || o.total_amount || 0), 0),
    [ordersRaw]
  )
  const ordersSeries = useMemo(() => groupByDay(ordersRaw, "created_at", days), [ordersRaw, days])

  // Charts data
  const doughnutData = {
    labels: ["Pending", "In Review", "Translated", "Returned"],
    datasets: [
      {
        data: [
          recStatusCounts.pending_review || 0,
          recStatusCounts.in_review || 0,
          recStatusCounts.translated || 0,
          recStatusCounts.returned || 0,
        ],
        backgroundColor: ["#FDE68A", "#93C5FD", "#86EFAC", "#FCA5A5"],
        borderWidth: 1,
      },
    ],
  }

  const trendLineData = {
    labels: recCreatedSeries.labels.map((d) => d.slice(5)),
    datasets: [
      {
        label: "New Recommendations",
        data: recCreatedSeries.data,
        borderColor: "#34D399",
        backgroundColor: "rgba(52,211,153,0.2)",
        tension: 0.3,
      },
      {
        label: "Reviews Completed",
        data: reviewsSeries.data,
        borderColor: "#60A5FA",
        backgroundColor: "rgba(96,165,250,0.2)",
        tension: 0.3,
      },
    ],
  }

  const usersByRoleData = {
    labels: ["Admin", "Farmer", "Supplier", "Agronomist", "Leader"],
    datasets: [
      {
        label: "Users",
        data: [
          roleCounts.admin || 0,
          roleCounts.farmer || 0,
          roleCounts.supplier || 0,
          roleCounts.agronomist || 0,
          roleCounts.leader || 0,
        ],
        backgroundColor: ["#9CA3AF", "#86EFAC", "#93C5FD", "#C4B5FD", "#FDBA74"],
      },
    ],
  }

  const ordersLineData = {
    labels: ordersSeries.labels.map((d) => d.slice(5)),
    datasets: [
      {
        label: "Orders",
        data: ordersSeries.data,
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245,158,11,0.2)",
        tension: 0.3,
      },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 flex items-center gap-2">
          <FiTrendingUp className="text-green-600" /> Admin Analytics
        </h1>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Chart Range:</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FiUsers />} title="Total Users" value={totalUsers} chip="All roles" color="bg-emerald-50 text-emerald-700" />
        <StatCard icon={<FiCheckCircle />} title="Total Reviews" value={totalReviews} chip="Translated + Returned" color="bg-blue-50 text-blue-700" />
        <StatCard icon={<FiBell />} title="New Recs" value={newRecs} chip="Pending review" color="bg-yellow-50 text-yellow-700" />
        <StatCard
          icon={<FiShoppingCart />}
          title="Orders"
          value={ordersCount}
          chip={ordersLoading ? "Loading…" : `Revenue: ${ordersRevenue.toLocaleString()}`}
          color="bg-orange-50 text-orange-700"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiPieChart /> Recommendations by Status
          </h3>
          <Doughnut data={doughnutData} />
        </div>

        <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-3">Recommendations & Reviews Trend</h3>
          <Line data={trendLineData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Users by Role</h3>
          <Bar data={usersByRoleData} />
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(roleCounts).map(([role, count]) => (
              <span
                key={role}
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  roleColors[role] || "bg-gray-100 text-gray-700"
                }`}
              >
                {role}: {count}
              </span>
            ))}
          </div>
        </div>

        {ordersCount > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Orders Trend</h3>
            <Line data={ordersLineData} />
            <p className="text-sm text-gray-500 mt-2">
              Total revenue: <span className="font-semibold text-gray-700">{ordersRevenue.toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>

      {/* Top Agronomists */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Top Agronomists by Reviews</h3>
        {topAgronomists.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Agronomist</th>
                  <th className="py-2 px-3 text-left">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {topAgronomists.slice(0, 8).map((a, idx) => (
                  <tr key={`${a.name}-${idx}`} className="border-t hover:bg-green-50 transition">
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3">{a.name}</td>
                    <td className="py-2 px-3">{a.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Builder Section */}
      <ReportBuilder recs={recs} users={users} systemName={SYSTEM_NAME} />
    </div>
  )
}

function StatCard({ icon, title, value, chip, color }) {
  return (
    <div className="rounded-xl shadow bg-white p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`text-2xl ${color} p-2 rounded-lg`}>{icon}</div>
        <div className="text-2xl font-bold text-gray-800">{value ?? 0}</div>
      </div>
      <div className="mt-2">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {chip && <p className="text-xs text-gray-500 mt-1">{chip}</p>}
      </div>
    </div>
  )
}