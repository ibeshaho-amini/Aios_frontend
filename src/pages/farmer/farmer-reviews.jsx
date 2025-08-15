
"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchMyRecommendations } from "../../Redux/Recommendation/cropRecommendation"
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiChevronRight,
  FiEye,
  FiCalendar,
  FiUser,
} from "react-icons/fi"

import RecommendationReportModal from "../farmer/farmer-detailedReview"

const FarmerRecommendations = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { myRecommendations, isLoading, error } = useSelector(
    (state) => state.recommendation
  )

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")

  // Modal state
  const [reportOpen, setReportOpen] = useState(false)
  const [activeRecId, setActiveRecId] = useState(null)

  useEffect(() => {
    dispatch(fetchMyRecommendations())
  }, [dispatch])

  const openReport = (id) => {
    setActiveRecId(id)
    setReportOpen(true)
  }

  const closeReport = () => {
    setReportOpen(false)
    setActiveRecId(null)
  }

  // Format date
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "translated": return "bg-green-100 text-green-800 border-green-200"
      case "returned": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in_review": return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending_review": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Plan renderer
  const renderPlan = (plan) => {
    if (!plan) return null
    if (typeof plan !== "object" || Array.isArray(plan)) {
      return (
        <pre className="bg-gray-50 p-3 rounded border text-xs whitespace-pre-wrap break-words">
          {JSON.stringify(plan, null, 2)}
        </pre>
      )
    }
    const entries = Object.entries(plan)
    if (entries.length === 0) {
      return <p className="text-sm text-gray-500">No plan details provided.</p>
    }
    return (
      <div className="space-y-3">
        {entries.map(([k, v]) => (
          <div key={k}>
            <div className="font-semibold text-gray-800">{k}</div>
            {typeof v === "object" ? (
              <pre className="bg-gray-50 p-3 rounded border text-xs whitespace-pre-wrap break-words">
                {JSON.stringify(v, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-700">{String(v)}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Filter/sort
  const filteredRecommendations = myRecommendations
    ?.filter((rec) => {
      if (statusFilter !== "all" && rec.status !== statusFilter) return false
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase()
        const crop = (rec.crop_predicted || rec.ai_outputs?.crop_predicted || "").toLowerCase()
        const soil = (rec.soil_type || "").toLowerCase()
        return crop.includes(q) || soil.includes(q)
      }
      return true
    })
    ?.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp)
    )

  const statusCounts = myRecommendations?.reduce((counts, rec) => {
    counts[rec.status] = (counts[rec.status] || 0) + 1
    return counts
  }, {})

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">My Recommendations</h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: `All (${myRecommendations?.length || 0})` },
          { key: "translated", label: `Translated (${statusCounts?.translated || 0})`, icon: <FiCheckCircle /> },
          { key: "returned", label: `Returned (${statusCounts?.returned || 0})`, icon: <FiCheckCircle /> },
          { key: "in_review", label: `In Review (${statusCounts?.in_review || 0})`, icon: <FiClock /> },
          { key: "pending_review", label: `Pending (${statusCounts?.pending_review || 0})`, icon: <FiClock /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-full border flex items-center gap-1 ${
              statusFilter === key
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {icon || null} {label}
          </button>
        ))}
      </div>

      {/* Search/sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by crop or soil type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <button
          onClick={() => dispatch(fetchMyRecommendations())}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Loading/error */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
          <FiAlertCircle />
          <span>Error loading recommendations: {error.detail || "Unknown error"}</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && filteredRecommendations?.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FiFileText className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No recommendations found</h3>
          <p className="text-gray-500">Try changing your filters or create a new one.</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {filteredRecommendations?.map((rec) => {
          const isReviewed = ["translated", "returned"].includes(rec.status)
          const hasFertilizerPlan = !!(rec?.fertilizer_plan && Object.keys(rec.fertilizer_plan || {}).length)

          return (
            <div key={rec.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {hasFertilizerPlan ? "Fertilizer" : "Crop"}: {rec.crop_predicted || rec.ai_outputs?.crop_predicted || "Unknown"}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <FiCalendar /> {formatDate(rec.timestamp)}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <FiUser /> {rec.agronomist_username || "Unassigned"}
                      </span>
                      <span className={`px-2 py-1 rounded-full border flex items-center gap-1 text-xs ${getStatusBadge(rec.status)}`}>
                        {rec.status === "in_review" || rec.status === "pending_review" ? <FiClock /> : <FiCheckCircle />}
                        {rec.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Always allow Details (page) */}
                    <button
                      onClick={() => navigate(`/recommendations/${rec.id}`)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <FiEye /> Details
                    </button>
                    {/* Report only for reviewed */}
                    {isReviewed && (
                      <button
                        onClick={() => openReport(rec.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-green-700"
                      >
                        <FiFileText /> View Report
                      </button>
                    )}
                  </div>
                </div>

                {/* Body preview */}
                {hasFertilizerPlan ? (
                  // Fertilizer preview
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">Fertilizer Plan</div>
                      {renderPlan(rec.fertilizer_plan)}
                    </div>
                    {(rec.ai_outputs?.fertilizer_quantity ||
                      rec.ai_outputs?.application_timing ||
                      rec.ai_outputs?.application_method) && (
                      <div className="bg-gray-50 border rounded p-3">
                        <div className="text-sm font-semibold text-gray-800 mb-2">Usage (ML)</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <p><strong>Quantity:</strong> {rec.ai_outputs?.fertilizer_quantity ?? "N/A"}</p>
                          <p><strong>Timing:</strong> {rec.ai_outputs?.application_timing ?? "N/A"}</p>
                          <p><strong>Method:</strong> {rec.ai_outputs?.application_method ?? "N/A"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Soil preview for crop-only
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-gray-500">Soil Type:</span><span className="ml-1 font-medium">{rec.soil_type || "N/A"}</span></div>
                    <div><span className="text-gray-500">pH:</span><span className="ml-1 font-medium">{rec.ph_value || "N/A"}</span></div>
                    <div><span className="text-gray-500">Temperature:</span><span className="ml-1 font-medium">{rec.temperature || "N/A"}°C</span></div>
                    <div><span className="text-gray-500">Humidity:</span><span className="ml-1 font-medium">{rec.humidity || "N/A"}%</span></div>
                  </div>
                )}

                {/* Preview of translated summary for reviewed */}
                {isReviewed && rec.translated_summary && (
                  <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-700 line-clamp-2">{rec.translated_summary}</p>
                    {rec.translated_summary.length > 150 && (
                      <button
                        onClick={() => openReport(rec.id)}
                        className="text-blue-600 text-sm mt-1 flex items-center gap-1"
                      >
                        Read more <FiChevronRight />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Report Modal */}
      <RecommendationReportModal
        recId={activeRecId}
        isOpen={reportOpen}
        onClose={closeReport}
      />
    </div>
  )
}

export default FarmerRecommendations