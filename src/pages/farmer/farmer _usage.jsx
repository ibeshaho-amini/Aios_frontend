

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchMyUsages,
  createUsage,
  updateUsage,
  deleteUsage,
  fetchUsageSummary,
} from "../../Redux/farmer/usageSlice"
import {
  FiPlus,
  FiFilter,
  FiSave,
  FiX,
  FiEdit2,
  FiTrash2,
  FiBarChart2,
  FiAlertTriangle,
  FiGrid,
  FiList,
  FiPieChart,
} from "react-icons/fi"

// Adjust this import path to where you placed the component
import UsageReportBuilder from "../farmer/report"

const INPUT_TYPES = [
  { value: "fertilizer", label: "Fertilizer" },
  { value: "pesticide", label: "Pesticide" },
  { value: "seed", label: "Seed" },
]

const UNITS = [
  { value: "kg", label: "kg" },
  { value: "l", label: "liters" },
  { value: "pcs", label: "pieces" },
]

const SEASONS = ["Season A", "Season B"]

const todayStr = () => new Date().toISOString().slice(0, 10)
const currentYear = new Date().getFullYear()
const lastYears = Array.from({ length: 6 }, (_, i) => currentYear - i)

export default function FarmerInputUsagePage() {
  const dispatch = useDispatch()

  const {
    myUsages = [],
    summary,
    isLoadingMy,
    isLoadingSummary,
    isSaving,
    isDeleting,
    error,
    success,
  } = useSelector((s) => s.usage || {})

  // View mode
  const [view, setView] = useState("overview") // "overview" | "manage" | "report"

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(getDefaultForm())

  // Delete confirm
  const [toDeleteId, setToDeleteId] = useState(null)

  // Filters state (local)
  const [filters, setFilters] = useState({
    input_type: "",
    season_year: "",
    season_name: "",
    crop: "",
    start_date: "",
    end_date: "",
  })

  const isSeed = form.input_type === "seed"
  const isBusy = isSaving || isDeleting

  // Fetch initial list + summary
  useEffect(() => {
    dispatch(fetchMyUsages({}))
    dispatch(fetchUsageSummary({ group_by: "input_type,unit" }))
  }, [dispatch])

  const applyFilters = () => {
    dispatch(fetchMyUsages(filters))
    dispatch(fetchUsageSummary({ ...filters, group_by: "input_type,unit" }))
  }

  const resetFilters = () => {
    const cleared = {
      input_type: "",
      season_year: "",
      season_name: "",
      crop: "",
      start_date: "",
      end_date: "",
    }
    setFilters(cleared)
    dispatch(fetchMyUsages({}))
    dispatch(fetchUsageSummary({ group_by: "input_type,unit" }))
  }

  const onEdit = (item) => {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
      input_type: item.input_type || "",
      product_name: item.product_name || "",
      brand: item.brand || "",
      quantity: String(item.quantity ?? ""),
      unit: item.unit || "kg",
      cost: item.cost !== null && item.cost !== undefined ? String(item.cost) : "",
      season_year: Number(item.season_year) || currentYear,
      season_name: item.season_name || "Season A",
      application_date: item.application_date || todayStr(),
      crop: item.crop || "",
      field_name: item.field_name || "",
      notes: item.notes || "",
    })
  }

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return
    await dispatch(deleteUsage(toDeleteId))
    dispatch(fetchMyUsages(filters))
    dispatch(fetchUsageSummary({ ...filters, group_by: "input_type,unit" }))
    setToDeleteId(null)
  }

  const onCancel = () => {
    setEditingId(null)
    setForm(getDefaultForm())
    setShowForm(false)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const validation = validateForm(form)
    if (!validation.ok) {
      alert(validation.msg)
      return
    }

    const payload = {
      ...normalizeForm(form),
    }

    if (editingId) {
      await dispatch(updateUsage({ usageId: editingId, data: payload }))
    } else {
      await dispatch(createUsage(payload))
    }

    // Refresh list + summary
    dispatch(fetchMyUsages(filters))
    dispatch(fetchUsageSummary({ ...filters, group_by: "input_type,unit" }))

    // Reset form
    setEditingId(null)
    setForm(getDefaultForm())
    setShowForm(false)
  }

  // Build season overview (group by season and input type; list unique product names)
  const seasonOverview = useMemo(() => buildSeasonOverview(myUsages), [myUsages])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Record Input Usage</h1>
          <p className="text-sm text-gray-600">Season overview, management, and reports.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <TabButton
              active={view === "overview"}
              onClick={() => setView("overview")}
              icon={<FiGrid />}
              label="Season overview"
            />
            <TabButton
              active={view === "manage"}
              onClick={() => setView("manage")}
              icon={<FiList />}
              label="Manage"
            />
            <TabButton
              active={view === "report"}
              onClick={() => setView("report")}
              icon={<FiPieChart />}
              label="Report"
            />
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            <FiPlus />
            {showForm ? "Close Form" : "Record Input"}
          </button>
        </div>
      </header>

      {/* Notifications */}
      {(error || success) && (
        <div className="flex flex-col gap-2">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {typeof error === "string" ? error : error?.detail || "Something went wrong"}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            {editingId ? "Edit Usage" : "New Usage"}
          </h3>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Input type</label>
              <select
                value={form.input_type}
                onChange={(e) => setForm((f) => ({ ...f, input_type: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="">Select type</option>
                {INPUT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Product name (hidden for seed) */}
            {!isSeed && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Product name</label>
                <input
                  value={form.product_name}
                  onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required={!isSeed}
                  placeholder="e.g., DAP"
                />
              </div>
            )}

            {/* Brand */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Brand (optional)</label>
              <input
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., Yara"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
                placeholder="e.g., 50"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Cost (optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., 120.00"
              />
            </div>

            {/* Crop (required for seed, optional otherwise) */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                {isSeed ? "Crop (required for seed)" : "Crop (optional)"}
              </label>
              <input
                value={form.crop}
                onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required={isSeed}
                placeholder="e.g., Maize"
              />
            </div>

            {/* Field name */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Field name (optional)</label>
              <input
                value={form.field_name}
                onChange={(e) => setForm((f) => ({ ...f, field_name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., North Plot"
              />
            </div>

            {/* Season year */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Season year</label>
              <select
                value={form.season_year}
                onChange={(e) => setForm((f) => ({ ...f, season_year: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              >
                {lastYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Season name */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Season name</label>
              <select
                value={form.season_name}
                onChange={(e) => setForm((f) => ({ ...f, season_name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Application date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Application date</label>
              <input
                type="date"
                value={form.application_date}
                onChange={(e) => setForm((f) => ({ ...f, application_date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
                max={todayStr()}
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-600 mb-1">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="Any details about this application…"
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                <FiSave />
                {editingId ? "Save Changes" : "Save Usage"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isBusy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FiX /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter card */}
        <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiFilter /> Filter Usage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Type</label>
              <select
                value={filters.input_type}
                onChange={(e) => setFilters((f) => ({ ...f, input_type: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {INPUT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Season year</label>
              <select
                value={filters.season_year}
                onChange={(e) => setFilters((f) => ({ ...f, season_year: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {lastYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Season name</label>
              <select
                value={filters.season_name}
                onChange={(e) => setFilters((f) => ({ ...f, season_name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Crop</label>
              <input
                value={filters.crop}
                onChange={(e) => setFilters((f) => ({ ...f, crop: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., Maize"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Start date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                max={filters.end_date || undefined}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">End date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                min={filters.start_date || undefined}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiBarChart2 /> Summary
          </h3>
          {isLoadingSummary ? (
            <p className="text-sm text-gray-500">Loading summary…</p>
          ) : !summary?.results?.length ? (
            <p className="text-sm text-gray-500">No summary yet. Apply filters to calculate.</p>
          ) : (
            <div className="space-y-2">
              {summary.results.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm border rounded-lg px-3 py-2"
                >
                  <div className="text-gray-700 capitalize">
                    {row.input_type?.replace(/_/g, " ") || "—"} ({row.unit || "—"})
                  </div>
                  <div className="text-gray-900 font-semibold">
                    Qty: {Number(row.total_quantity).toLocaleString()}
                    {row.unit ? ` ${row.unit}` : ""}
                    {row.total_cost !== null && row.total_cost !== undefined ? (
                      <span className="text-gray-600 font-normal ml-2">
                        • Cost: {Number(row.total_cost).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Overview | Manage | Report */}
      {view === "overview" ? (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Season Overview</h3>
          {isLoadingMy ? (
            <p className="text-sm text-gray-500">Loading records…</p>
          ) : !myUsages?.length ? (
            <p className="text-sm text-gray-500">
              No records yet. Click “Record Input” to add one.
            </p>
          ) : (
            <SeasonOverview data={seasonOverview} />
          )}
        </div>
      ) : view === "manage" ? (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Manage Records</h3>
          {isLoadingMy ? (
            <p className="text-sm text-gray-500">Loading records…</p>
          ) : myUsages.length === 0 ? (
            <p className="text-sm text-gray-500">No records yet. Click “Record Input” to add one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Type</th>
                    <th className="py-2 px-3 text-left">Product</th>
                    <th className="py-2 px-3 text-left">Brand</th>
                    <th className="py-2 px-3 text-left">Qty</th>
                    <th className="py-2 px-3 text-left">Cost</th>
                    <th className="py-2 px-3 text-left">Crop</th>
                    <th className="py-2 px-3 text-left">Field</th>
                    <th className="py-2 px-3 text-left">Season</th>
                    <th className="py-2 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myUsages.map((u) => (
                    <tr key={u.id} className="border-t hover:bg-green-50 transition">
                      <td className="py-2 px-3">{u.application_date}</td>
                      <td className="py-2 px-3 capitalize">{u.input_type?.replace(/_/g, " ")}</td>
                      <td className="py-2 px-3">
                        {u.input_type === "seed" ? (u.crop || u.product_name || "—") : (u.product_name || "—")}
                      </td>
                      <td className="py-2 px-3">{u.brand || "—"}</td>
                      <td className="py-2 px-3">
                        {Number(u.quantity).toLocaleString()} {u.unit}
                      </td>
                      <td className="py-2 px-3">
                        {u.cost !== null && u.cost !== undefined ? Number(u.cost).toLocaleString() : "—"}
                      </td>
                      <td className="py-2 px-3">{u.crop || "—"}</td>
                      <td className="py-2 px-3">{u.field_name || "—"}</td>
                      <td className="py-2 px-3">
                        {u.season_year} {u.season_name}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(u)}
                            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => setToDeleteId(u.id)}
                            className="px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                Showing {myUsages.length.toLocaleString()} record(s)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Report</h3>
            <p className="text-xs text-gray-500">
              Tip: Use filters above and click Apply. This report uses the filtered data.
            </p>
          </div>
          <UsageReportBuilder
            usages={myUsages}
            seasons={SEASONS}
            years={lastYears}
            systemName="AIOS"
            currency=""
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        open={!!toDeleteId}
        title="Delete usage record?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  )
}

/* -------- Helpers & Components -------- */

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md inline-flex items-center gap-2 ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  )
}

function getDefaultForm() {
  return {
    input_type: "",
    product_name: "",
    brand: "",
    quantity: "",
    unit: "kg",
    cost: "",
    season_year: currentYear,
    season_name: "Season A",
    application_date: todayStr(),
    crop: "",
    field_name: "",
    notes: "",
  }
}

function validateForm(form) {
  if (!form.input_type) return { ok: false, msg: "Please select input type" }

  if (form.input_type === "seed") {
    if (!form.crop?.trim()) return { ok: false, msg: "Crop is required for seed inputs" }
  } else {
    if (!form.product_name?.trim()) return { ok: false, msg: "Product name is required" }
  }

  if (!form.quantity || Number(form.quantity) <= 0)
    return { ok: false, msg: "Quantity must be greater than 0" }
  if (!form.unit) return { ok: false, msg: "Unit is required" }
  if (!form.season_year) return { ok: false, msg: "Season year is required" }
  if (!form.season_name) return { ok: false, msg: "Season name is required" }
  if (!form.application_date) return { ok: false, msg: "Application date is required" }
  return { ok: true }
}

function normalizeForm(form) {
  const payload = { ...form }
  if (payload.input_type === "seed") {
    if (!payload.product_name?.trim() && payload.crop?.trim()) {
      payload.product_name = payload.crop.trim()
    }
  }
  if (payload.cost === "") payload.cost = null
  payload.season_year = Number(payload.season_year)
  ;["brand", "crop", "field_name", "notes", "product_name"].forEach((k) => {
    if (payload[k] && typeof payload[k] === "string") payload[k] = payload[k].trim()
  })
  return payload
}

// Build overview data: [{ season_year, season_name, fertilizer:[], pesticide:[], seed:[] }]
function buildSeasonOverview(usages = []) {
  const map = new Map()
  for (const u of usages) {
    const key = `${u.season_year} ${u.season_name}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        season_year: u.season_year,
        season_name: u.season_name,
        fertilizer: new Set(),
        pesticide: new Set(),
        seed: new Set(),
      })
    }
    const g = map.get(key)
    const productName =
      u.input_type === "seed"
        ? (u.crop || u.product_name || "").trim()
        : (u.product_name || "").trim()

    if (productName && g[u.input_type]) {
      g[u.input_type].add(productName)
    }
  }

  const arr = Array.from(map.values()).map((g) => ({
    ...g,
    fertilizer: Array.from(g.fertilizer).sort(),
    pesticide: Array.from(g.pesticide).sort(),
    seed: Array.from(g.seed).sort(),
  }))

  const seasonOrder = (s) => ({ "Season A": 0, "Season B": 1 }[s] ?? 99)
  arr.sort((a, b) => {
    if (b.season_year !== a.season_year) return b.season_year - a.season_year
    return seasonOrder(a.season_name) - seasonOrder(b.season_name)
  })
  return arr
}

function SeasonOverview({ data }) {
  if (!data?.length) {
    return <p className="text-sm text-gray-500">No records to show.</p>
  }

  return (
    <div className="space-y-4">
      {data.map((s) => (
        <div key={s.key} className="border rounded-lg p-4">
          <div className="font-semibold text-gray-800 mb-2">
            {s.season_year} {s.season_name}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TypeCol label="Fertilizer" items={s.fertilizer} />
            <TypeCol label="Pesticide" items={s.pesticide} />
            <TypeCol label="Seed" items={s.seed} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TypeCol({ label, items = [] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      {items.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((name, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs"
            >
              {name}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-400 mt-1">—</div>
      )}
    </div>
  )
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5"
      >
        <div className="flex items-start gap-3">
          <div className="text-red-600 text-xl mt-1">
            <FiAlertTriangle />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Deleting…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}