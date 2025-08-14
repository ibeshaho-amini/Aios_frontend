"use client"

import { useState } from "react"
import { NavLink, Outlet, useLocation, Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  FiHome,
  FiInbox,
  FiCheckSquare,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiSearch,
  FiLogOut,
} from "react-icons/fi"
import { logoutUser } from "../../Redux/authentication/login" 

const SidebarItem = ({ name, icon, path }) => {
  const location = useLocation()
  const isActive = location.pathname === path
  return (
    <NavLink
      to={path}
      className={`flex items-center gap-3 py-3 px-3 text-sm rounded-lg transition-all duration-200 ${
        isActive
          ? "text-white bg-white/20 backdrop-blur-sm font-medium border-r-2 border-emerald-300"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={isActive ? "text-emerald-200" : "text-white/70"}>{icon}</span>
      <span>{name}</span>
    </NavLink>
  )
}

const AgronomistDashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // If you want user info for header initial
  const userInfo = useSelector((s) => s.auth?.userInfo)
  const userInitial = (userInfo?.fullnames || userInfo?.username || "A").charAt(0).toUpperCase()

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await dispatch(logoutUser()).unwrap()
      navigate("/login")
    } catch (err) {
      // Optional: show toast
      console.error("Logout failed:", err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter(Boolean)
    return pathnames.map((value, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`
      const isLast = index === pathnames.length - 1
      const label = value.charAt(0).toUpperCase() + value.slice(1)
      return (
        <li key={routeTo} className={`text-gray-600 ${isLast ? "font-semibold text-gray-800" : ""}`}>
          {!isLast ? (
            <Link to={routeTo} className="hover:underline text-emerald-600">
              {label}
            </Link>
          ) : (
            <span>{label}</span>
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
    <div className="flex h-screen bg-gradient-to-br from-emerald-400 via-emerald-300 to-green-200">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-gradient-to-b from-emerald-800 to-emerald-900 shadow-xl transition-transform duration-300 transform ${
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
            </div>
          </div>

          {/* Search */}
          <div className="px-6 pb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search menus..."
                className="w-full py-2.5 pl-10 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50">/</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 overflow-y-auto">
            <nav className="space-y-1">
              <SidebarItem name="Dashboard" icon={<FiHome />} path="/agronomist-dashboard/dashboard" />
              <SidebarItem name="Incoming Recommendations" icon={<FiInbox />} path="/agronomist-dashboard/agronomistInbox" />
              <SidebarItem name="My Reviews" icon={<FiCheckSquare />} path="/agronomist-dashboard/myReviews" />
              <SidebarItem name="Reports & Analytics" icon={<FiBarChart2 />} path="/agronomist/reports" />
            </nav>

            <div className="mt-8 pt-6 border-t border-white/20">
              <nav className="space-y-1">
                <SidebarItem name="Settings" icon={<FiSettings />} path="/agronomist/settings" />
                <SidebarItem name="Support" icon={<FiHelpCircle />} path="/agronomist/support" />
                {/* Logout in sidebar */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 py-3 px-3 text-sm rounded-lg transition-all duration-200 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <span className="text-white/70"><FiLogOut /></span>
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
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
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-emerald-600 lg:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumbs */}
            <ul className="flex items-center text-sm">
              {generateBreadcrumbs()}
            </ul>
          </div>

          <div className="flex items-center space-x-3">
            {/* Role badge */}
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">Agronomist</span>
            {/* Avatar */}
            <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <span className="text-emerald-700 font-medium text-sm">{userInitial}</span>
            </div>
            {/* Logout in header */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
                isLoggingOut
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50 text-gray-700"
              }`}
              title="Logout"
            >
              <FiLogOut />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-emerald-50 via-white to-green-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for small screens */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={toggleSidebar}></div>
      )}
    </div>
  )
}

export default AgronomistDashboardLayout