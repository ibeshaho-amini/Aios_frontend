// "use client"

// import { useState, useEffect } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { createSupplier } from "../../Redux/supplier/supplier_slice"
// import { FiUser, FiMapPin, FiPhone, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

// const SupplierProfileSetup = () => {
//   const dispatch = useDispatch()
//   const { isLoading, error, success, supplier } = useSelector((state) => state.supplier)
//   const userId = localStorage.getItem("user_id")


//   const [form, setForm] = useState({
//     user: userId,
//     name: "",
//     contact_info: "",
//     location: "",
//     status: "Active", 
//   })

//   const [formErrors, setFormErrors] = useState({})

//   // If user logs in/out, update user id in form
//   useEffect(() => {
//     setForm((prev) => ({ ...prev, user: userId }))
//   }, [])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setForm((prev) => ({ ...prev, [name]: value }))
//     if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
//   }

//   const validate = () => {
//     const errors = {}
//     if (!form.name.trim()) errors.name = "Supplier name is required"
//     if (!form.contact_info.trim()) errors.contact_info = "Contact info is required"
//     if (!form.location.trim()) errors.location = "Location is required"
//     if (!form.user) errors.user = "User ID is missing. Please log in again."
//     setFormErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validate()) return
//     dispatch(createSupplier(form))
//   }

//   return (
//     <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
//       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-800">
//         <FiUser /> Supplier Profile Setup
//       </h2>

//       {success && (
//         <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
//           <FiCheckCircle className="text-green-600" />
//           <span className="text-green-700">Profile created successfully!</span>
//         </div>
//       )}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-4">
//           <FiAlertCircle className="text-red-600" />
//           <span className="text-red-700">
//             {typeof error === "string" ? error : error.detail || error.message || "Something went wrong."}
//           </span>
//         </div>
//       )}

//       <form className="space-y-5" onSubmit={handleSubmit}>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
//             <FiUser /> Supplier Name
//           </label>
//           <input
//             type="text"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//               formErrors.name ? "border-red-300" : "border-gray-200"
//             }`}
//             placeholder="e.g. Agri Supplies Ltd"
//           />
//           {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
//             <FiPhone /> Contact Info
//           </label>
//           <textarea
//             name="contact_info"
//             value={form.contact_info}
//             onChange={handleChange}
//             className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//               formErrors.contact_info ? "border-red-300" : "border-gray-200"
//             }`}
//             placeholder="Phone, email, etc."
//             rows={2}
//           />
//           {formErrors.contact_info && <p className="text-xs text-red-600 mt-1">{formErrors.contact_info}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
//             <FiMapPin /> Location
//           </label>
//           <input
//             type="text"
//             name="location"
//             value={form.location}
//             onChange={handleChange}
//             className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//               formErrors.location ? "border-red-300" : "border-gray-200"
//             }`}
//             placeholder="e.g. Nairobi, Kenya"
//           />
//           {formErrors.location && <p className="text-xs text-red-600 mt-1">{formErrors.location}</p>}
//         </div>

//         {/* Status is hidden, always "Active" */}

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
//         >
//           {isLoading ? "Saving..." : "Save Profile"}
//         </button>
//       </form>
//     </div>
//   )
// }

// export default SupplierProfileSetup


"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createSupplier, getSupplier } from "../../Redux/supplier/supplier_slice"
import { FiUser, FiMapPin, FiPhone, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

const SupplierProfile = () => {
  const dispatch = useDispatch()
  const { isLoading, error, success, supplier } = useSelector((state) => state.supplier)
  const userId = localStorage.getItem("user_id")

  // Form state for setup
  const [form, setForm] = useState({
    user: userId,
    name: "",
    contact_info: "",
    location: "",
    status: "Active",
  })
  const [formErrors, setFormErrors] = useState({})
  const [showForm, setShowForm] = useState(false)

  // Try to fetch supplier profile on mount
  useEffect(() => {
    if (userId) {
      dispatch(getSupplier(userId))
    }
  }, [dispatch, userId])

  // If supplier is not found, show form
  useEffect(() => {
    if (error && (error.error === "Supplier not found" || error.detail === "Supplier not found")) {
      setShowForm(true)
    } else if (supplier) {
      setShowForm(false)
    }
  }, [error, supplier])

  // If user logs in/out, update user id in form
  useEffect(() => {
    setForm((prev) => ({ ...prev, user: userId }))
  }, [userId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = "Supplier name is required"
    if (!form.contact_info.trim()) errors.contact_info = "Contact info is required"
    if (!form.location.trim()) errors.location = "Location is required"
    if (!form.user) errors.user = "User ID is missing. Please log in again."
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    dispatch(createSupplier(form))
  }

  // After successful creation, fetch the profile again
  useEffect(() => {
    if (success && userId) {
      dispatch(getSupplier(userId))
    }
  }, [success, dispatch, userId])

  // Loading spinner
  if (isLoading && !showForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  // Show profile card if supplier exists
  if (supplier && !showForm) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="text-blue-600 text-3xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-800">{supplier.name}</h2>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${supplier.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
              {supplier.status}
            </span>
          </div>
        </div>
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2 text-gray-700">
            <FiPhone className="text-blue-500" />
            <span className="font-medium">Contact:</span>
            <span>{supplier.contact_info}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FiMapPin className="text-blue-500" />
            <span className="font-medium">Location:</span>
            <span>{supplier.location}</span>
          </div>
        </div>
      </div>
    )
  }

  // Show setup form if no profile
  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-800">
        <FiUser /> Supplier Profile Setup
      </h2>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
          <FiCheckCircle className="text-green-600" />
          <span className="text-green-700">Profile created successfully!</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-4">
          <FiAlertCircle className="text-red-600" />
          <span className="text-red-700">
            {typeof error === "string" ? error : error.detail || error.message || "Something went wrong."}
          </span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <FiUser /> Supplier Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              formErrors.name ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="e.g. Agri Supplies Ltd"
          />
          {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <FiPhone /> Contact Info
          </label>
          <textarea
            name="contact_info"
            value={form.contact_info}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              formErrors.contact_info ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="Phone, email, etc."
            rows={2}
          />
          {formErrors.contact_info && <p className="text-xs text-red-600 mt-1">{formErrors.contact_info}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <FiMapPin /> Location
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              formErrors.location ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="e.g. Nairobi, Kenya"
          />
          {formErrors.location && <p className="text-xs text-red-600 mt-1">{formErrors.location}</p>}
        </div>

        {/* Status is hidden, always "Active" */}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  )
}

export default SupplierProfile