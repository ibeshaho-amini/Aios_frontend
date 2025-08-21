"use client"

import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllUsers, getUserById, clearUserState } from "../../Redux/authentication/userSlice"
import { signupUser } from "../../Redux/authentication/login" 
import { FiUser, FiMail, FiPhone, FiUsers, FiX, FiPlus } from "react-icons/fi"

const roleColors = {
  admin: "bg-gray-200 text-gray-800",
  supplier: "bg-blue-100 text-blue-700",
  farmer: "bg-green-100 text-green-700",
  agronomist: "bg-purple-100 text-purple-700",
  leader: "bg-orange-100 text-orange-700",
}

const roleTabs = [
  { label: "All", value: "all" },
  { label: "Farmers", value: "farmer" },
  { label: "Suppliers", value: "supplier" },
  { label: "Agronomists", value: "agronomist" },
  { label: "Leaders", value: "leader" },
]

export default function AdminUserManagement() {
  const dispatch = useDispatch()
  const { users, user, isLoading, error } = useSelector((state) => state.users)
  const authError = useSelector((state) => state.auth?.error) // for create errors

  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)

  // Fetch all users on mount
  useEffect(() => {
    dispatch(fetchAllUsers())
    return () => dispatch(clearUserState())
  }, [dispatch])

  // Fetch user details when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      dispatch(getUserById(selectedUserId))
      setShowUserModal(true)
    }
  }, [selectedUserId, dispatch])

  // Filter users (exclude Admins if you don’t want them in the list)
  const filteredUsers = useMemo(() => {
    const list = users?.filter((u) => u.role !== "admin") || []
    return selectedRole === "all" ? list : list.filter((u) => u.role === selectedRole)
  }, [users, selectedRole])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <FiUsers className="text-green-600" /> User Management
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
        >
          <FiPlus /> Add User
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {roleTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedRole(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedRole === tab.value
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-green-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {isLoading ? (
          <div className="text-green-600 py-8 text-center">Loading users...</div>
        ) : error ? (
          <div className="text-red-600 py-8 text-center">{error.detail || error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">No users found.</div>
        ) : (
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Phone</th>
                <th className="py-2 px-3 text-left">Role</th>
                <th className="py-2 px-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-green-50 transition">
                  <td className="py-2 px-3">{idx + 1}</td>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <FiUser className="text-green-500" />
                    {u.username}
                  </td>
                  <td className="py-2 px-3">{u.email}</td>
                  <td className="py-2 px-3">{u.phone_number}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        roleColors[u.role?.toLowerCase()] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => setSelectedUserId(u.id)}
                      className="text-green-700 hover:underline font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal (Admin) */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            dispatch(fetchAllUsers())
          }}
          isLoading={isLoading}
          backendError={authError}
          dispatch={dispatch}
        />
      )}

      {/* User Details Modal */}
      {showUserModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              onClick={() => {
                setShowUserModal(false)
                setSelectedUserId(null)
              }}
            >
              <FiX className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
              <FiUser className="text-green-600" /> User Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <FiUser className="text-green-500" />
                <span className="font-medium">Name:</span>
                <span>{user.username}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiMail className="text-blue-500" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiPhone className="text-green-500" />
                <span className="font-medium">Phone:</span>
                <span>{user.phone_number}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiUsers className="text-green-500" />
                <span className="font-medium">Role:</span>
                <span>{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Create User Modal (Admin creates Farmer/Supplier/Agronomist/Leader)
 */
function CreateUserModal({ onClose, onCreated, dispatch, isLoading, backendError }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    address: "",
    phone_number: "",
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.username || form.username.length < 3) e.username = "Username is required (min 3 chars)"
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required"
    if (!form.password || form.password.length < 8) e.password = "Min 8 characters"
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match"
    if (!form.role) e.role = "Select a role"
    if (!form.address || form.address.length < 5) e.address = "Enter address"
    if (!form.phone_number || !/^\+?[\d\s\-()]{10,}$/.test(form.phone_number)) e.phone_number = "Valid phone required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const res = await dispatch(signupUser(form))
    setSubmitting(false)
    if (!res.error) {
      onCreated?.()
    }
  }

  const readBackendError = (err) => {
    if (!err) return null
    if (typeof err === "string") return err
    return err.detail || err.error || err.message || null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Add New User</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4">
          {readBackendError(backendError) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {readBackendError(backendError)}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} placeholder="e.g. agron_john" />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="e.g. john@example.com" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <PasswordField label="Password" name="password" value={form.password} onChange={handleChange} error={errors.password} />
            <PasswordField label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <SelectField
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              error={errors.role}
              options={[
                { value: "farmer", label: "Farmer" },
                { value: "supplier", label: "Supplier" },
                { value: "agronomist", label: "Agronomist" },
                { value: "leader", label: "Leader" },
              ]}
            />
            <Field label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} error={errors.phone_number} placeholder="+250 7xx ..." />
          </div>

          <Field label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="e.g. Kigali, Gasabo..." />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting || isLoading ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, error, placeholder = "", type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition ${
          error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
        }`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

function PasswordField(props) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 block">{props.label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition ${
            props.error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
          }`}
          placeholder="********"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {show ? "🙈" : "👁️"}
        </button>
      </div>
      {props.error && <p className="text-sm text-red-600">{props.error}</p>}
    </div>
  )
}

function SelectField({ label, name, value, onChange, error, options = [] }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition ${
          error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
        } bg-white`}
      >
        <option value="">Select role</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}