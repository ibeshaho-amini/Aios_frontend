"use client"

import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  getSupplier,         // GET /suppliers/:user_id/
  updateSupplier,      // PATCH /suppliers/:user_id/
  createSupplier,      // POST /suppliers/create/
} from "../../Redux/supplier/supplier_slice"
import {
  FiUser, FiMapPin, FiPhone,
  FiCheckCircle, FiAlertCircle,
  FiEdit2, FiX, FiSave
} from "react-icons/fi"

const SupplierProfile = () => {
  const dispatch = useDispatch()
  const { isLoading, error, success, supplier } = useSelector((s) => s.supplier || {})
  const rawUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null
  const userId = useMemo(() => (rawUserId ? Number(rawUserId) : null), [rawUserId])

  // UI state
  const [editMode, setEditMode] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Form state (used for both create and edit)
  const [form, setForm] = useState({
    user: userId,
    name: "",
    contact_info: "",
    location: "",
    status: "Active",
  })

  // Fetch supplier on mount / when userId changes
  useEffect(() => {
    if (userId) dispatch(getSupplier(userId))
  }, [dispatch, userId])

  // Decide create mode based on a "not found" error
  useEffect(() => {
    const notFound =
      error &&
      typeof error === "object" &&
      (error.error === "Supplier not found" || error.detail === "Supplier not found")

    if (notFound) {
      setShowCreateForm(true)
      setEditMode(false)
    } else if (supplier) {
      setShowCreateForm(false)
    }
  }, [error, supplier])

  // Hydrate form when supplier loads
  useEffect(() => {
    if (supplier && userId) {
      setForm({
        user: userId,
        name: supplier.name || "",
        contact_info: supplier.contact_info || "",
        location: supplier.location || "",
        status: supplier.status || "Active",
      })
      setEditMode(false)
    }
  }, [supplier, userId])

  // Keep user in form in sync
  useEffect(() => {
    setForm(prev => ({ ...prev, user: userId }))
  }, [userId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name?.trim()) errs.name = "Supplier name is required"
    if (!form.contact_info?.trim()) errs.contact_info = "Contact info is required"
    if (!form.location?.trim()) errs.location = "Location is required"
    if (!form.user) errs.user = "User ID is missing. Please log in again."
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Create
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await dispatch(createSupplier(form)).unwrap()
      if (userId) dispatch(getSupplier(userId))
      setShowCreateForm(false)
    } catch {}
  }

  // Save edits
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!validate() || !userId) return
    const { user, ...data } = form
    try {
      await dispatch(updateSupplier({ userId, data })).unwrap()
      setEditMode(false)
      dispatch(getSupplier(userId))
    } catch {}
  }

  const handleCancelEdit = () => {
    if (supplier && userId) {
      setForm({
        user: userId,
        name: supplier.name || "",
        contact_info: supplier.contact_info || "",
        location: supplier.location || "",
        status: supplier.status || "Active",
      })
    }
    setFormErrors({})
    setEditMode(false)
  }

  const Alerts = () => (
    <>
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2 mb-4">
          <FiCheckCircle className="text-emerald-600" />
          <span className="text-emerald-700">{success}</span>
        </div>
      )}
      {error && !showCreateForm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
          <FiAlertCircle className="text-red-600" />
          <span className="text-red-700">
            {typeof error === "string" ? error : error.detail || error.error || "Something went wrong."}
          </span>
        </div>
      )}
    </>
  )

  const initials = (name) =>
    (name || "").split(" ").filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join("") || "S"

  // Loader when we don't know yet if we'll show view or create
  if (isLoading && !supplier && !showCreateForm) {
    return (
      <div className="flex justify-center items-center h-72">
        <svg className="animate-spin h-8 w-8 text-emerald-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  // View mode
  if (supplier && !showCreateForm && !editMode) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        {/* Header Banner */}
        <div className="rounded-2xl overflow-hidden shadow">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {initials(supplier.name)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{supplier.name}</h1>
                  <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    supplier.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                  }`}>
                    {supplier.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <FiEdit2 /> Edit Profile
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white p-6">
            <Alerts />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow icon={<FiPhone className="text-emerald-500" />} label="Contact" value={supplier.contact_info || "—"} />
              <InfoRow icon={<FiMapPin className="text-emerald-500" />} label="Location" value={supplier.location || "—"} />
            </div>

            {/* Audit (if available) */}
            <div className="mt-6 text-xs text-gray-500 flex flex-wrap gap-4">
              {supplier.created_at && <span>Created: {new Date(supplier.created_at).toLocaleString()}</span>}
              {supplier.updated_at && <span>Updated: {new Date(supplier.updated_at).toLocaleString()}</span>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Edit mode
  if (supplier && !showCreateForm && editMode) {
    return (
      <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiEdit2 className="text-emerald-600" /> Edit Supplier Profile
        </h2>
        <Alerts />

        <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Supplier Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={formErrors.name}
            icon={<FiUser className="text-emerald-600" />}
          />
          <Field
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            error={formErrors.location}
            icon={<FiMapPin className="text-emerald-600" />}
          />
          <FieldTextArea
            label="Contact Info"
            name="contact_info"
            value={form.contact_info}
            onChange={handleChange}
            error={formErrors.contact_info}
            icon={<FiPhone className="text-emerald-600" />}
            rows={3}
            className="md:col-span-2"
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 border-gray-200"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
            >
              <FiX /> Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <FiSave /> {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Create mode
  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FiUser className="text-emerald-600" /> Supplier Profile Setup
      </h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleCreate}>
        <Field
          label="Supplier Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={formErrors.name}
          icon={<FiUser className="text-emerald-600" />}
        />
        <Field
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          error={formErrors.location}
          icon={<FiMapPin className="text-emerald-600" />}
        />
        <FieldTextArea
          label="Contact Info"
          name="contact_info"
          value={form.contact_info}
          onChange={handleChange}
          error={formErrors.contact_info}
          icon={<FiPhone className="text-emerald-600" />}
          rows={3}
          className="md:col-span-2"
        />

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isLoading || !userId}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Saving..." : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  )
}

/* Small reusable UI pieces */
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  </div>
)

const Field = ({ label, name, value, onChange, error, icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
        error ? "border-red-300" : "border-gray-200"
      }`}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
)

const FieldTextArea = ({ label, name, value, onChange, error, icon, rows = 3, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
      {icon} {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
        error ? "border-red-300" : "border-gray-200"
      }`}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
)

export default SupplierProfile