"use client"

import React, { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { listOrders } from "../../Redux/order/orderSlice"
import {
  FiRefreshCw,
  FiShoppingCart,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiBox,
  FiArrowRight
} from "react-icons/fi"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts"

const COLORS = {
  pending: "#F59E0B",      // amber-500
  approved: "#10B981",     // emerald-500
  processing: "#34D399",   // emerald-400
  completed: "#16A34A",    // green-600
  rejected: "#DC2626",     // red-600
  cancelled: "#DC2626",    // red-600
  other: "#6B7280",        // gray-500
}

const fmtRWF = (value) => {
  const n = Number(value || 0)
  try {
    return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(n)
  } catch {
    return `RWF ${n.toLocaleString()}`
  }
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
      label: d.toLocaleDateString("default", { weekday: "short" }),
    })
  }
  return arr
}

const calcOrderTotal = (order) => {
  if (order?.total != null) return Number(order.total)
  const items = order?.items || []
  return items.reduce((sum, it) => {
    const price = it?.price_at_order != null ? Number(it.price_at_order) : 0
    const qty = Number(it.quantity || 0)
    return sum + price * qty
  }, 0)
}

const SupplierOverview = () => {
  const dispatch = useDispatch()
  const { orders = [], isLoading, error } = useSelector((s) => s.order || {})
  const { userInfo, userId } = useSelector((s) => s.auth || {})

  useEffect(() => {
    dispatch(listOrders())
  }, [dispatch])

  // Identify current supplier (username/id)
  const supplierUsername = (userInfo?.username || userInfo?.user_name || "").toLowerCase()
  const myOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const supName = (o?.supplier_username || o?.supplier_name || o?.supplier || "").toString().toLowerCase()
      const supId = Number(o?.supplier_id || o?.supplier)
      return (supplierUsername && supName === supplierUsername) || (userId && supId === Number(userId))
    })
  }, [orders, supplierUsername, userId])

  // Status counts
  const statusCounts = useMemo(() => {
    const acc = {}
    myOrders.forEach((o) => {
      const st = (o?.status || "other").toLowerCase()
      acc[st] = (acc[st] || 0) + 1
    })
    return acc
  }, [myOrders])

  const newPending = (statusCounts.pending || 0)
  const approved = (statusCounts.approved || 0) + (statusCounts.processing || 0)
  const completed = (statusCounts.completed || 0)

  // Revenue (last 30 days, completed only)
  const revenue30d = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - 30)
    return myOrders
      .filter((o) => (o?.status || "").toLowerCase() === "completed")
      .filter((o) => {
        const created = new Date(o?.created_at || o?.orderDate)
        return !isNaN(created) && created >= cutoff
      })
      .reduce((sum, o) => sum + calcOrderTotal(o), 0)
  }, [myOrders])

  // Pie data
  const pieData = useMemo(() => {
    const keys = Object.keys(statusCounts)
    if (!keys.length) return []
    return keys.map((k) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      value: statusCounts[k],
      color: COLORS[k] || COLORS.other,
    }))
  }, [statusCounts])

  // Orders last 7 days
  const dailyData = useMemo(() => {
    const days = lastNDays(7)
    const counts = myOrders.reduce((acc, o) => {
      const key = toDateKey(o?.created_at || o?.orderDate)
      if (!key) return acc
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return days.map((d) => ({ name: d.label, orders: counts[d.key] || 0 }))
  }, [myOrders])

  // Top products
  const topProducts = useMemo(() => {
    const map = {}
    myOrders.forEach((o) => {
      (o?.items || []).forEach((it) => {
        const name = it?.product_name || `#${it?.product}` || "Unknown"
        const qty = Number(it?.quantity || 0)
        map[name] = (map[name] || 0) + qty
      })
    })
    const arr = Object.entries(map).map(([name, qty]) => ({ name, qty }))
    arr.sort((a, b) => b.qty - a.qty)
    return arr.slice(0, 5)
  }, [myOrders])

  const recentOrders = useMemo(() => {
    const sorted = [...myOrders].sort((a, b) => {
      const da = new Date(a?.created_at || a?.orderDate)
      const db = new Date(b?.created_at || b?.orderDate)
      return db - da
    })
    return sorted.slice(0, 5)
  }, [myOrders])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome / KPIs */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userInfo?.fullnames || userInfo?.username || "Supplier"} 👋</h1>
            <p className="text-emerald-100 mt-1">Here’s a quick look at your orders and performance</p>
          </div>
          <button
            onClick={() => dispatch(listOrders())}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg text-sm"
            disabled={isLoading}
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* KPI cards (high-contrast) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <KPI
            icon={<FiClock />}
            title="New / Pending"
            value={newPending}
            chipClass="bg-amber-100 text-amber-800"
          />
          <KPI
            icon={<FiTrendingUp />}
            title="Approved / Processing"
            value={approved}
            chipClass="bg-emerald-100 text-emerald-800"
          />
          <KPI
            icon={<FiCheckCircle />}
            title="Completed"
            value={completed}
            chipClass="bg-green-100 text-green-800"
          />
          <KPI
            icon={<FiShoppingCart />}
            title="Revenue (30d)"
            value={fmtRWF(revenue30d)}
            chipClass="bg-emerald-100 text-emerald-800"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {typeof error === "string" ? error : error.detail || "Failed to load orders"}
        </div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Orders + Top Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Recent Orders</h2>
              <Link to="/supplier-dashboard/suppOrders" className="text-emerald-600 text-sm inline-flex items-center gap-1">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : recentOrders.length ? (
                recentOrders.map((o) => (
                  <div key={o.orderID} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">Order #{o.orderID}</div>
                        <div className="text-sm text-gray-600">
                          {(o.items || []).map((it) => it.product_name || it.name).filter(Boolean).join(", ") || "Various items"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(o.created_at || o.orderDate).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          (o.status || "").toLowerCase() === "completed" ? "bg-green-100 text-green-800" :
                          (o.status || "").toLowerCase() === "pending" ? "bg-amber-100 text-amber-800" :
                          (o.status || "").toLowerCase() === "approved" || (o.status || "").toLowerCase() === "processing" ? "bg-emerald-100 text-emerald-800" :
                          (o.status || "").toLowerCase() === "rejected" || (o.status || "").toLowerCase() === "cancelled" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {(o.status || "—").toUpperCase()}
                        </span>
                        <div className="font-semibold mt-1">{fmtRWF(calcOrderTotal(o))}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No orders yet</div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Top Products</h2>
              <Link to="/supplier-dashboard/products" className="text-emerald-600 text-sm inline-flex items-center gap-1">
                Manage <FiArrowRight />
              </Link>
            </div>
            <div className="p-4">
              {topProducts.length ? (
                <div className="space-y-3">
                  {topProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                          <FiBox />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-500">Quantity sold</div>
                        </div>
                      </div>
                      <div className="text-right font-semibold">{p.qty}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No product sales data yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Charts */}
        <div className="space-y-6">
          {/* Status Pie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Order Status</h2>
            </div>
            <div className="p-4 h-64">
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={4}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">No data</div>
              )}
            </div>
            {pieData.length > 0 && (
              <div className="p-4 grid grid-cols-2 gap-2">
                {pieData.map((s, i) => (
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

          {/* Orders last 7 days */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Orders (Last 7 days)</h2>
            </div>
            <div className="p-4 h-64">
              {dailyData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">No data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const KPI = ({ icon, title, value, chipClass }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold mt-1 text-gray-900">{value}</div>
      </div>
      <div className={`p-3 rounded-lg ${chipClass}`}>
        {icon}
      </div>
    </div>
  </div>
)

export default SupplierOverview