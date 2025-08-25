"use client"

import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

// Redux imports
import { fetchAllUsers } from "../../Redux/authentication/userSlice"
import { listFarmers } from "../../Redux/farmer/farmerSlice"

import {
  FiUsers, FiUserCheck, FiUserX, FiTrendingUp, FiMapPin,
  FiBarChart2, FiPieChart, FiActivity, FiCalendar, FiPhone,
  FiMail, FiRefreshCw, FiEye, FiPlus
} from "react-icons/fi"

export default function LeaderOverview() {
  const dispatch = useDispatch()

  // Redux state
  const { users, isLoading: isUsersLoading, error: usersError } = useSelector((state) => state.users)
  const { farmers, isLoadingList: isFarmersLoading, error: farmerError } = useSelector((state) => state.farmer)

  const [refreshing, setRefreshing] = useState(false)

  // Load data on mount
  useEffect(() => {
    dispatch(fetchAllUsers())
    dispatch(listFarmers())
  }, [dispatch])

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      dispatch(fetchAllUsers()),
      dispatch(listFarmers())
    ])
    setRefreshing(false)
  }

  // Process farmer data
  const farmerStats = useMemo(() => {
    const userList = Array.isArray(users) ? users : []
    const farmerList = Array.isArray(farmers) ? farmers : []
    
    // Filter farmers from users
    const farmerUsers = userList.filter(u => String(u.role || "").toLowerCase() === "farmer")
    
    // Status breakdown
    const activeFarmers = farmerUsers.filter(u => {
      const status = (u.status || (u.is_active === false ? "inactive" : "active")).toLowerCase()
      return status === "active"
    })
    const inactiveFarmers = farmerUsers.filter(u => {
      const status = (u.status || (u.is_active === false ? "inactive" : "active")).toLowerCase()
      return status !== "active"
    })

    // Contact info completeness
    const farmersWithPhone = farmerUsers.filter(u => u.phone_number && u.phone_number !== "—").length
    const farmersWithEmail = farmerUsers.filter(u => u.email && u.email !== "—").length
    const farmersWithAddress = farmerUsers.filter(u => u.address && u.address !== "—").length

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentFarmers = farmerUsers.filter(u => {
      if (!u.created_at) return false
      const created = new Date(u.created_at)
      return created > thirtyDaysAgo
    })

    // Farm size analysis from farmer profiles
    const farmersWithSize = farmerList.filter(f => f.farm_size_ha != null && f.farm_size_ha > 0)
    const totalFarmSize = farmersWithSize.reduce((sum, f) => {
      const size = parseFloat(f.farm_size_ha) || 0
      return sum + size
    }, 0)
    const avgFarmSize = farmersWithSize.length > 0 ? totalFarmSize / farmersWithSize.length : 0

    // Language preferences
    const languageMap = new Map()
    farmerList.forEach(f => {
      if (f.preferred_language) {
        languageMap.set(f.preferred_language, (languageMap.get(f.preferred_language) || 0) + 1)
      }
    })

    // Geographic distribution (simplified - based on address keywords)
    const locationMap = new Map()
    farmerUsers.forEach(u => {
      if (u.address && u.address !== "—") {
        // Extract first word as region/city
        const region = u.address.split(/[,\s]+/)[0] || "Unknown"
        locationMap.set(region, (locationMap.get(region) || 0) + 1)
      }
    })

    return {
      total: farmerUsers.length,
      active: activeFarmers.length,
      inactive: inactiveFarmers.length,
      withProfiles: farmerList.length,
      withoutProfiles: farmerUsers.length - farmerList.length,
      withPhone: farmersWithPhone,
      withEmail: farmersWithEmail,
      withAddress: farmersWithAddress,
      recent: recentFarmers.length,
      totalFarmSize: (totalFarmSize || 0).toFixed(1),
      avgFarmSize: (avgFarmSize || 0).toFixed(1),
      farmersWithSize: farmersWithSize.length,
      languages: Array.from(languageMap.entries()).sort((a, b) => b[1] - a[1]),
      locations: Array.from(locationMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
      completenessScore: farmerUsers.length > 0 ? 
        ((farmersWithPhone + farmersWithEmail + farmersWithAddress) / (farmerUsers.length * 3) * 100).toFixed(1) : 0
    }
  }, [users, farmers])

  const isLoading = isUsersLoading || isFarmersLoading

  if (isLoading && !users?.length && !farmers?.length) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800 flex items-center gap-3">
            <FiBarChart2 className="text-green-600" />
            Leader Overview
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive farmer management dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
            <FiPlus /> Quick Actions
          </button>
        </div>
      </div>

      {/* Error handling */}
      {(usersError || farmerError) && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <strong>Error loading data:</strong> {usersError?.message || farmerError?.message || "Unknown error"}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Farmers"
          value={farmerStats.total}
          icon={<FiUsers className="text-blue-600" />}
          trend={`+${farmerStats.recent} this month`}
          trendColor="text-green-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Active Farmers"
          value={farmerStats.active}
          icon={<FiUserCheck className="text-green-600" />}
          trend={`${((farmerStats.active / Math.max(farmerStats.total, 1)) * 100).toFixed(1)}% of total`}
          trendColor="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Inactive Farmers"
          value={farmerStats.inactive}
          icon={<FiUserX className="text-red-600" />}
          trend={farmerStats.inactive > 0 ? "Need attention" : "All active"}
          trendColor={farmerStats.inactive > 0 ? "text-red-600" : "text-green-600"}
          bgColor="bg-red-50"
        />
        <MetricCard
          title="Data Completeness"
          value={`${farmerStats.completenessScore}%`}
          icon={<FiActivity className="text-purple-600" />}
          trend="Contact information"
          trendColor="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Profile Completion</h3>
            <FiPieChart className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">With Farmer Profiles</span>
              <span className="text-sm font-medium">{farmerStats.withProfiles}/{farmerStats.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{width: `${(farmerStats.withProfiles / Math.max(farmerStats.total, 1)) * 100}%`}}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {farmerStats.withoutProfiles} farmers need profile setup
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
            <FiPhone className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <ContactStat label="Phone Numbers" count={farmerStats.withPhone} total={farmerStats.total} />
            <ContactStat label="Email Addresses" count={farmerStats.withEmail} total={farmerStats.total} />
            <ContactStat label="Addresses" count={farmerStats.withAddress} total={farmerStats.total} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Farm Statistics</h3>
            <FiTrendingUp className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Farm Area</span>
              <span className="text-sm font-medium">{farmerStats.totalFarmSize} ha</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Farm Size</span>
              <span className="text-sm font-medium">{farmerStats.avgFarmSize} ha</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Farms with Size Data</span>
              <span className="text-sm font-medium">{farmerStats.farmersWithSize}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Language Preferences</h3>
            <FiPieChart className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {farmerStats.languages.length > 0 ? (
              farmerStats.languages.slice(0, 5).map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{lang || 'Not specified'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${(count / farmerStats.withProfiles) * 100}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No language data available</div>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Geographic Distribution</h3>
            <FiMapPin className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {farmerStats.locations.length > 0 ? (
              farmerStats.locations.map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{location}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{width: `${(count / farmerStats.total) * 100}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No location data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity Summary</h3>
          <FiCalendar className="text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{farmerStats.recent}</div>
            <div className="text-sm text-green-600">New farmers (30 days)</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{farmerStats.active}</div>
            <div className="text-sm text-blue-600">Currently active</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{farmerStats.withProfiles}</div>
            <div className="text-sm text-purple-600">Complete profiles</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition">
            <FiEye className="text-green-600" />
            <span className="text-sm font-medium">View All Farmers</span>
          </button>
          <button className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition">
            <FiPlus className="text-blue-600" />
            <span className="text-sm font-medium">Add New Farmer</span>
          </button>
          <button className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition">
            <FiMail className="text-purple-600" />
            <span className="text-sm font-medium">Send Notifications</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Reusable Components
function MetricCard({ title, value, icon, trend, trendColor, bgColor }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${bgColor} mb-4`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700 mb-2">{title}</div>
      <div className={`text-xs ${trendColor}`}>{trend}</div>
    </div>
  )
}

function ContactStat({ label, count, total }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-green-600 h-1.5 rounded-full" 
            style={{width: `${percentage}%`}}
          ></div>
        </div>
        <span className="text-xs font-medium w-10 text-right">{count}/{total}</span>
      </div>
    </div>
  )
}