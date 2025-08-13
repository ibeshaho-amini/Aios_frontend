"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  createCropOnlyRecommendation,
  clearRecommendationState,
} from "../../Redux/Recommendation/cropRecommendation"

import {
  FiCheckCircle,
  FiFeather,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi"

const PredictionForm = () => {
  const dispatch = useDispatch()
  const {
    isLoading,
    cropOnlyRecommendation,
    error,
    success,
  } = useSelector((state) => state.recommendation)

  // Get user ID from localStorage
  const [userId, setUserId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem("user_id")
    if (storedUserId) {
      setUserId(storedUserId)
      console.log("User ID from localStorage:", storedUserId)
    } else {
      console.warn("No user_id found in localStorage")
    }
  }, [])

  const [formData, setFormData] = useState({
    soil_type: "",
    nitrogen: "",
    phosphorous: "",
    potassium: "",
    ph_value: "",
    temperature: "",
    humidity: "",
    rainfall: "",
    moisture: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [activeTab, setActiveTab] = useState("form")
  const [submissionMessage, setSubmissionMessage] = useState("")

  const extractCrop = (data) =>
    data?.crop_predicted || data?.recommended_crop || ""

  const validateForm = () => {
    const requiredFields = [
      "soil_type",
      "nitrogen",
      "phosphorous",
      "potassium",
      "ph_value",
      "temperature",
      "humidity",
      "rainfall",
      "moisture",
    ]
    const errors = {}

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "Required"
      }
    })

    if (formData.ph_value < 0 || formData.ph_value > 14)
      errors.ph_value = "pH must be between 0 and 14"
    if (formData.humidity < 0 || formData.humidity > 100)
      errors.humidity = "Humidity must be between 0–100%"
    if (formData.moisture < 0 || formData.moisture > 100)
      errors.moisture = "Moisture must be between 0–100%"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting) return
    
    setSubmissionMessage("")
    if (!validateForm()) return

    if (!userId) {
      setSubmissionMessage("❌ User ID not available. Please log in again.")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Include user_id in the form data
      const dataWithUserId = {
        ...formData,
        user_id: userId,
        // Include farmer_inputs to ensure it's saved
        farmer_inputs: formData,
        // Include empty ai_outputs structure that will be filled by the backend
        ai_outputs: {}
      }
      
      // Only call the crop recommendation endpoint
      const result = await dispatch(createCropOnlyRecommendation(dataWithUserId)).unwrap()
      
      if (result) {
        setSubmissionMessage("✅ Crop recommendation generated successfully.")
        setActiveTab("results")
      }
    } catch (err) {
      console.error("Prediction error:", err)
      setSubmissionMessage("❌ Failed to generate recommendation: " + (err.message || "Unknown error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    dispatch(clearRecommendationState())
    setFormData({
      soil_type: "",
      nitrogen: "",
      phosphorous: "",
      potassium: "",
      ph_value: "",
      temperature: "",
      humidity: "",
      rainfall: "",
      moisture: "",
    })
    setFormErrors({})
    setSubmissionMessage("")
    setActiveTab("form")
  }

  // Check if we need to modify the backend endpoint
  useEffect(() => {
    console.log("You may need to update your backend to ensure AI outputs are saved properly.")
    console.log("The createCropOnlyRecommendation endpoint should save farmer_inputs and ai_outputs.")
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Crop Recommendation</h1>

      {/* Auth warning */}
      {!userId && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Your user session may not be properly loaded. You might need to log in again.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mt-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "form"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Input
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "results"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("results")}
        >
          Results
        </button>
      </div>

      {/* FORM TAB */}
      {activeTab === "form" && (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {[
            { name: "soil_type", label: "Soil Type", type: "text" },
            { name: "ph_value", label: "pH Value", type: "number" },
            { name: "moisture", label: "Moisture (%)", type: "number" },
            { name: "nitrogen", label: "Nitrogen", type: "number" },
            { name: "phosphorous", label: "Phosphorous", type: "number" },
            { name: "potassium", label: "Potassium", type: "number" },
            { name: "temperature", label: "Temperature (°C)", type: "number" },
            { name: "humidity", label: "Humidity (%)", type: "number" },
            { name: "rainfall", label: "Rainfall (mm)", type: "number" },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleFieldChange}
                className="w-full mt-1 px-4 py-2 border rounded-md"
              />
              {formErrors[name] && (
                <p className="text-sm text-red-500">{formErrors[name]}</p>
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || isSubmitting || !userId}
              className={`${
                userId && !isLoading && !isSubmitting 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-gray-400 cursor-not-allowed"
              } text-white px-6 py-2 rounded`}
            >
              {isLoading || isSubmitting ? (
                <span className="flex items-center gap-2">
                  <FiRefreshCw className="animate-spin" />
                  Loading...
                </span>
              ) : (
                "Get Crop Recommendation"
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {/* RESULTS TAB */}
      {activeTab === "results" && (
        <div className="space-y-6">
          {submissionMessage && (
            <div className={`${
              submissionMessage.includes("✅") 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-red-50 border-red-200 text-red-800"
            } border px-4 py-3 rounded flex items-center gap-2`}>
              {submissionMessage.includes("✅") ? <FiCheckCircle /> : <FiAlertCircle />}
              {submissionMessage}
            </div>
          )}

          {success && (
            <div className="bg-green-100 p-4 rounded flex items-center gap-3">
              <FiCheckCircle className="text-green-700" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 p-4 rounded flex items-center gap-3">
              <FiAlertCircle className="text-red-700" />
              <span>{error?.detail || "Something went wrong"}</span>
            </div>
          )}

          {cropOnlyRecommendation && (
            <div className="p-4 bg-white border rounded shadow">
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Crop Recommendation
              </h3>
              <p>
                <strong>Recommended Crop:</strong> {extractCrop(cropOnlyRecommendation)}
              </p>
              {cropOnlyRecommendation.confidence && (
                <p>
                  <strong>Confidence:</strong> {cropOnlyRecommendation.confidence}%
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PredictionForm