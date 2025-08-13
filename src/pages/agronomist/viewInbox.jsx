import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  getRecommendationDetails,
  claimRecommendation,
  reviewRecommendation,
} from "../../../Redux/Recommendation/cropRecommendation"

import {
  FiArrowLeft,
  FiUserCheck,
  FiCheckCircle,
  FiSend,
  FiClipboard,
} from "react-icons/fi"

export default function RecommendationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { selectedRecommendation: rec, isLoading, error } = useSelector(
    (state) => state.recommendation
  )

  const [agronomistNotes, setAgronomistNotes] = useState("")
  const [translatedSummary, setTranslatedSummary] = useState("")
  const [statusError, setStatusError] = useState("")
  const [submitMessage, setSubmitMessage] = useState("")

  // Fetch recommendation on load
  useEffect(() => {
    if (id) dispatch(getRecommendationDetails(id))
  }, [dispatch, id])

  useEffect(() => {
    if (rec) {
      setAgronomistNotes(rec.agronomist_notes || "")
      setTranslatedSummary(rec.translated_summary || "")
    }
  }, [rec])

  const handleClaim = async () => {
    await dispatch(claimRecommendation(id))
    dispatch(getRecommendationDetails(id))
  }

  const handleReviewSubmit = async (status) => {
    if (translatedSummary.trim() === "" || agronomistNotes.trim() === "") {
      setStatusError("Please fill in both notes and summary first.")
      return
    }

    setStatusError("")
    setSubmitMessage("Submitting...")
    try {
      await dispatch(
        reviewRecommendation({
          recId: id,
          data: {
            status,
            agronomist_notes: agronomistNotes,
            translated_summary: translatedSummary,
          },
        })
      ).unwrap()

      dispatch(getRecommendationDetails(id))
      setSubmitMessage("Review submitted successfully!")
    } catch (err) {
      console.error(err)
      setStatusError("Failed to submit review.")
    } finally {
      setTimeout(() => setSubmitMessage(""), 3000)
    }
  }

  if (isLoading || !rec) return <div className="p-6">Loading recommendation...</div>
  if (error) return <div className="p-6 text-red-500">Failed to load recommendation.</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 flex items-center hover:underline"
      >
        <FiArrowLeft className="mr-1" /> Back to Inbox
      </button>

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <FiClipboard className="text-green-600 text-2xl" />
        <h1 className="text-2xl font-bold text-green-700">
          Recommendation #{rec.id}
        </h1>
      </div>

      {/* CARD */}
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p><strong>Submitted:</strong> {new Date(rec.timestamp).toLocaleString()}</p>
          <p><strong>Status:</strong> <span className="capitalize text-blue-700">{rec.status}</span></p>
          <p><strong>Soil:</strong> {rec.soil_type}</p>
          <p><strong>Moisture:</strong> {rec.moisture} %</p>
          <p><strong>pH:</strong> {rec.ph_value}</p>
          <p><strong>Temp:</strong> {rec.temperature}°C</p>
          <p><strong>Humidity:</strong> {rec.humidity} %</p>
          <p><strong>Rainfall:</strong> {rec.rainfall} mm</p>
          <p><strong>N (Nitrogen):</strong> {rec.nitrogen}</p>
          <p><strong>P (Phosphorous):</strong> {rec.phosphorous}</p>
          <p><strong>K (Potassium):</strong> {rec.potassium}</p>
          <p><strong>Predicted Crop:</strong> <span className="text-green-600 font-semibold">{rec.crop_predicted || "N/A"}</span></p>
        </div>

        {/* AGRONOMIST NOTES */}
        <div className="pt-4 border-t">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Agronomist Notes</label>
          <textarea
            value={agronomistNotes}
            onChange={(e) => setAgronomistNotes(e.target.value)}
            className="w-full rounded border border-gray-300 p-3 text-sm resize-none"
            rows={4}
            placeholder="Internal review comments..."
          />
        </div>

        {/* TRANSLATED SUMMARY */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Translated Summary for Farmer</label>
          <textarea
            value={translatedSummary}
            onChange={(e) => setTranslatedSummary(e.target.value)}
            className="w-full rounded border border-gray-300 p-3 text-sm resize-none"
            rows={4}
            placeholder="Write a farmer-friendly version here..."
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-4 items-center mt-4">
          {!rec.agronomist_id && (
            <button
              onClick={handleClaim}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <FiUserCheck className="inline-block mr-1" />
              Claim Task
            </button>
          )}

          {rec.agronomist_id && (
            <>
              <button
                onClick={() => handleReviewSubmit("translated")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <FiCheckCircle className="inline-block mr-1" />
                Mark as Translated
              </button>
              <button
                onClick={() => handleReviewSubmit("returned")}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                <FiSend className="inline-block mr-1" />
                Return to Farmer
              </button>
            </>
          )}

          {statusError && <p className="text-sm text-red-600">{statusError}</p>}
          {submitMessage && <p className="text-sm text-green-600">{submitMessage}</p>}
        </div>
      </div>
    </div>
  )
}