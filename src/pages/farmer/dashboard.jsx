"use client"

import { useState } from "react"
import { NavLink, Outlet, useLocation, Link } from "react-router-dom"
import {
  FiHome,
  FiDroplet,
  FiCloud,
  FiClipboard,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiSearch,
} from "react-icons/fi"

const SidebarItem = ({ name, icon, path }) => {
  const location = useLocation()
  const isActive = location.pathname === path
  return (
    <NavLink
      to={path}
      className={`flex items-center gap-3 py-3 px-3 text-sm rounded-lg transition-all duration-200 ${
        isActive
          ? "text-white bg-white/20 backdrop-blur-sm font-medium border-r-2 border-green-300"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={isActive ? "text-green-200" : "text-white/70"}>{icon}</span>
      <span>{name}</span>
    </NavLink>
  )
}

const FarmerDashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen)

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x)
    return pathnames.map((value, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`
      const isLast = index === pathnames.length - 1
      return (
        <li key={routeTo} className={`text-gray-600 ${isLast ? "font-semibold text-gray-800" : ""}`}>
          {!isLast ? (
            <Link to={routeTo} className="hover:underline text-green-600">
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Link>
          ) : (
            <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
          )}
          {!isLast && (
            <svg className="w-4 h-4 mx-2 text-gray-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </li>
      )
    })
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-orange-200">
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
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white">AIOS</h1>
              <div className="w-4 h-4 border border-white/30 rounded flex items-center justify-center ml-auto">
                <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
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
              <SidebarItem name="Dashboard" icon={<FiHome />} path="/farmer/dashboard" />
              <SidebarItem name="Farm Recommendation" icon={<FiDroplet />} path="/farmer-dashboard/recommendation  " />
              <SidebarItem name="Weather" icon={<FiCloud />} path="/farmer/weather" />
              <SidebarItem name="Order" icon={<FiClipboard />} path="/farmer/tasks" />
              <SidebarItem name="Profile" icon={<FiUsers />} path="/farmer/labor" />
              <SidebarItem name="Report & Analytics" icon={<FiBarChart2 />} path="/farmer/reports" />
            </nav>

            <div className="mt-8 pt-6 border-t border-white/20">
              <nav className="space-y-1">
                <SidebarItem name="Setting" icon={<FiSettings />} path="/farmer/settings" />
                <SidebarItem name="Feedback" icon={<FiHelpCircle />} path="/farmer/support" />
              </nav>
            </div>
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

            {/* Location Info */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Ngawi, Indonesia</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-green-50 px-3 py-1.5 rounded-lg">
              <span className="text-green-700 font-medium text-sm">F</span>
            </div>
          </div>
        </header>

        {/* Page Content with proper spacing */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
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

export default FarmerDashboardLayout
