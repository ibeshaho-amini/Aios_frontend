"use client"

import { useState } from "react"
import { FaLeaf, FaUsers, FaSeedling, FaChartLine, FaFileAlt, FaWarehouse, FaCog, FaSignOutAlt, FaHome, FaHandshake } from "react-icons/fa"
import { FiSearch, FiBell, FiUser } from "react-icons/fi"

const SidebarItem = ({ name, icon, path, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(path)}
      className={`w-full flex items-center gap-3 py-3 px-3 text-sm rounded-lg transition-all duration-200 ${
        isActive
          ? "text-white bg-white/20 backdrop-blur-sm font-medium border-r-2 border-green-400"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={isActive ? "text-green-200" : "text-white/70"}>{icon}</span>
      <span>{name}</span>
    </button>
  )
}

const DashboardContent = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Cooperative Overview</h1>
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium text-sm">Active Season</span>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                    <p className="text-3xl font-bold text-gray-900">245</p>
                    <p className="text-sm text-green-600">+12 this month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaUsers className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Inputs</p>
                    <p className="text-3xl font-bold text-gray-900">1,240</p>
                    <p className="text-sm text-blue-600">Seeds, Fertilizers</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaSeedling className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">$45,230</p>
                    <p className="text-sm text-green-600">+8% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaChartLine className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-3xl font-bold text-gray-900">18</p>
                    <p className="text-sm text-purple-600">3 pending review</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaHandshake className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
            </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <FaSeedling className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New farmer registration</p>
                    <p className="text-xs text-gray-500">John Mukamana joined the cooperative</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <FaFileAlt className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Report submitted</p>
                    <p className="text-xs text-gray-500">Monthly harvest report is ready for review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'farmers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">All Farmers</h1>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Add New Farmer
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Farmer Directory</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search farmers..."
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crops</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-medium text-sm">JM</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Jean Mukamana</p>
                            <p className="text-sm text-gray-500">ID: FM001</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Kigali, Rwanda</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Maize, Beans</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-green-600 hover:text-green-700">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">AN</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Alice Niyonzima</p>
                            <p className="text-sm text-gray-500">ID: FM002</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Musanze, Rwanda</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Potatoes, Carrots</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-green-600 hover:text-green-700">View</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      
      case 'farmer-inputs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Farmer Inputs</h1>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Add New Input
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Requests</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <FaSeedling className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fertilizer Request</p>
                        <p className="text-xs text-gray-500">Jean Mukamana - 50kg NPK</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                      <button className="text-green-600 hover:text-green-700 text-sm">Approve</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <FaSeedling className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Seed Request</p>
                        <p className="text-xs text-gray-500">Alice Niyonzima - Maize seeds 10kg</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Inventory</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seeds</span>
                    <span className="text-sm font-medium text-gray-900">450kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fertilizers</span>
                    <span className="text-sm font-medium text-gray-900">320kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pesticides</span>
                    <span className="text-sm font-medium text-gray-900">85L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmer Growth</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart visualization would go here</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Production</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart visualization would go here</p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Generate Report
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <FaFileAlt className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Report</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Comprehensive monthly cooperative performance report</p>
                <button className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                  View Report
                </button>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <FaChartLine className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Production Report</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Detailed crop production and yield analysis</p>
                <button className="w-full bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  View Report
                </button>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <FaUsers className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Farmer Report</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Member activities and engagement statistics</p>
                <button className="w-full bg-purple-50 text-purple-700 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                  View Report
                </button>
              </div>
            </div>
          </div>
        )
      
      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Add Stock
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Stock Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Seeds</span>
                    <span className="text-sm text-green-600">Good</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">450kg available</span>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Fertilizers</span>
                    <span className="text-sm text-yellow-600">Low</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">120kg available</span>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Pesticides</span>
                    <span className="text-sm text-red-600">Critical</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">25L available</span>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cooperative Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cooperative Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter cooperative name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return <div>Select a menu item</div>
    }
  }

  return renderContent()
}

const CooperativeLeaderDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen)

  const handleNavigation = (path) => {
    setActiveTab(path)
  }

  const handleLogout = () => {
    alert('Logout functionality would be implemented here')
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-200 via-lime-100 to-yellow-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-gradient-to-b from-green-800 to-green-900 shadow-xl transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-6 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <FaLeaf className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">CoopLeader</h1>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 pb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search menus..."
                className="w-full py-2.5 pl-10 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/50">/</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 overflow-y-auto">
            <nav className="space-y-1">
              <SidebarItem 
                name="Dashboard" 
                icon={<FaHome />} 
                path="dashboard" 
                isActive={activeTab === 'dashboard'}
                onClick={handleNavigation}
              />
              <SidebarItem 
                name="All Farmers" 
                icon={<FaUsers />} 
                path="farmers" 
                isActive={activeTab === 'farmers'}
                onClick={handleNavigation}
              />
              <SidebarItem 
                name="Farmer Inputs" 
                icon={<FaSeedling />} 
                path="farmer-inputs" 
                isActive={activeTab === 'farmer-inputs'}
                onClick={handleNavigation}
              />
              <SidebarItem 
                name="Analytics" 
                icon={<FaChartLine />} 
                path="analytics" 
                isActive={activeTab === 'analytics'}
                onClick={handleNavigation}
              />
              <SidebarItem 
                name="Reports" 
                icon={<FaFileAlt />} 
                path="reports" 
                isActive={activeTab === 'reports'}
                onClick={handleNavigation}
              />
              <SidebarItem 
                name="Inventory" 
                icon={<FaWarehouse />} 
                path="inventory" 
                isActive={activeTab === 'inventory'}
                onClick={handleNavigation}
              />
              <SidebarItem 
                name="Settings" 
                icon={<FaCog />} 
                path="settings" 
                isActive={activeTab === 'settings'}
                onClick={handleNavigation}
              />
            </nav>
          </div>

          {/* Logout Button */}
          <div className="px-4 py-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 py-3 px-3 text-sm rounded-lg transition-all duration-200 text-white/80 hover:bg-red-500/20 hover:text-white"
            >
              <FaSignOutAlt className="text-white/70" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:ml-[280px]">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-green-600 lg:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Cooperative Leader Portal</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <FiBell className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1 bg-green-50 px-3 py-1.5 rounded-lg">
              <FiUser className="w-4 h-4 text-green-700" />
              <span className="text-green-700 font-medium text-sm">Leader</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-green-50 via-white to-yellow-50">
          <div className="max-w-7xl mx-auto">
            <DashboardContent activeTab={activeTab} />
          </div>
        </main>
      </div>

      {/* Overlay for small screens */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={toggleSidebar}></div>
      )}
    </div>
  )
}

export default CooperativeLeaderDashboard