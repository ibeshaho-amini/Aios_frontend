"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchMyFarmerProfile,
  createMyFarmerProfile,
  updateMyFarmerProfile,
  clearFarmerState,
  clearFarmerError,
  clearFarmerSuccess,
} from "../../Redux/farmer/farmerSlice"
import {
  FiUser,
  FiMapPin,
  FiPhone,
  FiGlobe,
  FiHome,
  FiEdit2,
  FiSave,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi"

const FarmerProfilePage = () => {
  const dispatch = useDispatch()
  const {
    myProfile,
    isLoadingProfile,
    isSavingProfile,
    error,
    success,
  } = useSelector((s) => s.farmer || {})

  // Form state
  const [editMode, setEditMode] = useState(false)

  // Debug logging
  console.log("=== FARMER PROFILE DEBUG ===")
  console.log("Full farmer state:", useSelector((s) => s.farmer))
  console.log("myProfile:", myProfile)
  console.log("isLoadingProfile:", isLoadingProfile)
  console.log("error:", error)
  console.log("editMode:", editMode)
  const [form, setForm] = useState({
    fullnames: "",
    phone: "",
    address: "",
    farm_size_ha: "",
    preferred_language: "rw",
    region: "",
  })
  const [formErrors, setFormErrors] = useState({})

  // Load profile on mount
  useEffect(() => {
    console.log("🚀 Dispatching fetchMyFarmerProfile...")
    dispatch(fetchMyFarmerProfile())
    return () => {
      dispatch(clearFarmerState())
    }
  }, [dispatch])

  // Hydrate form when profile loads
  useEffect(() => {
    console.log("📝 Profile changed, hydrating form:", myProfile)
    if (myProfile) {
      setForm({
        fullnames: myProfile.fullnames || "",
        phone: myProfile.phone || "",
        address: myProfile.address || "",
        farm_size_ha: myProfile.farm_size_ha ?? "",
        preferred_language: myProfile.preferred_language || "rw",
        region: myProfile.extra?.region || "",
      })
      setEditMode(false)
      console.log("✅ Form hydrated, editMode set to false")
    }
  }, [myProfile])

  // Success banner auto-clear
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(clearFarmerSuccess()), 2000)
      return () => clearTimeout(t)
    }
  }, [success, dispatch])

  // Fixed create mode detection - only create mode if no profile AND loading is complete
  const noProfile = useMemo(() => {
    // Check if we have a valid profile object with required fields
    const hasValidProfile = myProfile && 
      (myProfile.id || myProfile.fullnames || myProfile.user)
    
    console.log("noProfile calculation:", {
      isLoadingProfile,
      myProfile,
      hasValidProfile,
      result: !isLoadingProfile && !hasValidProfile
    })
    
    // Only consider it "no profile" if loading is done AND we don't have a valid profile
    return !isLoadingProfile && !hasValidProfile
  }, [isLoadingProfile, myProfile])

  const languages = [
    { code: "rw", label: "Kinyarwanda" },
    { code: "en", label: "English" },
    { code: "sw", label: "Swahili" },
    { code: "fr", label: "Français" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }))
  }

  const validate = () => {
    const errs = {}
    if (!form.fullnames.trim()) {
      errs.fullnames = "Full names are required"
    }
    if (form.farm_size_ha !== "" && (isNaN(form.farm_size_ha) || Number(form.farm_size_ha) < 0)) {
      errs.farm_size_ha = "Farm size must be a positive number"
    }
    if (form.phone && !/^[\d+\-\s()]+$/.test(form.phone)) {
      errs.phone = "Phone contains invalid characters"
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return

    // Get user ID from localStorage
    let userData;
    try {
      userData = JSON.parse(localStorage.getItem('user_id') || '{}');
    } catch (err) {
      console.error("Error parsing user data from localStorage:", err);
      userData = {};
    }
    
    const userId = parseInt(userData)
    
    if (!userId) {
      setFormErrors({
        ...formErrors,
        general: "User ID not found. Please log in again."
      });
      return;
    }

    const payload = {
      user: userId,
      fullnames: form.fullnames,
      phone: form.phone || "",
      address: form.address || "",
      preferred_language: form.preferred_language || "rw",
      extra: {
        ...(myProfile?.extra || {}),
        ...(form.region ? { region: form.region } : {}),
      },
    }
    if (form.farm_size_ha !== "") {
      payload.farm_size_ha = parseFloat(form.farm_size_ha)
    }

    console.log("Sending payload with user ID:", payload);

    try {
      if (noProfile) {
        await dispatch(createMyFarmerProfile(payload)).unwrap();
        // Force immediate profile refresh after creation
        setTimeout(() => {
          dispatch(fetchMyFarmerProfile());
        }, 500);
      } else {
        await dispatch(updateMyFarmerProfile(payload)).unwrap();
      }
      
      // Hide the form
      setEditMode(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  }

  const handleCancel = () => {
    if (myProfile) {
      setForm({
        fullnames: myProfile.fullnames || "",
        phone: myProfile.phone || "",
        address: myProfile.address || "",
        farm_size_ha: myProfile.farm_size_ha ?? "",
        preferred_language: myProfile.preferred_language || "rw",
        region: myProfile.extra?.region || "",
      })
    } else {
      setForm({
        fullnames: "",
        phone: "",
        address: "",
        farm_size_ha: "",
        preferred_language: "rw",
        region: "",
      })
    }
    setFormErrors({})
    setEditMode(false)
    dispatch(clearFarmerError())
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800 flex items-center gap-3">
          <FiUser size={32} /> Farmer Profile
        </h1>
        {myProfile && myProfile.id && !editMode && !isLoadingProfile && (
          <button
            onClick={() => setEditMode(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiEdit2 />
            Edit Profile
          </button>
        )}
      </div>

      {/* Success / Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
          <FiCheckCircle className="text-green-600" />
          {success}
        </div>
      )}
      {error && !noProfile && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
          <FiAlertCircle className="text-red-600" />
          {error.detail || "Something went wrong"}
        </div>
      )}
      {formErrors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
          <FiAlertCircle className="text-red-600" />
          {formErrors.general}
        </div>
      )}

      {/* Loading State */}
      {isLoadingProfile && (
        <div className="bg-white border rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      )}

      {/* Profile Display (Beautiful Card Layout) */}
      {!isLoadingProfile && myProfile && myProfile.id && !editMode && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FiUser size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{myProfile.fullnames}</h2>
                <p className="text-green-100">@{myProfile.user_username}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Contact Information
                </h3>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <FiPhone className="text-blue-600 flex-shrink-0" size={18} />
                  <div>
                    <div className="text-sm text-gray-500">Phone Number</div>
                    <div className="font-medium text-gray-800">{myProfile.phone || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <FiHome className="text-green-600 flex-shrink-0" size={18} />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium text-gray-800">{myProfile.address || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <FiMapPin className="text-red-600 flex-shrink-0" size={18} />
                  <div>
                    <div className="text-sm text-gray-500">Region</div>
                    <div className="font-medium text-gray-800">{myProfile.extra?.region || "Not specified"}</div>
                  </div>
                </div>
              </div>

              {/* Farm & Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Farm & Preferences
                </h3>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <FiMapPin className="text-green-600 flex-shrink-0" size={18} />
                  <div>
                    <div className="text-sm text-gray-500">Farm Size</div>
                    <div className="font-medium text-gray-800">
                      {myProfile.farm_size_ha ? `${myProfile.farm_size_ha} hectares` : "Not specified"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <FiGlobe className="text-purple-600 flex-shrink-0" size={18} />
                  <div>
                    <div className="text-sm text-gray-500">Preferred Language</div>
                    <div className="font-medium text-gray-800">
                      {languages.find((l) => l.code === myProfile.preferred_language)?.label || "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Timestamps */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
              <span className="flex items-center gap-1">
                <strong>Created:</strong> {new Date(myProfile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="flex items-center gap-1">
                <strong>Last Updated:</strong> {new Date(myProfile.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Create Profile Message (when no profile exists) */}
      {noProfile && !editMode && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-4">Create your farmer profile to get started</p>
          <button
            onClick={() => setEditMode(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiEdit2 />
            Create Profile
          </button>
        </div>
      )}

      {/* Create or Edit Form */}
      {(noProfile || editMode) && !isLoadingProfile && (
        <form onSubmit={handleSave} className="bg-white border rounded-lg shadow-sm p-6 space-y-5">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {noProfile ? "Create Your Profile" : "Edit Profile"}
            </h2>
            <p className="text-gray-600 mt-1">
              {noProfile ? "Fill in your details to create your farmer profile" : "Update your profile information"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Names */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Names *
              </label>
              <input
                type="text"
                name="fullnames"
                value={form.fullnames}
                onChange={handleChange}
                placeholder="Enter your full names"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              {formErrors.fullnames && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {formErrors.fullnames}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g., +250789775876"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              {formErrors.phone && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {formErrors.phone}
                </p>
              )}
            </div>

            {/* Farm Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size (hectares)</label>
              <input
                type="number"
                name="farm_size_ha"
                value={form.farm_size_ha}
                onChange={handleChange}
                placeholder="e.g., 5.97"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              {formErrors.farm_size_ha && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {formErrors.farm_size_ha}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g., Kigali, Musanze District"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <input
                type="text"
                name="region"
                value={form.region}
                onChange={handleChange}
                placeholder="e.g., Kigali"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
              <select
                name="preferred_language"
                value={form.preferred_language}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSavingProfile}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                isSavingProfile 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-green-600 hover:bg-green-700 shadow-sm"
              }`}
            >
              {isSavingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  {noProfile ? "Create Profile" : "Save Changes"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <FiX />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default FarmerProfilePage