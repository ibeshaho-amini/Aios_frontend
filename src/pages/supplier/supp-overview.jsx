"use client"

import { FiBox, FiBarChart2, FiUsers, FiCheckCircle } from "react-icons/fi"

export default function SupplierHome() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <span className="bg-green-100 p-2 rounded-full">
          <FiBox className="text-green-600 text-2xl" />
        </span>
        Supplier Dashboard Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full">
            <FiBox className="text-green-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-800">12</div>
            <div className="text-gray-500 text-sm">Products Listed</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full">
            <FiUsers className="text-blue-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-800">5</div>
            <div className="text-gray-500 text-sm">Active Orders</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-yellow-50 p-3 rounded-full">
            <FiBarChart2 className="text-yellow-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-800">Ksh 25,000</div>
            <div className="text-gray-500 text-sm">Total Sales</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full">
            <FiCheckCircle className="text-green-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-800">Active</div>
            <div className="text-gray-500 text-sm">Account Status</div>
          </div>
        </div>
      </div>
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg text-green-800">
        Welcome to your Supplier Dashboard. Here you can manage your products, view orders, and track your sales performance in the agriculture marketplace.
      </div>
    </div>
  )
}