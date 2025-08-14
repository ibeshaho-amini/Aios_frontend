"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchFertilizerPlan,
  submitFertilizerToAgronomist,
  clearRecommendationState,
} from "../../Redux/Recommendation/reviews" // keep or adjust path
import { FiX, FiAlertCircle } from "react-icons/fi"

const FertilizerSubmitModal = ({ isOpen, onClose, initialCrop = "" }) => {
  const dispatch = useDispatch()

  const {
    isLoading,
    isFertilizerLoading,
    fertilizerPlan,
    fertilizerSubmitResult,
    error,
    success,
  } = useSelector((state) => state.recommend || {})

  const [crop, setCrop] = useState("")
  const [statusMsg, setStatusMsg] = useState("")
  const [userId, setUserId] = useState(null)

  // Load user_id from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user_id")
    if (stored) setUserId(stored)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setCrop(initialCrop || "")
      setStatusMsg("")
    } else {
      setCrop("")
      setStatusMsg("")
      // Optionally clear slice state
      // dispatch(clearRecommendationState())
    }
  }, [isOpen, initialCrop])

  const handlePreviewPlan = async () => {
    if (!crop.trim()) {
      setStatusMsg("Please enter a crop name first.")
      return
    }
    setStatusMsg("")
    dispatch(fetchFertilizerPlan(crop.trim()))
  }

  const handleSubmit = async () => {
    if (!crop.trim()) {
      setStatusMsg("Please enter a crop name first.")
      return
    }
    if (!userId) {
      setStatusMsg("User session not found. Please log in again.")
      return
    }
    setStatusMsg("")
    try {
      await dispatch(
        submitFertilizerToAgronomist({
          crop_name: crop.trim(),
          // Include user_id both top-level and inside farmer_inputs for audit/trace
          user_id: userId,
          farmer_inputs: {
            crop_name: crop.trim(),
            user_id: userId,
          },
          // use_ml: true,
          // ml_inputs: { ... }
        })
      ).unwrap()
      setStatusMsg("Sent to agronomist successfully.")
      setTimeout(() => {
        onClose?.()
      }, 900)
    } catch (err) {
      setStatusMsg(err?.detail || "Failed to submit fertilizer plan.")
    }
  }

  if (!isOpen) return null

  const renderPlan = (plan) => {
    if (!plan) return null
    if (typeof plan === "object" && !Array.isArray(plan)) {
      const entries = Object.entries(plan)
      return (
        <div className="space-y-3">
          {entries.map(([key, val]) => (
            <div key={key} className="text-sm">
              <div className="font-semibold text-gray-900">{key}</div>
              <div className="text-gray-700">
                {typeof val === "object" ? (
                  <pre className="bg-white p-3 rounded border text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(val, null, 2)}
                  </pre>
                ) : (
                  String(val)
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }
    return (
      <pre className="bg-white p-3 rounded border text-xs whitespace-pre-wrap break-words">
        {JSON.stringify(plan, null, 2)}
      </pre>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      {/* Wider modal with fixed height and internal scroll */}
      <div className="bg-white w-full max-w-6xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Send Fertilizer Plan to Agronomist
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content grid: two columns on large screens */}
        <div className="h-[calc(80vh-64px)] overflow-hidden px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left: form and actions (scrollable) */}
            <div className="flex flex-col gap-4 overflow-auto pr-1">
              {!userId && (
                <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                  User session missing. You may need to log in again.
                </div>
              )}

              {statusMsg && (
                <div className="text-sm text-gray-700">{statusMsg}</div>
              )}
              {error && (
                <div className="flex items-start gap-2 p-3 border border-red-200 rounded bg-red-50 text-sm text-red-700">
                  <FiAlertCircle className="mt-0.5" />
                  <span>{error.detail || "Action failed."}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Crop
                </label>
                <input
                  type="text"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder="e.g., Maize"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only crop name is required. We’ll send it to the agronomist as a fertilizer recommendation.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePreviewPlan}
                  disabled={!crop.trim() || isFertilizerLoading}
                  className={`px-4 py-2 rounded-lg text-sm border ${
                    !crop.trim() || isFertilizerLoading
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {isFertilizerLoading ? "Loading..." : "Preview Plan"}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!crop.trim() || isLoading || !userId}
                  className={`px-4 py-2 rounded-lg text-sm text-white ${
                    !crop.trim() || isLoading || !userId
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isLoading ? "Sending..." : "Send to Agronomist"}
                </button>
              </div>

              {success && (
                <div className="text-sm text-green-700">{success}</div>
              )}
            </div>

            {/* Right: plan preview (fills column and scrolls) */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="text-sm font-semibold text-gray-900 mb-2">
                Fertilizer Plan Preview
              </div>
              <div className="bg-gray-50 border rounded-xl p-4 h-full overflow-auto">
                {!fertilizerPlan && (
                  <p className="text-sm text-gray-500">
                    Enter a crop and click “Preview Plan” to see the recommended plan.
                  </p>
                )}
                {fertilizerPlan && renderPlan(fertilizerPlan)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FertilizerSubmitModal