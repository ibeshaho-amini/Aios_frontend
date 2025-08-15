"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { listOrders } from "../../Redux/order/orderSlice"
import {
  FiRefreshCw,
  FiTrendingUp,
  FiShoppingCart,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiUsers
} from "react-icons/fi"
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar
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

const SupplierAnalytics = () => {
  const dispatch = useDispatch()
  const { orders = [], isLoading, error } = useSelector((s) => s.order || {})
  const { userInfo, userId } = useSelector((s) => s.auth || {})

  // Filters: date range + quick range
  const [quickRange, setQuickRange] = useState("30") // 7 | 30 | 90 | custom
  const [startDate, setStartDate] = useState("")     // yyyy-mm-dd
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    dispatch(listOrders())
  }, [dispatch])

  // Identify current supplier
  const supplierUsername = (userInfo?.username || userInfo?.user_name || "").toLowerCase()
  const myOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const supName = (o?.supplier_username || o?.supplier_name || o?.supplier || "").toString().toLowerCase()
      const supId = Number(o?.supplier_id || o?.supplier)
      return (supplierUsername && supName === supplierUsername) || (userId && supId === Number(userId))
    })
  }, [orders, supplierUsername, userId])

  // Date range logic
  const todayKey = toDateKey(new Date().toISOString())

  const getQuickRangeDates = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (Number(days) - 1))
    return {
      startKey: toDateKey(start.toISOString()),
      endKey: toDateKey(end.toISOString())
    }
  }

  const withinRange = (dKey, sKey, eKey) => {
    if (!dKey) return false
    if (sKey && dKey < sKey) return false
    if (eKey && dKey > eKey) return false
    return true
  }

  const rangeKeys = useMemo(() => {
    if (quickRange === "custom") {
      return { startKey: startDate || null, endKey: endDate || null }
    }
    const { startKey, endKey } = getQuickRangeDates(quickRange)
    return { startKey, endKey }
  }, [quickRange, startDate, endDate])

  // Filtered orders by date
  const filteredOrders = useMemo(() => {
    const sKey = rangeKeys.startKey
    const eKey = rangeKeys.endKey || todayKey
    return myOrders.filter((o) => {
      const dateVal = o?.created_at || o?.orderDate
      const dKey = toDateKey(dateVal)
      return withinRange(dKey, sKey, eKey)
    })
  }, [myOrders, rangeKeys])

  // Helpers
  const orderTotal = (o) => {
    if (o?.total != null) return Number(o.total)
    return (o?.items || []).reduce((sum, it) => {
      const price = it?.price_at_order != null ? Number(it.price_at_order) : 0
      return sum + price * Number(it.quantity || 0)
    }, 0)
  }

  // KPIs
  const totalRevenue = useMemo(() => filteredOrders.reduce((sum, o) => sum + orderTotal(o), 0), [filteredOrders])
  const totalOrders = filteredOrders.length
  const completedCount = filteredOrders.filter(o => (o.status || "").toLowerCase() === "completed").length
  const completionRate = totalOrders ? Math.round((completedCount / totalOrders) * 100) : 0
  const aov = totalOrders ? Math.round(totalRevenue / totalOrders) : 0

  // Sales (Revenue) over time
  const revenueByDay = useMemo(() => {
    const map = {}
    filteredOrders.forEach(o => {
      const k = toDateKey(o?.created_at || o?.orderDate)
      if (!k) return
      map[k] = (map[k] || 0) + orderTotal(o)
    })
    const entries = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
    return entries.map(([k, v]) => ({
      date: k.slice(5), // MM-DD for nicer axis
      revenue: v
    }))
  }, [filteredOrders])

  // Order status pie
  const statusCounts = useMemo(() => {
    const acc = {}
    filteredOrders.forEach(o => {
      const st = (o.status || "other").toLowerCase()
      acc[st] = (acc[st] || 0) + 1
    })
    return acc
  }, [filteredOrders])

  const statusPie = useMemo(() => {
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name] || COLORS.other
    }))
  }, [statusCounts])

  // Top products (by quantity)
  const topProducts = useMemo(() => {
    const map = {}
    filteredOrders.forEach(o => {
      (o.items || []).forEach(it => {
        const name = it?.product_name || it?.name || `#${it?.product}` || "Unknown"
        map[name] = (map[name] || 0) + Number(it.quantity || 0)
      })
    })
    return Object.entries(map)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 7)
  }, [filteredOrders])

  // Top customers (by revenue) if orders contain buyer info
  const topCustomers = useMemo(() => {
    const map = {}
    filteredOrders.forEach(o => {
      const key = o?.user_username || o?.user || "Customer"
      map[key] = (map[key] || 0) + orderTotal(o)
    })
    return Object.entries(map)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filteredOrders])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header / Filters */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Supplier Analytics</h1>
            <p className="text-emerald-100 mt-1">Track sales, orders, and product performance</p>
          </div>

        {/* Filters */}
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
              onClick={() => dispatch(listOrders())}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg text-sm"
              disabled={isLoading}
            >
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <KPI title="Revenue" value={fmtRWF(totalRevenue)} icon={<FiDollarSign />} chip="bg-emerald-100 text-emerald-800" />
          <KPI title="Orders" value={totalOrders} icon={<FiShoppingCart />} chip="bg-emerald-100 text-emerald-800" />
          <KPI title="Avg Order Value" value={fmtRWF(aov)} icon={<FiTrendingUp />} chip="bg-emerald-100 text-emerald-800" />
          <KPI title="Completed Rate" value={`${completionRate}%`} icon={<FiPercent />} chip="bg-emerald-100 text-emerald-800" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {typeof error === "string" ? error : error.detail || "Failed to load analytics"}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales over time */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Revenue Over Time</h2>
          </div>
          <div className="p-4 h-72">
            {revenueByDay.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v/1000)}k` : v)} />
                  <Tooltip formatter={(v) => fmtRWF(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-gray-500">No data</div>
            )}
          </div>
        </div>

        {/* Status pie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Orders by Status</h2>
          </div>
          <div className="p-4 h-72">
            {statusPie.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie} innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={4}>
                    {statusPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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

      {/* Top products + customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Top Products (by units)</h2>
          </div>
          <div className="p-4 h-72">
            {topProducts.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="qty" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-gray-500">No data</div>
            )}
          </div>
        </div>

        {/* Top customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Top Customers (by revenue)</h2>
          </div>
          <div className="p-4">
            {topCustomers.length ? (
              <div className="space-y-3">
                {topCustomers.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-sm font-semibold">
                        <FiUsers />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-500">Customer</div>
                      </div>
                    </div>
                    <div className="font-semibold">{fmtRWF(c.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No data</div>
            )}
          </div>
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
      <div className={`p-3 rounded-lg ${chip}`}>
        {icon}
      </div>
    </div>
  </div>
)

export default SupplierAnalytics