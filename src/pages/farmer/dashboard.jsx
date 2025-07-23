import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiTarget,
    FiDroplet,
    FiSun,
    FiAlertTriangle,
    FiCheckCircle,
  } from "react-icons/fi"
  
  const StatCard = ({ title, value, change, changeType, icon, color = "green" }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-r ${
            color === "green"
              ? "from-green-500 to-emerald-600"
              : color === "blue"
                ? "from-blue-500 to-cyan-600"
                : color === "orange"
                  ? "from-orange-500 to-red-600"
                  : "from-purple-500 to-pink-600"
          }`}
        >
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div
          className={`flex items-center space-x-1 text-sm ${
            changeType === "increase" ? "text-green-600" : "text-red-600"
          }`}
        >
          {changeType === "increase" ? <FiTrendingUp /> : <FiTrendingDown />}
          <span>{change}</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  )
  
  const AlertCard = ({ type, title, message, time }) => (
    <div
      className={`p-4 rounded-xl border-l-4 ${
        type === "warning"
          ? "bg-yellow-50 border-yellow-400"
          : type === "success"
            ? "bg-green-50 border-green-400"
            : "bg-red-50 border-red-400"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`p-1 rounded-full ${
            type === "warning" ? "text-yellow-600" : type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {type === "success" ? <FiCheckCircle /> : <FiAlertTriangle />}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <p className="text-gray-600 text-xs mt-1">{message}</p>
          <p className="text-gray-500 text-xs mt-2">{time}</p>
        </div>
      </div>
    </div>
  )
  
  const DashboardOverview = () => {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to Your Farm Dashboard</h1>
            <p className="text-green-100 text-lg">
              Monitor your crops, track performance, and optimize your agricultural operations with AI-powered insights.
            </p>
            <div className="flex items-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <FiSun className="text-yellow-300" />
                <span className="text-sm">Perfect weather for planting</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiDroplet className="text-blue-300" />
                <span className="text-sm">Soil moisture: Optimal</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 text-6xl opacity-20">🌾</div>
        </div>
  
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Yield This Season"
            value="2,847 kg"
            change="+12.5%"
            changeType="increase"
            icon="🌾"
            color="green"
          />
          <StatCard
            title="Cost Savings"
            value="$3,240"
            change="+8.3%"
            changeType="increase"
            icon={<FiDollarSign />}
            color="blue"
          />
          <StatCard title="Active Fields" value="12" change="+2" changeType="increase" icon="🚜" color="orange" />
          <StatCard
            title="Efficiency Score"
            value="94%"
            change="+5.2%"
            changeType="increase"
            icon={<FiTarget />}
            color="purple"
          />
        </div>
  
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📊</span>
              Recent Farm Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white">🌱</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Corn Field A - Fertilizer Applied</h3>
                    <p className="text-gray-600 text-sm">NPK 20-10-10 applied to 5.2 hectares</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
  
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white">💧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Irrigation System Activated</h3>
                    <p className="text-gray-600 text-sm">Wheat Field B - 2 hour cycle completed</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </div>
  
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white">🚚</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Supply Order Delivered</h3>
                    <p className="text-gray-600 text-sm">Pesticide shipment from AgriSupply Co.</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
  
          {/* Alerts & Notifications */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">🔔</span>
              Alerts & Recommendations
            </h2>
            <div className="space-y-4">
              <AlertCard
                type="warning"
                title="Weather Alert"
                message="Heavy rain expected in 2 days. Consider harvesting Field C."
                time="30 minutes ago"
              />
              <AlertCard
                type="success"
                title="Optimal Planting Window"
                message="Perfect conditions for soybean planting in Field D."
                time="2 hours ago"
              />
              <AlertCard
                type="warning"
                title="Pest Detection"
                message="Aphid activity detected in Tomato Field. Apply treatment recommended."
                time="1 day ago"
              />
            </div>
          </div>
        </div>
  
        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105">
              <span className="block text-2xl mb-2">🧠</span>
              <span className="text-sm font-medium">Get AI Recommendations</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105">
              <span className="block text-2xl mb-2">📊</span>
              <span className="text-sm font-medium">View Analytics</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105">
              <span className="block text-2xl mb-2">🚚</span>
              <span className="text-sm font-medium">Order Supplies</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105">
              <span className="block text-2xl mb-2">🎯</span>
              <span className="text-sm font-medium">Track Impact</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  export default DashboardOverview
  