"use client"

import { useEffect, useState, memo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  createCropOnlyRecommendation,
  clearRecommendationState,
} from "../../Redux/Recommendation/cropRecommendation"

import {
  FiCheckCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiDroplet,
  FiThermometer,
  FiCloud,
  FiLayers,
} from "react-icons/fi"

import FertilizerSubmitModal from "../farmer/fertlizer"

// Stable Field component that won't lose cursor position
const StableField = memo(({ 
  label, 
  name, 
  value = "", 
  onChange, 
  error, 
  right,
  inputMode,
  pattern,
  placeholder
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        pattern={pattern}
        placeholder={placeholder}
        className={`w-full pr-16 pl-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border-gray-200 ${error ? "border-red-300" : ""}`}
      />
      {right && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-xs text-gray-500 bg-gray-50 border-l border-gray-200 rounded-r-lg">
          {right}
        </span>
      )}
    </div>
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
));

const PredictionForm = () => {
  const dispatch = useDispatch()
  const { isLoading, cropOnlyRecommendation, error, success } = useSelector(
    (state) => state.recommendation
  )

  const [userId, setUserId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fertModalOpen, setFertModalOpen] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    if (storedUserId) setUserId(storedUserId)
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
    const required = [
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
    const errs = {}
    required.forEach((f) => {
      if (!formData[f]) errs[f] = "Required"
    })
    if (formData.ph_value < 0 || formData.ph_value > 14) errs.ph_value = "pH must be between 0 and 14"
    if (formData.humidity < 0 || formData.humidity > 100) errs.humidity = "Humidity must be between 0–100%"
    if (formData.moisture < 0 || formData.moisture > 100) errs.moisture = "Moisture must be between 0–100%"
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setSubmissionMessage("")
    if (!validateForm()) return

    if (!userId) {
      setSubmissionMessage("❌ User ID not available. Please log in again.")
      return
    }

    try {
      setIsSubmitting(true)
      const dataWithUserId = {
        ...formData,
        user_id: userId,
        farmer_inputs: formData,
        ai_outputs: {},
      }
      const result = await dispatch(createCropOnlyRecommendation(dataWithUserId)).unwrap()
      if (result) {
        setSubmissionMessage("✅ Crop recommendation generated successfully.")
        setActiveTab("results")
      }
    } catch (err) {
      setSubmissionMessage("❌ Failed to generate recommendation: " + (err?.message || "Unknown error"))
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

  const initialCropFromResult = extractCrop(cropOnlyRecommendation)

  const ActionButton = ({ children, className = "", ...props }) => (
    <button
      {...props}
      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${className}`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Card with primary action (Fertilizer Usage moved up) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Crop Recommendation</h1>
              <p className="text-gray-500 mt-1">
                Enter your field parameters to get a suggested crop. You can also submit fertilizer usage.
              </p>
            </div>

            <ActionButton
              type="button"
              onClick={() => setFertModalOpen(true)}
              className="bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-2"
            >
              <FiDroplet /> Fertilizer Usage
            </ActionButton>
          </div>

          {!userId && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              Your session may not be loaded. Please log in again.
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6">
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "form" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                onClick={() => setActiveTab("form")}
              >
                Input
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "results" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                onClick={() => setActiveTab("results")}
              >
                Results
              </button>
            </div>
          </div>
        </div>

        {/* FORM TAB */}
        {activeTab === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Soil & Moisture */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FiLayers className="text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Soil & Moisture</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StableField 
                  label="Soil Type" 
                  name="soil_type" 
                  value={formData.soil_type} 
                  onChange={handleFieldChange} 
                  error={formErrors.soil_type} 
                />
                <StableField 
                  label="pH Value" 
                  name="ph_value" 
                  value={formData.ph_value} 
                  onChange={handleFieldChange} 
                  error={formErrors.ph_value} 
                  inputMode="decimal" 
                  pattern="^-?\d*\.?\d*$" 
                />
                <StableField 
                  label="Moisture" 
                  name="moisture" 
                  value={formData.moisture} 
                  onChange={handleFieldChange} 
                  error={formErrors.moisture} 
                  inputMode="decimal" 
                  pattern="^\d*\.?\d*$" 
                  right="%" 
                />
              </div>
            </div>

            {/* Nutrients */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FiDroplet className="text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Nutrients</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StableField 
                  label="Nitrogen" 
                  name="nitrogen" 
                  value={formData.nitrogen} 
                  onChange={handleFieldChange} 
                  error={formErrors.nitrogen} 
                  inputMode="decimal" 
                  pattern="^\d*\.?\d*$" 
                />
                <StableField 
                  label="Phosphorous" 
                  name="phosphorous" 
                  value={formData.phosphorous} 
                  onChange={handleFieldChange} 
                  error={formErrors.phosphorous} 
                  inputMode="decimal" 
                  pattern="^\d*\.?\d*$" 
                />
                <StableField 
                  label="Potassium" 
                  name="potassium" 
                  value={formData.potassium} 
                  onChange={handleFieldChange} 
                  error={formErrors.potassium} 
                  inputMode="decimal" 
                  pattern="^\d*\.?\d*$" 
                />
              </div>
            </div>

            {/* Environment */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FiThermometer className="text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Environment</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StableField 
                  label="Temperature" 
                  name="temperature" 
                  value={formData.temperature} 
                  onChange={handleFieldChange} 
                  error={formErrors.temperature} 
                  inputMode="decimal" 
                  pattern="^-?\d*\.?\d*$" 
                  right="°C" 
                />
                <StableField 
                  label="Humidity" 
                  name="humidity" 
                  value={formData.humidity} 
                  onChange={handleFieldChange} 
                  error={formErrors.humidity} 
                  inputMode="decimal" 
                  pattern="^\d*\.?\d*$" 
                  right="%" 
                />
                <StableField 
                  label="Rainfall" 
                  name="rainfall" 
                  value={formData.rainfall} 
                  onChange={handleFieldChange} 
                  error={formErrors.rainfall} 
                  inputMode="decimal" 
                  pattern="^\d*\.?\d*$" 
                  right="mm" 
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap gap-3 justify-end">
                <ActionButton
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Reset
                </ActionButton>
                <ActionButton
                  type="submit"
                  disabled={isLoading || isSubmitting || !userId}
                  className={`${userId && !isLoading && !isSubmitting ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"} text-white inline-flex items-center gap-2`}
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Get Crop Recommendation"
                  )}
                </ActionButton>
              </div>
            </div>
          </form>
        )}
      
        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {submissionMessage && (
              <div
                className={`${
                  submissionMessage.includes("✅")
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                } border px-4 py-3 rounded-lg flex items-center gap-2`}
              >
                {submissionMessage.includes("✅") ? <FiCheckCircle /> : <FiAlertCircle />}
                {submissionMessage}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3 text-green-800">
                <FiCheckCircle />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3 text-red-800">
                <FiAlertCircle />
                <span>{error?.detail || "Something went wrong"}</span>
              </div>
            )}

            {cropOnlyRecommendation && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      Crop Recommendation
                    </h3>
                    <p className="text-gray-700">
                      <span className="font-semibold">Recommended Crop:</span>{" "}
                      {extractCrop(cropOnlyRecommendation)}
                    </p>
                    {cropOnlyRecommendation.confidence && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Confidence:</span>{" "}
                        {cropOnlyRecommendation.confidence}%
                      </p>
                    )}
                  </div>
                  <ActionButton
                    type="button"
                    onClick={() => setFertModalOpen(true)}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-2"
                  >
                    <FiDroplet /> Fertilizer Usage
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fertilizer Modal */}
        <FertilizerSubmitModal
          isOpen={fertModalOpen}
          onClose={() => setFertModalOpen(false)}
          initialCrop={initialCropFromResult}
        />
      </div>
    </div>
  )
}

export default PredictionForm