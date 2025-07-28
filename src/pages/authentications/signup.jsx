"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { signupUser, clearSuccessMessage } from "../../Redux/authentication/login"

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    address: "",
    phone_number: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const { isLoading, isRegistered, error } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (formData.username.length > 100) {
      newErrors.username = "Username must be less than 100 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (getPasswordStrength() < 3) {
      newErrors.password = "Password is too weak. Include uppercase, lowercase, numbers, and special characters"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select your role"
    }

    // Address validation
    if (!formData.address) {
      newErrors.address = "Address is required"
    } else if (formData.address.length < 10) {
      newErrors.address = "Please provide a complete address"
    }

    // Phone number validation
    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required"
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    dispatch(signupUser(formData))
  }

  useEffect(() => {
    if (isRegistered) {
      navigate("/login")
    }
  }, [isRegistered, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearSuccessMessage())
    }
  }, [dispatch])

  const getPasswordStrength = () => {
    let strength = 0
    const { password } = formData
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength()

  const renderError = (field) => errors[field] || (error && typeof error === "object" && error[field])

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
                <span className="text-white text-2xl">🌱</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join AIOS</h1>
          <p className="text-gray-600">Create your account and start optimizing your agricultural operations</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl border-0">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
              <span className="bg-green-100 text-green-800 border border-green-200 px-4 py-1 rounded-full text-sm font-medium">
                🌱 Agricultural Intelligence Platform
              </span>
            </div>

            {/* Error Alert from Redux */}
            {typeof error === "string" && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username and Email Row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Username Field */}
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700 block">
                    Username *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                        renderError("username")
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Enter username"
                      disabled={isLoading}
                    />
                  </div>
                  {renderError("username") && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {renderError("username")}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                        renderError("email")
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Enter email"
                      disabled={isLoading}
                    />
                  </div>
                  {renderError("email") && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {renderError("email")}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Fields Row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                    Password *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                        renderError("password")
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Enter password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Password strength:</span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength <= 2
                              ? "text-red-500"
                              : passwordStrength <= 3
                                ? "text-yellow-500"
                                : "text-green-500"
                          }`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {renderError("password") && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {renderError("password")}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                        renderError("confirmPassword")
                          ? "border-red-300 focus:border-red-500"
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? "border-green-300 focus:border-green-500"
                            : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-sm text-green-600 flex items-center">
                      <span className="mr-1">✅</span>
                      Passwords match
                    </p>
                  )}
                  {renderError("confirmPassword") && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {renderError("confirmPassword")}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-gray-700 block">
                  Role *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👥</span>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      renderError("role")
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-green-500"
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select your role</option>
                    <option value="farmer">🌾 Farmer - Optimize crop production</option>
                    <option value="supplier">📦 Supplier - Provide agricultural inputs</option>
                  </select>
                </div>
                {renderError("role") && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {renderError("role")}
                  </p>
                )}
              </div>

              {/* Address and Phone Row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Address Field */}
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700 block">
                    Address *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">📍</span>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                        renderError("address")
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Enter your complete address"
                      disabled={isLoading}
                    />
                  </div>
                  {renderError("address") && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {renderError("address")}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label htmlFor="phone_number" className="text-sm font-medium text-gray-700 block">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📞</span>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                        renderError("phone_number")
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Enter phone number"
                      disabled={isLoading}
                    />
                  </div>
                  {renderError("phone_number") && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {renderError("phone_number")}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 AIOS. Transforming agriculture through intelligence.</p>
        </div>
      </div>
    </div>
  )
}
