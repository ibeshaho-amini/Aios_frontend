import { Link } from "react-router-dom"

export default function AIOSLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
      {/* Header */}
      <header className="border-b border-green-100 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                  <span className="text-white text-xl">🌾</span>
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  AIOS
                </span>
                <div className="text-xs text-green-600 font-medium">Agricultural Intelligence</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-green-600 transition-all duration-300 font-medium"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-gray-600 hover:text-green-600 transition-all duration-300 font-medium"
              >
                Benefits
              </a>
              <a href="#about" className="text-gray-600 hover:text-green-600 transition-all duration-300 font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-green-600 transition-all duration-300 font-medium">
                Contact
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="hidden md:inline-flex px-4 py-2 text-green-700 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Link>
              <button className="md:hidden p-2">
                <span className="text-xl">☰</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-emerald-50/30 to-lime-100/50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 px-4 py-2 text-sm font-medium rounded-full">
              🌱 Next-Generation Agricultural Technology
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent">
              Smart Farming
            </span>
            <br />
            <span className="text-gray-800">Starts Here</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your agricultural operations with AI-powered insights. Get precise recommendations for
            <span className="text-green-600 font-semibold"> seeds, fertilizers, and pesticides</span> tailored to your
            farm's unique conditions.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-medium rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Your Journey
              <span className="ml-2">→</span>
            </Link>
            <button className="inline-flex items-center justify-center px-10 py-4 text-lg border-2 border-green-200 hover:border-green-300 hover:bg-green-50 rounded-lg transition-all duration-300 bg-transparent">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Watch Live Demo
              </span>
            </button>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl blur-2xl transform rotate-1"></div>
            <div className="relative bg-white p-4 rounded-2xl shadow-2xl border border-green-100">
              <div className="w-full h-96 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-6xl">📊</span>
                <span className="ml-4 text-2xl font-bold text-green-700">AIOS Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">25%</div>
              <div className="text-gray-600 font-medium">Yield Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">40%</div>
              <div className="text-gray-600 font-medium">Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">10K+</div>
              <div className="text-gray-600 font-medium">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Crop Types</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-24 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <span className="mb-6 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium inline-block">
              🚀 Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete Agricultural
              <span className="block text-green-600">Intelligence Suite</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Four integrated modules designed to revolutionize how you approach modern farming
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-green-50/50">
              <div className="text-center p-6">
                <div className="mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl w-fit mx-auto">
                    <span className="text-white text-2xl">🧠</span>
                  </div>
                </div>
                <h3 className="text-xl text-green-800 mb-2 font-semibold">Smart Recommendations</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full mb-4"></div>
                <p className="text-gray-600 leading-relaxed">
                  AI-powered insights for optimal seed varieties, fertilizers, and pesticides based on your unique farm
                  conditions
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-blue-50/50">
              <div className="text-center p-6">
                <div className="mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl w-fit mx-auto">
                    <span className="text-white text-2xl">📊</span>
                  </div>
                </div>
                <h3 className="text-xl text-blue-800 mb-2 font-semibold">Usage Analytics</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto rounded-full mb-4"></div>
                <p className="text-gray-600 leading-relaxed">
                  Track and analyze input patterns across seasons to identify trends and maximize productivity
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-orange-50/50">
              <div className="text-center p-6">
                <div className="mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl w-fit mx-auto">
                    <span className="text-white text-2xl">🚚</span>
                  </div>
                </div>
                <h3 className="text-xl text-orange-800 mb-2 font-semibold">Supply Chain</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full mb-4"></div>
                <p className="text-gray-600 leading-relaxed">
                  Connect with trusted suppliers and get real-time insights on availability, pricing, and quality
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-purple-50/50">
              <div className="text-center p-6">
                <div className="mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl w-fit mx-auto">
                    <span className="text-white text-2xl">🎯</span>
                  </div>
                </div>
                <h3 className="text-xl text-purple-800 mb-2 font-semibold">Impact Assessment</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-500 mx-auto rounded-full mb-4"></div>
                <p className="text-gray-600 leading-relaxed">
                  Monitor results and gather feedback to continuously improve recommendations and farm performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-24 px-4 bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 text-white relative overflow-hidden"
      >
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="mb-6 bg-white/20 text-white border border-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium inline-block">
              🎯 Proven Results
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your Farm's
              <span className="block text-green-300">Performance</span>
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Join thousands of farmers who have revolutionized their operations with measurable, sustainable results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105 rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl w-fit">
                  <span className="text-white text-2xl">📈</span>
                </div>
                <h3 className="text-green-300 text-xl font-semibold mb-4">Higher Productivity</h3>
                <div className="text-3xl font-bold text-white mb-2">25-40%</div>
                <p className="text-green-100">
                  Average increase in crop yields through optimized input usage and reduced waste
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105 rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl w-fit">
                  <span className="text-white text-2xl">🧠</span>
                </div>
                <h3 className="text-blue-300 text-xl font-semibold mb-4">Smart Decision Making</h3>
                <div className="text-3xl font-bold text-white mb-2">90%</div>
                <p className="text-blue-100">
                  Of farmers report improved confidence in input decisions with data-driven insights
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105 rounded-lg p-6 md:col-span-2 lg:col-span-1">
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl w-fit">
                  <span className="text-white text-2xl">🌱</span>
                </div>
                <h3 className="text-purple-300 text-xl font-semibold mb-4">Sustainable Farming</h3>
                <div className="text-3xl font-bold text-white mb-2">30%</div>
                <p className="text-purple-100">
                  Reduction in chemical inputs while maintaining yields through precision agriculture
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="mb-6 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium inline-block">
              💬 Success Stories
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Farmers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">★★★★★</div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "AIOS helped me increase my corn yield by 35% while reducing fertilizer costs. The recommendations are
                spot-on!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  JD
                </div>
                <div>
                  <div className="font-semibold text-gray-900">John Davis</div>
                  <div className="text-sm text-gray-500">Corn Farmer, Iowa</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">★★★★★</div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "The supply chain integration saved me thousands. I now get the best prices and never run out of
                inputs."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Martinez</div>
                  <div className="text-sm text-gray-500">Vegetable Farmer, California</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">★★★★★</div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "The analytics dashboard gives me insights I never had before. My farm is more profitable than ever."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  RT
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Robert Thompson</div>
                  <div className="text-sm text-gray-500">Wheat Farmer, Kansas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Ready to Revolutionize
            <span className="block">Your Farm?</span>
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join over 10,000 farmers who are already using AIOS to maximize productivity, reduce costs, and build
            sustainable farming operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-12 py-4 bg-white text-green-600 hover:bg-gray-100 text-lg font-medium rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Free 30-Day Trial
              <span className="ml-2">→</span>
            </Link>
            <button className="inline-flex items-center justify-center px-12 py-4 border-2 border-white text-white hover:bg-white hover:text-green-600 text-lg font-medium rounded-lg bg-transparent backdrop-blur-sm transition-all duration-300">
              Schedule Personal Demo
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-green-100">
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Setup in 5 Minutes</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                    <span className="text-white text-xl">🌾</span>
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    AIOS
                  </span>
                  <div className="text-sm text-green-400 font-medium">Agricultural Intelligence</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Transforming agriculture through intelligent data analytics and AI-powered recommendations. Helping
                farmers worldwide achieve sustainable productivity and profitability.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span>🌐</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span>👥</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span>🏆</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-green-400">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mobile App
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-green-400">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Webinars
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Research
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-green-400">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Training
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2024 AIOS Agricultural Intelligence. All rights reserved.
            </p>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
