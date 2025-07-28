"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllUsers, getUserById, clearUserState } from "../../Redux/authentication/userSlice"
import { FiUser, FiMail, FiPhone, FiUsers, FiX } from "react-icons/fi"

const roleColors = {
  Supplier: "bg-blue-100 text-blue-700",
  Farmer: "bg-green-100 text-green-700",
}

const roleTabs = [
  { label: "All", value: "all" },
  { label: "Suppliers", value: "supplier" },
  { label: "Farmers", value: "farmer" },
]

export default function AdminUserManagement() {
  const dispatch = useDispatch()
  const { users, user, isLoading, error } = useSelector((state) => state.users)
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

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

  // Filter users (exclude Admins, filter by role)
  const filteredUsers = users
    .filter((u) => u.role !== "admin")
    .filter((u) => selectedRole === "all" || u.role === selectedRole)

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <FiUsers className="text-green-600" /> User Management
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColors[u.role] || "bg-gray-100 text-gray-700"}`}>
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

      {/* User Modal */}
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
              {/* Add more user info here if needed */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}