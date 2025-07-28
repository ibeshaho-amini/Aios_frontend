"use client"

import { FiUsers, FiBarChart2, FiMessageCircle, FiSettings } from "react-icons/fi"

export default function AdminHome() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <span className="bg-green-100 p-2 rounded-full">
          <FiBarChart2 className="text-green-600 text-2xl" />
        </span>
        Admin Dashboard Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full">
            <FiUsers className="text-green-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-800">1,234</div>
            <div className="text-gray-500 text-sm">Total Users</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-yellow-50 p-3 rounded-full">
            <FiMessageCircle className="text-yellow-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-800">56</div>
            <div className="text-gray-500 text-sm">Feedbacks</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full">
            <FiBarChart2 className="text-blue-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-800">12</div>
            <div className="text-gray-500 text-sm">Analytics Reports</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-gray-50 p-3 rounded-full">
            <FiSettings className="text-gray-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">Settings</div>
            <div className="text-gray-500 text-sm">Manage platform</div>
          </div>
        </div>
      </div>
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg text-green-800">
        Welcome to the AIOS Admin Dashboard. Here you can manage users, view analytics, handle feedback, and configure system settings for your agriculture platform.
      </div>
    </div>
  )
}