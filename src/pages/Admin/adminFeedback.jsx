"use client"

import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  listFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  clearFeedbackError,
  clearFeedbackSuccess,
} from "../../Redux/farmer/feebackSlice"
import {
  FiInbox,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUser,
  FiMail,
  FiClock,
} from "react-icons/fi"

export default function AdminFeedbackPage() {
  const dispatch = useDispatch()
  const {
    all,
    allMeta,
    isLoadingAll,
    isLoadingDetail,
    isUpdating,
    isDeleting,
    selected,
    error,
    success,
  } = useSelector((s) => s.feedback)

  // Filters
  const [statusFilter, setStatusFilter] = useState("all") // all | new | reviewed | responded
  const [roleFilter, setRoleFilter] = useState("all") // all | farmer | supplier
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Modal state
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [respStatus, setRespStatus] = useState("reviewed")
  const [respText, setRespText] = useState("")

  const filtersLabel = useMemo(() => {
    const s = statusFilter === "all" ? "any status" : statusFilter
    const r = roleFilter === "all" ? "any role" : roleFilter
    return `${s}, ${r}${query ? `, “${query}”` : ""}`
  }, [statusFilter, roleFilter, query])

  const fetchAll = () => {
    dispatch(
      listFeedbacks({
        status: statusFilter === "all" ? "" : statusFilter,
        role: roleFilter === "all" ? "" : roleFilter,
        q: query || "",
        page,
        page_size: pageSize,
      })
    )
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, roleFilter, page])

  useEffect(() => {
    if (selected) {
      setRespStatus(selected.status || "reviewed")
      setRespText(selected.response || "")
    }
  }, [selected])

  const onSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchAll()
  }

  const onReset = () => {
    setStatusFilter("all")
    setRoleFilter("all")
    setQuery("")
    setPage(1)
    fetchAll()
  }

  const openModal = async (id) => {
    setSelectedId(id)
    setOpen(true)
    await dispatch(getFeedbackById(id))
  }

  const closeModal = () => {
    setOpen(false)
    setSelectedId(null)
  }

  const onSaveResponse = async () => {
    if (!selectedId) return
    const data = {
      status: respStatus || "reviewed",
      response: (respText || "").trim(),
    }
    const res = await dispatch(updateFeedback({ feedbackId: selectedId, data }))
    if (!res.error) {
      // keep modal open; data updates in place
      dispatch(clearFeedbackSuccess())
      fetchAll()
    }
  }

  const onDelete = async () => {
    if (!selectedId) return
    // if (!confirm("Delete this feedback? This cannot be undone.")) return
    const res = await dispatch(deleteFeedback(selectedId))
    if (!res.error) {
      closeModal()
      fetchAll()
    }
  }

  const totalCount = allMeta?.count ?? all?.length ?? 0

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
          <FiInbox className="text-emerald-600" /> User Feedback
        </h1>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-800">{totalCount}</span>
        </div>
      </div>

      {/* Alerts */}
      {(error || success) && (
        <div className="space-y-2">
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
              <FiCheckCircle /> {success}
              <button
                className="ml-auto text-emerald-700 hover:underline text-sm"
                onClick={() => dispatch(clearFeedbackSuccess())}
              >
                Dismiss
              </button>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {typeof error === "string" ? error : error.detail || error.message || "Something went wrong"}
              <button
                className="ml-3 underline text-sm"
                onClick={() => dispatch(clearFeedbackError())}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="responded">Responded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="farmer">Farmer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>

            <div className="w-full md:w-72">
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <form onSubmit={onSearch}>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="user, email, or text…"
                    className="w-full pl-9 pr-24 py-2 border rounded-lg text-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("")
                        setPage(1)
                        fetchAll()
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

            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
              <FiFilter /> Reset
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Filters: <span className="text-gray-800">{filtersLabel}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            Showing: <span className="font-medium text-gray-800">{all?.length || 0}</span>
            {allMeta?.count != null && (
              <>
                {" "}
                of <span className="font-medium text-gray-800">{allMeta.count}</span>
              </>
            )}
          </div>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {isLoadingAll ? (
          <AdminListSkeleton />
        ) : all?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-left">User</th>
                  <th className="py-2 px-3 text-left">Role</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Submitted</th>
                  <th className="py-2 px-3 text-left">Preview</th>
                  <th className="py-2 px-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {all.map((fb) => (
                  <tr key={fb.id} className="border-t hover:bg-emerald-50/40 transition">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-emerald-600" />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{fb.user?.username || `User #${fb.user?.id}`}</span>
                          <a className="text-xs text-emerald-700 hover:underline" href={`mailto:${fb.user?.email || ""}`}>
                            {fb.user?.email || "—"}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <RoleChip role={fb.user?.role} />
                    </td>
                    <td className="py-2 px-3">
                      <StatusChip status={fb.status} />
                    </td>
                    <td className="py-2 px-3">{formatDateTime(fb.created_at)}</td>
                    <td className="py-2 px-3 text-gray-700">{truncate(fb.content, 80)}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(fb.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
                          title="View & respond"
                        >
                          <FiEye /> Open
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-10">No feedback found.</div>
        )}

        {/* Pagination */}
        {allMeta && (allMeta.has_prev || allMeta.has_next) && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!allMeta.has_prev}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Page <span className="font-medium text-gray-800">{allMeta.page}</span> of{" "}
              <span className="font-medium text-gray-800">
                {Math.ceil((allMeta.count || 0) / (allMeta.page_size || pageSize)) || 1}
              </span>
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!allMeta.has_next}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              onClick={closeModal}
              title="Close"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiEdit2 className="text-emerald-600" /> Feedback Detail
                </h2>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <FiClock /> {formatDateTime(selected?.created_at)}
                </div>
              </div>

              {isLoadingDetail ? (
                <DetailSkeleton />
              ) : !selected ? (
                <div className="text-gray-500">No feedback selected.</div>
              ) : (
                <>
                  {/* User */}
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">User</div>
                      <div className="font-medium text-gray-800">{selected.user?.username || `User #${selected.user?.id}`}</div>
                      <div className="text-sm text-gray-600">
                        <a className="text-emerald-700 hover:underline" href={`mailto:${selected.user?.email || ""}`}>
                          {selected.user?.email || "—"}
                        </a>
                        <span className="ml-2">
                          <RoleChip role={selected.user?.role} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Content</div>
                    <div className="p-3 rounded-lg border bg-gray-50 text-gray-800 whitespace-pre-wrap">
                      {selected.content}
                    </div>
                  </div>

                  {/* Respond */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Status</label>
                      <select
                        value={respStatus}
                        onChange={(e) => setRespStatus(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="responded">Responded</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Response (optional)</label>
                      <textarea
                        value={respText}
                        onChange={(e) => setRespText(e.target.value)}
                        className="w-full min-h-[96px] p-3 border rounded-lg"
                        placeholder="Write a response to the user..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Current: <StatusChip status={selected.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onSaveResponse}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isUpdating ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <FiTrash2 /> {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* Components & helpers */

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

function RoleChip({ role }) {
  const r = String(role || "").toLowerCase()
  const map = {
    farmer: "bg-green-50 text-green-700 border-green-200",
    supplier: "bg-blue-50 text-blue-700 border-blue-200",
    admin: "bg-gray-100 text-gray-700 border-gray-200",
    leader: "bg-orange-50 text-orange-700 border-orange-200",
    agronomist: "bg-purple-50 text-purple-700 border-purple-200",
  }
  const cls = map[r] || "bg-gray-50 text-gray-700 border-gray-200"
  return <span className={`inline-block text-xs px-2 py-1 rounded-full border ${cls}`}>{r || "—"}</span>
}

function truncate(s, n) {
  const str = String(s || "")
  return str.length > n ? `${str.slice(0, n - 1)}…` : str
}

function formatDateTime(s) {
  if (!s) return ""
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return String(s)
  return d.toLocaleString()
}

function AdminListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-1/3 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
          <div className="mt-3 h-3 w-5/6 bg-gray-100 rounded" />
          <div className="mt-2 h-3 w-2/3 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 w-40 bg-gray-100 rounded" />
      <div className="h-3 w-1/2 bg-gray-100 rounded" />
      <div className="h-24 w-full bg-gray-50 rounded border" />
    </div>
  )
}