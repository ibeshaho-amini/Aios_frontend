"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  createFullRecommendation,
  createCropOnlyRecommendation,
  clearRecommendationState,
} from "../../Redux/Recommendation/cropRecommendation"
import {
  FiDroplet,
  FiThermometer,
  FiCloud,
  FiTrendingUp,
  FiFeather,
  FiBarChart2,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSun,
  FiCloudRain,
} from "react-icons/fi"

const PredictionForm = () => {
  const dispatch = useDispatch()
  const { isLoading, fullRecommendation, cropOnlyRecommendation, error, success } = useSelector(
    (state) => state.recommendation,
  )

  const [formData, setFormData] = useState({
    soil_type: "",
    nitrogen: "",
    phosphorous: "",
    potassium: "",
    ph_value: "",
    temperature: "",
    rainfall: "",
    humidity: "",
    moisture: "",
  })

  const [activeTab, setActiveTab] = useState("form")
  const [formErrors, setFormErrors] = useState({})

  // Debug logging
  useEffect(() => {
    console.log("Redux state updated:", {
      isLoading,
      fullRecommendation,
      cropOnlyRecommendation,
      error,
      success,
    })
  }, [isLoading, fullRecommendation, cropOnlyRecommendation, error, success])

  // Auto-switch to results tab when we get data or errors
  useEffect(() => {
    if (fullRecommendation || cropOnlyRecommendation || error) {
      console.log("Switching to results tab")
      setActiveTab("results")
    }
  }, [fullRecommendation, cropOnlyRecommendation, error])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Form validation
  const validateForm = () => {
    const errors = {}
    const requiredFields = [
      "soil_type",
      "nitrogen",
      "phosphorous",
      "potassium",
      "ph_value",
      "temperature",
      "rainfall",
      "humidity",
      "moisture",
    ]

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        errors[field] = "This field is required"
      }
    })

    // Validate numeric ranges
    if (formData.ph_value && (Number.parseFloat(formData.ph_value) < 0 || Number.parseFloat(formData.ph_value) > 14)) {
      errors.ph_value = "pH value must be between 0 and 14"
    }

    if (formData.humidity && (Number.parseFloat(formData.humidity) < 0 || Number.parseFloat(formData.humidity) > 100)) {
      errors.humidity = "Humidity must be between 0 and 100%"
    }

    if (formData.moisture && (Number.parseFloat(formData.moisture) < 0 || Number.parseFloat(formData.moisture) > 100)) {
      errors.moisture = "Moisture must be between 0 and 100%"
    }

    if (formData.temperature && Number.parseFloat(formData.temperature) < -50) {
      errors.temperature = "Temperature seems too low"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFullSubmit = async (e) => {
    e.preventDefault()
    console.log("Full recommendation submitted with data:", formData)

    if (!validateForm()) {
      console.log("Form validation failed:", formErrors)
      return
    }

    try {
      const result = await dispatch(createFullRecommendation(formData))
      console.log("Full recommendation result:", result)
    } catch (error) {
      console.error("Full recommendation error:", error)
    }
  }

  const handleCropOnlySubmit = async (e) => {
    e.preventDefault()
    console.log("Crop-only recommendation submitted with data:", formData)

    if (!validateForm()) {
      console.log("Form validation failed:", formErrors)
      return
    }

    try {
      const result = await dispatch(createCropOnlyRecommendation(formData))
      console.log("Crop-only recommendation result:", result)
    } catch (error) {
      console.error("Crop-only recommendation error:", error)
    }
  }

  const clearResults = () => {
    console.log("Clearing results")
    dispatch(clearRecommendationState())
    setActiveTab("form")
  }

  const soilTypes = ["Sandy", "Clay", "Loamy", "Silt", "Peaty", "Chalky"]

  const InputField = ({ icon, label, name, type = "text", placeholder, options = null, min, max, step }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <span className="text-green-600">{icon}</span>
        {label}
      </label>
      {options ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
            formErrors[name] ? "border-red-300" : "border-gray-200"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
            formErrors[name] ? "border-red-300" : "border-gray-200"
          }`}
        />
      )}
      {formErrors[name] && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4" />
          {formErrors[name]}
        </p>
      )}
    </div>
  )

  const RecommendationCard = ({ title, data, icon, color = "green" }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <span className={`text-${color}-600 text-xl`}>{icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>

      {/* Handle both API response formats */}
      {(data.crop_predicted || data.recommended_crop) && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FiFeather className="text-green-600" />
            <span className="font-medium text-gray-700">Recommended Crop</span>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <span className="text-2xl font-bold text-green-700">{data.crop_predicted || data.recommended_crop}</span>
          </div>
        </div>
      )}

      {(data.fertilizer_predicted || data.fertilizer_recommendation) && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="text-blue-600" />
            <span className="font-medium text-gray-700">Fertilizer Recommendation</span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <span className="text-lg font-semibold text-blue-700">
              {data.fertilizer_predicted || data.fertilizer_recommendation}
            </span>
          </div>
        </div>
      )}

      {data.disease_prediction && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertCircle className="text-orange-600" />
            <span className="font-medium text-gray-700">Disease Prediction</span>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <span className="text-lg font-semibold text-orange-700">{data.disease_prediction}</span>
          </div>
        </div>
      )}

      {data.yield_prediction && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FiBarChart2 className="text-purple-600" />
            <span className="font-medium text-gray-700">Yield Prediction</span>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <span className="text-lg font-semibold text-purple-700">{data.yield_prediction}</span>
          </div>
        </div>
      )}

      {/* API Response Details */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {data.status && (
            <div>
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center gap-1 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    data.status === "Completed"
                      ? "bg-green-500"
                      : data.status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                  }`}
                ></div>
                <span className="font-medium text-gray-700">{data.status}</span>
              </div>
            </div>
          )}

          {data.timestamp && (
            <div>
              <span className="text-gray-600">Generated:</span>
              <p className="font-medium text-gray-700 mt-1">{new Date(data.timestamp).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Input Parameters Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Input Parameters:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          {data.soil_type && data.soil_type !== "Unknown" && (
            <div>
              Soil: <span className="font-medium">{data.soil_type}</span>
            </div>
          )}
          {data.temperature && (
            <div>
              Temp: <span className="font-medium">{data.temperature}°C</span>
            </div>
          )}
          {data.nitrogen && (
            <div>
              N: <span className="font-medium">{data.nitrogen}</span>
            </div>
          )}
          {data.phosphorous && (
            <div>
              P: <span className="font-medium">{data.phosphorous}</span>
            </div>
          )}
          {data.potassium && (
            <div>
              K: <span className="font-medium">{data.potassium}</span>
            </div>
          )}
          {data.humidity > 0 && (
            <div>
              Humidity: <span className="font-medium">{data.humidity}%</span>
            </div>
          )}
        </div>
      </div>

      {(data.confidence_score || data.confidence) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Confidence Score</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${color}-500 transition-all duration-500`}
                  style={{ width: `${data.confidence_score || data.confidence || 85}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {data.confidence_score || data.confidence || 85}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Crop Recommendation System</h1>
            <p className="text-gray-600">
              Get AI-powered recommendations for your farm based on soil and weather conditions
            </p>
          </div>
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
            <FiFeather className="text-green-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "form"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Input Parameters
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "results"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Recommendations
          </button>
        </div>

        <div className="p-6">
          {activeTab === "form" && (
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Soil Parameters */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiDroplet className="text-blue-600" />
                  Soil Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={<FiDroplet />}
                    label="Soil Type"
                    name="soil_type"
                    placeholder="Select soil type"
                    options={soilTypes}
                  />
                  <InputField
                    icon={<FiTrendingUp />}
                    label="pH Value"
                    name="ph_value"
                    type="number"
                    placeholder="6.5"
                    min="0"
                    max="14"
                    step="0.1"
                  />
                  <InputField
                    icon={<FiBarChart2 />}
                    label="Nitrogen (N) mg/kg"
                    name="nitrogen"
                    type="number"
                    placeholder="40"
                    min="0"
                  />
                  <InputField
                    icon={<FiBarChart2 />}
                    label="Phosphorous (P) mg/kg"
                    name="phosphorous"
                    type="number"
                    placeholder="30"
                    min="0"
                  />
                  <InputField
                    icon={<FiBarChart2 />}
                    label="Potassium (K) mg/kg"
                    name="potassium"
                    type="number"
                    placeholder="20"
                    min="0"
                  />
                  <InputField
                    icon={<FiDroplet />}
                    label="Soil Moisture (%)"
                    name="moisture"
                    type="number"
                    placeholder="65"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Weather Parameters */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiSun className="text-yellow-600" />
                  Weather Conditions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={<FiThermometer />}
                    label="Temperature (°C)"
                    name="temperature"
                    type="number"
                    placeholder="25"
                    min="-50"
                    max="60"
                  />
                  <InputField
                    icon={<FiCloudRain />}
                    label="Rainfall (mm)"
                    name="rainfall"
                    type="number"
                    placeholder="150"
                    min="0"
                  />
                  <InputField
                    icon={<FiCloud />}
                    label="Humidity (%)"
                    name="humidity"
                    type="number"
                    placeholder="70"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleFullSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />}
                  {isLoading ? "Analyzing..." : "Get Full Recommendation"}
                </button>
                <button
                  type="button"
                  onClick={handleCropOnlySubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiFeather />}
                  {isLoading ? "Analyzing..." : "Get Crop Recommendation"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "results" && (
            <div className="space-y-6">
              {/* Status Messages */}
              {isLoading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                  <FiRefreshCw className="text-yellow-600 animate-spin" />
                  <span className="text-yellow-700">Analyzing your farm data...</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <FiCheckCircle className="text-green-600" />
                  <span className="text-green-700">{success}</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <FiAlertCircle className="text-red-600" />
                  <span className="text-red-700">
                    {typeof error === "string" ? error : error.detail || error.message || "Something went wrong."}
                  </span>
                </div>
              )}

              {/* Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {fullRecommendation && (
                  <RecommendationCard
                    title="Complete Farm Analysis"
                    data={fullRecommendation}
                    icon={<FiBarChart2 />}
                    color="green"
                  />
                )}

                {cropOnlyRecommendation && (
                  <RecommendationCard
                    title="Crop Recommendation"
                    data={cropOnlyRecommendation}
                    icon={<FiFeather />}
                    color="blue"
                  />
                )}
              </div>

              {/* Action Buttons */}
              {(fullRecommendation || cropOnlyRecommendation) && (
                <div className="flex justify-center pt-6 border-t border-gray-100">
                  <button
                    onClick={clearResults}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <FiRefreshCw />
                    New Analysis
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !fullRecommendation && !cropOnlyRecommendation && !error && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFeather className="text-gray-400 text-3xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No recommendations yet</h3>
                  <p className="text-gray-500 mb-4">Fill out the form to get AI-powered crop recommendations</p>
                  <button
                    onClick={() => setActiveTab("form")}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start Analysis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Debug Section - Remove in production */}
      {process.env.NODE_ENV === "development" && (fullRecommendation || cropOnlyRecommendation) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Debug - API Response:</h4>
          <pre className="text-xs text-gray-600 overflow-auto max-h-40">
            {JSON.stringify(fullRecommendation || cropOnlyRecommendation, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default PredictionForm
