"use client"

import { FiFeather, FiBarChart2, FiCloud, FiDroplet } from "react-icons/fi"

export default function FarmerHome() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <span className="bg-green-100 p-2 rounded-full">
          <FiFeather className="text-green-600 text-2xl" />
        </span>
        Farmer Dashboard Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full">
            <FiBarChart2 className="text-green-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-800">3</div>
            <div className="text-gray-500 text-sm">Active Recommendations</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full">
            <FiCloud className="text-blue-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-800">Rainy</div>
            <div className="text-gray-500 text-sm">Current Weather</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-yellow-50 p-3 rounded-full">
            <FiDroplet className="text-yellow-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-800">Soil: Loamy</div>
            <div className="text-gray-500 text-sm">Soil Type</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full">
            <FiFeather className="text-green-600 text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-green-800">Maize</div>
            <div className="text-gray-500 text-sm">Recommended Crop</div>
          </div>
        </div>
      </div>
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg text-green-800">
        Welcome to your Farmer Dashboard. Here you can view your crop recommendations, check weather updates, and manage your farm activities for better yields.
      </div>
    </div>
  )
}