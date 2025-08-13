import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchInbox,
  claimRecommendation,
  reviewRecommendation,
} from "../../Redux/Recommendation/cropRecommendation"
import {
  FiFeather,
  FiClock,
  FiUserCheck,
  FiCheckCircle,
  FiSend,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiBell,
  FiSearch,
} from "react-icons/fi"

const AgronomistInbox = () => {
  const dispatch = useDispatch()
  const { inbox, isLoading, error } = useSelector(state => state.recommendation)
  
  // Get user ID directly from localStorage
  const [currentUserId, setCurrentUserId] = useState(null)
  
  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem("user_id")
    if (storedUserId) {
      setCurrentUserId(storedUserId)
      console.log("User ID from localStorage:", storedUserId)
    } else {
      console.warn("No user_id found in localStorage")
    }
  }, [])
  
  const [openId, setOpenId] = useState(null)
  const [status, setStatus] = useState({})
  const [notes, setNotes] = useState("")
  const [summary, setSummary] = useState("")
  const [claimedIds, setClaimedIds] = useState([])

  // Filters/Search
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    dispatch(fetchInbox())
  }, [dispatch])

  const toggleOpen = (id) => {
    setStatus({})
    setOpenId(prev => (prev === id ? null : id))
    const selected = inbox.find((rec) => rec.id === id)
    setNotes(selected?.agronomist_notes || "")
    setSummary(selected?.translated_summary || "")
  }

  const handleClaim = async (id) => {
    if (!currentUserId) {
      console.error("Cannot claim: User ID is not available")
      return
    }
    
    await dispatch(claimRecommendation(id))
    setClaimedIds(prev => [...prev, id])
    dispatch(fetchInbox())
  }

  const handleSubmit = async (id, newStatus) => {
    if (!currentUserId) {
      console.error("Cannot submit: User ID is not available")
      return
    }
    
    if (!summary.trim() || !notes.trim()) {
      setStatus({ type: "error", message: "Please fill both fields.", id })
      return
    }

    await dispatch(
      reviewRecommendation({
        recId: id,
        updates: {
          status: newStatus,
          agronomist_notes: notes,
          translated_summary: summary,
        },
      })
    )

    setStatus({ type: "success", message: "Updated successfully!", id })
    setTimeout(() => {
      dispatch(fetchInbox())
      setOpenId(null)
    }, 1500)
  }

  // 🔍 Search + Filter Logic
  const filteredList = inbox
    ?.filter((rec) => {
      const matchesSearch = searchTerm.trim()
        ? (rec.crop_predicted || "").toLowerCase().includes(searchTerm.toLowerCase())
        : true
      const matchesFilter = filterStatus === "all" || rec.status === filterStatus
      return matchesSearch && matchesFilter
    })
    ?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const newCount = inbox?.filter(r => r.status === "pending_review").length

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Auth warning */}
      {!currentUserId && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Your user session may not be properly loaded. You might need to log in again.</p>
        </div>
      )}
      
      {/* Header with Notification */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
          <FiFeather className="text-green-600" />
          Agronomist Inbox
        </h1>
        <div className="flex items-center gap-3">
          <FiBell className="text-yellow-500 text-xl" />
          <span className="text-sm text-gray-700">
            🔔 {newCount} New Recommendations
          </span>
        </div>
      </div>

      {/* Search + Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative w-64">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            value={searchTerm}
            type="text"
            placeholder="Search by crop..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-10 py-2 border rounded-lg"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending_review">Pending</option>
          <option value="in_review">In Review</option>
          <option value="translated">Translated</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Result List */}
      <div className="space-y-4">
        {isLoading && <div className="text-yellow-600">Loading...</div>}
        {error && <div className="text-red-600">Error loading data</div>}
        {!isLoading && filteredList?.length === 0 && (
          <div className="text-gray-500">No matching recommendations</div>
        )}

        {filteredList?.map((rec) => {
          const isReviewed = ["translated", "returned"].includes(rec.status)
          const isInReview = rec.status === "in_review"
          const isMine = currentUserId && String(rec.agronomist_id) === String(currentUserId)
          const isJustClaimed = claimedIds.includes(rec.id)
          const readOnly = isReviewed
          const showForm = openId === rec.id

          return (
            <div
              key={rec.id}
              className={`bg-white border ${
                isReviewed ? "border-green-300" : "border-gray-200"
              } rounded-lg p-4 shadow`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                    Crop: {rec.crop_predicted || rec.ai_outputs?.crop_predicted || "Unknown"}
                    {isReviewed && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <FiCheck /> Reviewed
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <FiClock /> {new Date(rec.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 mt-1 capitalize">
                    Status: {rec.status}
                  </p>
                  {rec.agronomist_username && (
                    <p className="text-sm text-gray-500 mt-1">
                      Reviewed by: <strong>{rec.agronomist_username}</strong>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleOpen(rec.id)}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  {showForm ? <FiChevronUp /> : <FiChevronDown />}
                  {showForm ? "Hide" : "View"}
                </button>
              </div>

              {showForm && (
                <div className="border-t mt-4 pt-4 space-y-4 text-sm text-gray-700">
                  {/* Inputs Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <p><strong>Soil:</strong> {rec.soil_type}</p>
                    <p><strong>Moisture:</strong> {rec.moisture}%</p>
                    <p><strong>pH:</strong> {rec.ph_value}</p>
                    <p><strong>Temperature:</strong> {rec.temperature}°C</p>
                    <p><strong>Humidity:</strong> {rec.humidity}%</p>
                    <p><strong>Rainfall:</strong> {rec.rainfall} mm</p>
                    <p><strong>N:</strong> {rec.nitrogen}</p>
                    <p><strong>P:</strong> {rec.phosphorous}</p>
                    <p><strong>K:</strong> {rec.potassium}</p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block font-medium mb-1">Agronomist Notes:</label>
                    <textarea
                      className="w-full border rounded p-2 text-sm"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      disabled={readOnly}
                    />
                  </div>

                  {/* Translation */}
                  <div>
                    <label className="block font-medium mb-1">Translated Summary:</label>
                    <textarea
                      className="w-full border rounded p-2 text-sm"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={3}
                      disabled={readOnly}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Claim button - only show if not claimed and user is logged in */}
                    {currentUserId && rec.status === "pending_review" && !rec.agronomist_id && !isJustClaimed && (
                      <button
                        onClick={() => handleClaim(rec.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                      >
                        <FiUserCheck />
                        Claim Task
                      </button>
                    )}

                    {/* Show review buttons if not reviewed and either mine or just claimed */}
                    {!isReviewed && (isMine || isJustClaimed) && (
                      <>
                        <button
                          onClick={() => handleSubmit(rec.id, "translated")}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                          <FiCheckCircle />
                          Mark as Translated
                        </button>
                        <button
                          onClick={() => handleSubmit(rec.id, "returned")}
                          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center gap-2"
                        >
                          <FiSend />
                          Return to Farmer
                        </button>
                      </>
                    )}

                    {status?.id === rec.id && (
                      <p
                        className={`text-sm ${
                          status.type === "error" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {status.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AgronomistInbox