"use client"

import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  listMyFeedbacks,
  createFeedback,
  clearFeedbackError,
  clearFeedbackSuccess,
} from "../../Redux/farmer/feebackSlice"
import {
  FiMessageSquare,
  FiSend,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiCheckCircle,
} from "react-icons/fi"

export default function FarmerFeedbackPage() {
  const dispatch = useDispatch()
  const { mine, myMeta, isLoadingMine, isCreating, error, success } = useSelector((s) => s.feedback)

  // EXACTLY as requested: read user_id like this
  const userId = useMemo(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_id") || "{}")
      // userData may be a number (1), string "1", or an object { id: 1 }
      if (typeof userData === "number") return userData
      if (typeof userData === "string") {
        const n = Number(userData)
        return Number.isFinite(n) ? n : null
      }
      if (userData && typeof userData === "object") {
        const n = Number(userData?.id ?? userData)
        return Number.isFinite(n) ? n : null
      }
      return null
    } catch {
      return null
    }
  }, [])

  // Form state
  const [content, setContent] = useState("")
  const [localError, setLocalError] = useState("")

  // Filters
  const [statusFilter, setStatusFilter] = useState("all") // all | new | reviewed | responded
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const canSubmit = content.trim().length >= 5 && !isCreating && !!userId

  const fetchMine = () => {
    dispatch(
      listMyFeedbacks({
        status: statusFilter === "all" ? "" : statusFilter,
        q: query || "",
        page,
        page_size: pageSize,
      })
    )
  }

  useEffect(() => {
    fetchMine()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page])

  const onSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchMine()
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")
    const msg = content.trim()

    if (!userId) {
      setLocalError("We couldn’t determine your account (user_id missing). Please log in again.")
      return
    }
    if (msg.length < 5) {
      setLocalError("Please enter at least 5 characters.")
      return
    }

    try {
      // Pass user_id for your serializer (user_id -> source='user')
      const res = await dispatch(createFeedback({ content: msg, user_id: userId }))
      if (!res.error) {
        setContent("")
        setPage(1)
        fetchMine()
      }
    } catch {
      // handled by slice
    }
  }

  const resetAlerts = () => {
    if (error) dispatch(clearFeedbackError())
    if (success) dispatch(clearFeedbackSuccess())
  }

  const totalCount = myMeta?.count ?? mine?.length ?? 0

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
          <FiMessageSquare className="text-emerald-600" /> Feedback
        </h1>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-800">{totalCount}</span>
        </div>
      </div>

      {/* Alerts */}
      {(error || success || localError || !userId) && (
        <div className="space-y-2">
          {!userId && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              We couldn’t find your user_id. Please log out and log in again.
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
              <FiCheckCircle /> {success}
              <button
                className="ml-auto text-emerald-700 hover:underline text-sm"
                onClick={resetAlerts}
              >
                Dismiss
              </button>
            </div>
          )}
          {localError && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              {localError}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {typeof error === "string" ? error : error.detail || error.message || "Something went wrong"}
            </div>
          )}
        </div>
      )}

      {/* Submit form */}
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <label className="text-sm font-medium text-gray-800">Share your feedback</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell us what's working well or what could be improved…"
          className="w-full min-h-[120px] p-3 border-2 rounded-lg focus:outline-none transition border-gray-200 focus:border-emerald-500"
          maxLength={2000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{content.trim().length} / 2000</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <FiSend />
              {isCreating ? "Sending…" : "Send Feedback"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="responded">Responded</option>
            </select>
            <button
              onClick={() => {
                setQuery("")
                setStatusFilter("all")
                setPage(1)
                fetchMine()
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Reset
            </button>
          </div>

          <form onSubmit={onSearch} className="w-full md:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search my feedback…"
                className="w-full md:w-72 pl-9 pr-24 py-2 border rounded-lg text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setPage(1)
                    fetchMine()
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            Showing: <span className="font-medium text-gray-800">{mine?.length || 0}</span>
            {myMeta?.count != null && (
              <>
                {" "}
                of <span className="font-medium text-gray-800">{myMeta.count}</span>
              </>
            )}
          </div>
          <button
            onClick={() => fetchMine()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {isLoadingMine ? (
          <LoadingListSkeleton />
        ) : mine?.length ? (
          <ul className="space-y-3">
            {mine.map((fb) => (
              <li key={fb.id} className="border rounded-lg p-4 hover:bg-emerald-50/40 transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusChip status={fb.status} />
                    <span className="text-xs text-gray-500">{formatDateTime(fb.created_at)}</span>
                  </div>
                </div>

                <div className="mt-2 text-gray-800 whitespace-pre-wrap">{fb.content}</div>

                {fb.response ? (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Response</div>
                    <div className="text-gray-800 whitespace-pre-wrap">{fb.response}</div>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-gray-500">No response yet.</div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 text-center py-10">No feedback found.</div>
        )}

        {/* Pagination */}
        {myMeta && (myMeta.has_prev || myMeta.has_next) && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!myMeta.has_prev}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Page <span className="font-medium text-gray-800">{myMeta.page}</span> of{" "}
              <span className="font-medium text-gray-800">
                {Math.ceil((myMeta.count || 0) / (myMeta.page_size || pageSize)) || 1}
              </span>
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!myMeta.has_next}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* Helpers */

function StatusChip({ status }) {
  const s = String(status || "").toLowerCase()
  const map = {
    new: "bg-amber-50 text-amber-700 border-amber-200",
    reviewed: "bg-blue-50 text-blue-700 border-blue-200",
    responded: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }
  const cls = map[s] || "bg-gray-50 text-gray-700 border-gray-200"
  return (
    <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {s || "—"}
    </span>
  )
}

function LoadingListSkeleton() {
  return (
    <ul className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className="mt-3 h-3 w-5/6 bg-gray-100 rounded" />
          <div className="mt-2 h-3 w-3/4 bg-gray-100 rounded" />
          <div className="mt-4 h-16 w-full bg-gray-50 rounded border" />
        </li>
      ))}
    </ul>
  )
}

function formatDateTime(s) {
  if (!s) return ""
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return String(s)
  return d.toLocaleString()
}