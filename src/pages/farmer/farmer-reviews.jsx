"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchMyFarmerProfile } from "../../Redux/farmer/farmerSlice"
import { listOrders } from "../../Redux/order/orderSlice"
import { fetchMyRecommendations } from "../../Redux/Recommendation/cropRecommendation"
import {
  FiShoppingBag, 
  FiDroplet, 
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
  FiSun,
  FiCloud,
  FiChevronRight,
  FiUser,
  FiMapPin,
  FiActivity,
  FiEye,
  FiCalendar,
} from "react-icons/fi"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const STATUS_COLORS = {
  pending: '#FFAB00',
  processing: '#2196F3',
  completed: '#4CAF50',
  approved: '#16A34A',
  rejected: '#F44336',
  cancelled: '#EF4444',
  cart: '#9CA3AF',
}

// Dashboard
const FarmerDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { myProfile } = useSelector((s) => s.farmer || {})
  // Orders come from state.order (same as My Orders page)
  const { orders = [], isLoading: isLoadingOrders } = useSelector((s) => s.order || {})
  // Recommendations come from state.recommendation (same as FarmerRecommendations page)
  const { myRecommendations = [], isLoading: isLoadingRecs, error: recError } = useSelector((s) => s.recommendation || {})

  const [weatherData, setWeatherData] = useState({
    temp: 24, condition: "Partly Cloudy", humidity: 65, rainfall: 0, windSpeed: 8, uvIndex: 6
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    dispatch(fetchMyFarmerProfile())
    dispatch(listOrders())
    dispatch(fetchMyRecommendations())

    const timer = setInterval(() => setCurrentTime(new Date()), 60000)

    const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"]
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
    setWeatherData({
      temp: Math.floor(Math.random() * 10) + 20,
      condition: randomCondition,
      humidity: Math.floor(Math.random() * 30) + 50,
      rainfall: randomCondition.includes('Rain') ? Math.floor(Math.random() * 15) + 2 : 0,
      windSpeed: Math.floor(Math.random() * 15) + 5,
      uvIndex: Math.floor(Math.random() * 8) + 1
    })
    return () => clearInterval(timer)
  }, [dispatch])

  // Logged-in farmer (buyer) id — same as My Orders page
  const buyerUserId = useMemo(() => {
    const id = localStorage.getItem("user_id")
    return id ? Number(id) : null
  }, [])

  // Only this buyer’s orders
  const myOrders = useMemo(() => {
    if (!buyerUserId) return []
    return (orders || []).filter((o) => Number(o?.user) === buyerUserId)
  }, [orders, buyerUserId])

  // Helpers
  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const getWeatherIcon = (condition) => {
    if ((condition || '').includes('Rain')) return <FiCloud className="text-gray-600" />
    if ((condition || '').includes('Cloud')) return <FiCloud className="text-blue-500" />
    return <FiSun className="text-yellow-500" />
  }

  const getOrderStatusPill = (status) => {
    const key = (status || '').toLowerCase()
    const map = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      cart: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return map[key] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Same badge logic as FarmerRecommendations page
  const getRecStatusBadge = (status) => {
    switch (status) {
      case "translated": return "bg-green-100 text-green-800 border-green-200"
      case "returned": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in_review": return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending_review": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"

  const toYM = (dateStr) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }
  const lastNMonths = (n) => {
    const arr = []
    const now = new Date()
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      arr.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleString('default', { month: 'short' }),
      })
    }
    return arr
  }
  const toDateKey = (dateStr) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }
  const lastNDays = (n) => {
    const arr = []
    const now = new Date()
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      arr.push({
        key: toDateKey(d.toISOString()),
        label: d.toLocaleDateString('default', { weekday: 'short' })
      })
    }
    return arr
  }

  // Metrics
  const activeOrdersCount = useMemo(() => {
    return myOrders.filter(o => {
      const s = (o.status || '').toLowerCase()
      return s !== 'completed' && s !== 'cancelled' && s !== 'rejected'
    }).length
  }, [myOrders])

  // Count pending recs as in_review + pending_review (matches your page semantics)
  const pendingRecommendationsCount = useMemo(() => {
    return (myRecommendations || []).filter(r => ['in_review', 'pending_review'].includes((r.status || '').toLowerCase())).length
  }, [myRecommendations])

  // Order status pie from myOrders
  const orderStatusData = useMemo(() => {
    const counts = {}
    myOrders.forEach(o => {
      const s = (o.status || 'unknown').toLowerCase()
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      color: STATUS_COLORS[key] || '#6B7280'
    }))
  }, [myOrders])

  // Monthly recs (last 6 months) using timestamp (fallback created_at)
  const recommendationMonthlyData = useMemo(() => {
    const months = lastNMonths(6)
    const countsByYM = (myRecommendations || []).reduce((acc, r) => {
      const when = r.timestamp || r.created_at
      const key = toYM(when)
      if (!key) return acc
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return months.map(m => ({ name: m.label, count: countsByYM[m.key] || 0 }))
  }, [myRecommendations])

  // Daily activity: orders vs recommendations (last 7 days)
  const dailyActivityData = useMemo(() => {
    const days = lastNDays(7)
    const ordersByDay = myOrders.reduce((acc, o) => {
      const k = toDateKey(o.created_at || o.orderDate)
      if (!k) return acc
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})
    const recsByDay = (myRecommendations || []).reduce((acc, r) => {
      const k = toDateKey(r.timestamp || r.created_at)
      if (!k) return acc
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})
    return days.map(d => ({
      name: d.label,
      orders: ordersByDay[d.key] || 0,
      recs: recsByDay[d.key] || 0
    }))
  }, [myOrders, myRecommendations])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Farm Dashboard</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <FiClock size={16} />
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {formatTime(currentTime)}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-white rounded-full pl-2 pr-4 py-2 shadow-sm border">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FiUser size={16} className="text-green-600" />
              </div>
              <span className="font-medium text-gray-700">
                {myProfile?.fullnames?.split(' ')[0] || 'Farmer'}
              </span>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 rounded-xl shadow-lg p-6 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {myProfile?.fullnames || 'Farmer'}! 🌱</h2>
                <p className="text-green-100 mb-4 max-w-md">Here's an overview of your farm activities and performance</p>
                {myProfile && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                      <FiMapPin size={14} />
                      <span>{myProfile.address || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                      <FiActivity size={14} />
                      <span>{myProfile.farm_size_ha || 0} ha farm</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-green-100 text-sm">Current Season</p>
                <p className="text-xl font-semibold">Growing Season</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Active Orders" value={activeOrdersCount} icon={<FiShoppingBag className="text-blue-600" />} iconBg="bg-blue-100" />
          <MetricCard title="Pending Recommendations" value={pendingRecommendationsCount} icon={<FiClock className="text-amber-600" />} iconBg="bg-amber-100" />
          <MetricCard title="Farm Size" value={<>{myProfile?.farm_size_ha || 0}<span className="text-sm ml-1">ha</span></>} icon={<FiTrendingUp className="text-green-600" />} iconBg="bg-green-100" />
          <MetricCard title="Total Recommendations" value={myRecommendations.length} icon={<FiDroplet className="text-purple-600" />} iconBg="bg-purple-100" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <SectionHeader title="Activity (Last 7 days)" legend={[
                { color: 'bg-green-500', label: 'Orders' },
                { color: 'bg-blue-500', label: 'Recommendations' },
              ]} />
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyActivityData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="recs" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ListHeader title="Recent Orders" onViewAll={() => navigate('/orders')} />
              <div className="divide-y divide-gray-100">
                {isLoadingOrders ? (
                  <Loader msg="Loading orders..." />
                ) : myOrders && myOrders.length > 0 ? (
                  myOrders.slice(0, 4).map((order, idx) => (
                    <div key={order.orderID || order.id || idx} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order.orderID || order.id || `ORD${String(idx + 1).padStart(3, '0')}`}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {(order.items || []).map(item => (item.product_name || item.name)).filter(Boolean).join(', ') || 'Various items'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs border font-medium ${getOrderStatusPill(order.status)}`}>
                          {(order.status || '—').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          Ordered: {(order.created_at || order.orderDate) ? new Date(order.created_at || order.orderDate).toLocaleDateString() : '—'}
                        </span>
                        <span className="font-semibold text-gray-800">{order.total || 0} RWF</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No orders available" />
                )}
              </div>
            </div>

            {/* Recent Recommendations (embedded from your page logic) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ListHeader title="Recent Recommendations" onViewAll={() => navigate('/recommendations')} />
              <div className="divide-y divide-gray-100">
                {isLoadingRecs ? (
                  <Loader msg="Loading recommendations..." />
                ) : recError ? (
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                      <FiAlertCircle />
                      <span>Error loading recommendations: {recError.detail || "Unknown error"}</span>
                    </div>
                  </div>
                ) : (myRecommendations || []).length > 0 ? (
                  (myRecommendations || []).slice(0, 4).map((rec, idx) => {
                    const isReviewed = ["translated", "returned"].includes(rec.status)
                    const crop = rec.crop_predicted || rec.ai_outputs?.crop_predicted || "Unknown"
                    return (
                      <div key={rec.id || idx} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{crop}</h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1"><FiCalendar /> {formatDate(rec.timestamp || rec.created_at)}</span>
                              <span className="flex items-center gap-1"><FiUser /> {rec.agronomist_username || "Unassigned"}</span>
                              <span className={`px-2 py-1 rounded-full border text-xs ${getRecStatusBadge(rec.status)}`}>
                                {(rec.status || '').replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <button
                              onClick={() => navigate(`/recommendations/${rec.id}`)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <FiEye /> Details
                            </button>
                          </div>
                        </div>
                        {isReviewed && rec.translated_summary && (
                          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-gray-700 line-clamp-2">
                            {rec.translated_summary}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <EmptyState text="No recommendations available" />
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Weather Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  {getWeatherIcon(weatherData.condition)}
                  Weather Today
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-4xl font-bold text-gray-800">{weatherData.temp}°C</p>
                    <p className="text-gray-600 mt-1">{weatherData.condition}</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <FiMapPin size={14} />
                      {myProfile?.address?.split(',')[0] || 'Your Location'}
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">
                    {getWeatherIcon(weatherData.condition)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <InfoTile label="Humidity" value={`${weatherData.humidity}%`} />
                  <InfoTile label="Wind" value={`${weatherData.windSpeed} km/h`} />
                  <InfoTile label="Rainfall" value={`${weatherData.rainfall} mm`} />
                  <InfoTile label="UV Index" value={`${weatherData.uvIndex}/10`} />
                </div>
              </div>
            </div>

            {/* Order Status Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Order Status</h2>
              </div>
              <div className="p-6">
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value">
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {orderStatusData.map((status, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                        <span className="text-sm font-medium">{status.name}</span>
                      </div>
                      <span className="text-sm font-bold">{status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Monthly Recommendations</h2>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recommendationMonthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  )
}

const MetricCard = ({ title, value, icon, iconBg }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${iconBg} p-4 rounded-full`}>
        {icon}
      </div>
    </div>
  </div>
)

const SectionHeader = ({ title, legend = [] }) => (
  <div className="p-6 border-b border-gray-100">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {legend.length > 0 && (
        <div className="flex gap-3">
          {legend.map((l, i) => (
            <span key={i} className="flex items-center text-sm text-gray-600">
              <div className={`w-3 h-3 ${l.color} rounded-full mr-2`}></div>
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
)

const ListHeader = ({ title, onViewAll }) => (
  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    <button onClick={onViewAll} className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700 transition-colors">
      View All <FiChevronRight className="ml-1" />
    </button>
  </div>
)

const InfoTile = ({ label, value }) => (
  <div className="text-center">
    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
  </div>
)

const Loader = ({ msg }) => (
  <div className="p-8 text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
    <p className="text-gray-500">{msg}</p>
  </div>
)

const EmptyState = ({ text }) => (
  <div className="p-6 text-center text-gray-500">{text}</div>
)

export default FarmerDashboard