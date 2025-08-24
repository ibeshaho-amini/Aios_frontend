// "use client"

// import { useEffect, useMemo, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"

// // USERS slice: list all users
// import { fetchAllUsers, clearUserState } from "../../Redux/authentication/userSlice"
// // FARMER slice: fetch rich farmer profile by id
// import { getFarmerById, clearFarmerState } from "../../Redux/farmer/farmerSlice"
// import { signupUser } from "../../Redux/authentication/login"

// import {
//   FiUsers, FiPlus, FiSearch, FiX,
//   FiUser, FiMail, FiPhone, FiRefreshCw, FiCopy, FiMapPin,
//   FiHash, FiCalendar, FiExternalLink
// } from "react-icons/fi"

// export default function LeaderFarmerManagement() {
//   const dispatch = useDispatch()

//   // Users slice state (for listing)
//   const {
//     users,
//     isLoading: isUsersLoading,
//     error: usersError,
//   } = useSelector((state) => state.users)

//   // Farmer slice state (for details)
//   const {
//     selectedFarmer,
//     isLoadingDetail,
//     error: farmerError,
//   } = useSelector((state) => state.farmer)

//   const authError = useSelector((state) => state.auth?.error)

//   const [query, setQuery] = useState("")
//   const [selectedFarmerId, setSelectedFarmerId] = useState(null)
//   const [showUserModal, setShowUserModal] = useState(false)
//   const [showCreateModal, setShowCreateModal] = useState(false)
//   const [showRaw, setShowRaw] = useState(false)

//   useEffect(() => {
//     dispatch(fetchAllUsers())
//     return () => {
//       dispatch(clearUserState())
//       dispatch(clearFarmerState())
//     }
//   }, [dispatch])

//   useEffect(() => {
//     if (selectedFarmerId != null) {
//       dispatch(getFarmerById(selectedFarmerId))
//       setShowUserModal(true)
//     }
//   }, [selectedFarmerId, dispatch])

//   // Build farmer rows from users list (filter role=farmer)
//   const rows = useMemo(() => {
//     const list = Array.isArray(users) ? users : []
//     return list
//       .filter((u) => String(u.role || "").toLowerCase() === "farmer")
//       .map((u) => {
//         const farmerId = u.farmer_id ?? u.farmer?.id ?? u.id
//         return {
//           id: farmerId,
//           name: u.fullnames || u.username || u.user?.username || "—",
//           email: u.email || u.user?.email || "—",
//           phone: u.phone_number || u.user?.phone_number || "—",
//           address: u.address || u.user?.address || "—",
//         }
//       })
//   }, [users])

//   const filteredRows = useMemo(() => {
//     const q = (query || "").trim().toLowerCase()
//     if (!q) return rows
//     return rows.filter((r) => {
//       const hay = [r.name, r.email, r.phone, r.address].join(" ").toLowerCase()
//       return hay.includes(q)
//     })
//   }, [rows, query])

//   const closeModal = () => {
//     setShowUserModal(false)
//     setSelectedFarmerId(null)
//     setShowRaw(false)
//   }

//   // Derived details view model
//   const vm = useMemo(() => {
//     const f = selectedFarmer || {}
//     const name = f.user?.fullnames || f.fullnames || f.full_name || f.username || "—"
//     const email = f.user?.email || f.email || "—"
//     const phone = f.phone_number || f.phone || f.user?.phone_number || "—"
//     const address = f.address || f.user?.address || f.location || "—"
//     const farmSize = f.farm_size_ha ?? null
//     const language = f.preferred_language || null
//     const created = f.created_at || null
//     const updated = f.updated_at || null
//     const id = f.id ?? null
//     const lat = f.location_lat || f.latitude || null
//     const lng = f.location_lng || f.longitude || null

//     return { id, name, email, phone, address, farmSize, language, created, updated, lat, lng, raw: f }
//   }, [selectedFarmer])

//   // Fields for lower grid
//   const displayFields = useMemo(() => {
//     const fields = [
//       { label: "Preferred language", value: vm.language },
//       { label: "Farm size (ha)", value: vm.farmSize },
//       { label: "Created at", value: fmtDateTime(vm.created) },
//       { label: "Updated at", value: fmtDateTime(vm.updated) },
//     ]
//     return fields.filter((x) => x.value != null && x.value !== "")
//   }, [vm])

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
//         <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
//           <FiUsers className="text-green-600" /> Farmer Management
//         </h1>
//         <div className="flex items-center gap-2 w-full md:w-auto">
//           <div className="relative flex-1 md:flex-none md:w-72">
//             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by name, email, phone, address…"
//               className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
//             />
//           </div>
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
//           >
//             <FiPlus /> Add Farmer
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
//         {isUsersLoading ? (
//           <div className="text-green-600 py-8 text-center">Loading farmers...</div>
//         ) : usersError ? (
//           <div className="text-red-600 py-8 text-center">{usersError.detail || usersError.message || String(usersError)}</div>
//         ) : filteredRows.length === 0 ? (
//           <div className="text-gray-500 py-8 text-center">No farmers found.</div>
//         ) : (
//           <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="py-2 px-3 text-left">#</th>
//                 <th className="py-2 px-3 text-left">Name</th>
//                 <th className="py-2 px-3 text-left">Email</th>
//                 <th className="py-2 px-3 text-left">Phone</th>
//                 <th className="py-2 px-3 text-left">Address</th>
//                 <th className="py-2 px-3 text-left">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredRows.map((r, idx) => (
//                 <tr key={r.id} className="border-t border-gray-100 hover:bg-green-50 transition">
//                   <td className="py-2 px-3">{idx + 1}</td>
//                   <td className="py-2 px-3 flex items-center gap-2">
//                     <FiUser className="text-green-500" />
//                     {r.name}
//                   </td>
//                   <td className="py-2 px-3">{r.email}</td>
//                   <td className="py-2 px-3">{r.phone}</td>
//                   <td className="py-2 px-3">{r.address}</td>
//                   <td className="py-2 px-3">
//                     <button
//                       onClick={() => setSelectedFarmerId(r.id)}
//                       className="text-green-700 hover:underline font-medium"
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Create Farmer Modal */}
//       {showCreateModal && (
//         <CreateFarmerModal
//           onClose={() => setShowCreateModal(false)}
//           onCreated={() => {
//             setShowCreateModal(false)
//             dispatch(fetchAllUsers()) // refresh from users slice
//           }}
//           isLoading={isUsersLoading}
//           backendError={authError}
//           dispatch={dispatch}
//         />
//       )}

//       {/* Organized Farmer Details Modal */}
//       {showUserModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative">
//             <button
//               className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
//               onClick={closeModal}
//               title="Close"
//             >
//               <FiX className="w-6 h-6" />
//             </button>

//             <div className="p-6">
//               {/* Header */}
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
//                     {getInitials(vm.name)}
//                   </div>
//                   <div>
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <h2 className="text-xl font-bold text-gray-900">{vm.name || "—"}</h2>
//                       {vm.id && (
//                         <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
//                           {/* <FiHash /> ID: {vm.id} */}
//                           <button
//                             onClick={() => navigator.clipboard.writeText(String(vm.id))}
//                             className="ml-1 text-gray-500 hover:text-gray-700"
//                             title="Copy ID"
//                           >
//                             <FiCopy />
//                           </button>
//                         </span>
//                       )}
//                     </div>
//                     <div className="text-xs text-gray-500 mt-0.5">Farmer Profile</div>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={() => selectedFarmerId && dispatch(getFarmerById(selectedFarmerId))}
//                     className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
//                     title="Refresh"
//                   >
//                     <FiRefreshCw /> Refresh
//                   </button>
//                   {vm.phone && vm.phone !== "—" && (
//                     <button
//                       type="button"
//                       onClick={() => navigator.clipboard.writeText(String(vm.phone))}
//                       className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
//                       title="Copy Phone"
//                     >
//                       <FiCopy /> Copy Phone
//                     </button>
//                   )}
//                   {/* {vm.email && vm.email !== "—" && (
//                     // <button
//                     //   type="button"
//                     //   onClick={() => navigator.clipboard.writeText(String(vm.email))}
//                     //   className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
//                     //   title="Copy Email"
//                     // >
//                     //   <FiCopy /> Copy Email
//                     // </button>
//                   )} */}
//                 </div>
//               </div>

//               {/* Loading / Error */}
//               {isLoadingDetail ? (
//                 <DetailSkeleton />
//               ) : farmerError ? (
//                 <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//                   {farmerError.detail || farmerError.message || String(farmerError)}
//                 </div>
//               ) : !selectedFarmer ? (
//                 <div className="mt-4 text-gray-500">No farmer selected.</div>
//               ) : (
//                 <>
//                   {/* Summary cards */}
//                   <div className="grid md:grid-cols-3 gap-4 mt-6">
//                     {/* Contact */}
//                     <div className="border rounded-lg p-4">
//                       <div className="text-sm font-semibold text-gray-700 mb-2">Contact</div>
//                       <div className="space-y-2 text-sm">
//                         <div className="flex items-start gap-2">
//                           <FiPhone className="mt-0.5 text-emerald-600" />
//                           <a className="text-gray-800 hover:underline" href={vm.phone && vm.phone !== "—" ? `tel:${vm.phone}` : "#"}>{vm.phone || "—"}</a>
//                         </div>
                           
//                         <div className="flex items-start gap-2">
//                           <FiMapPin className="mt-0.5 text-rose-500" />
//                           <span className="text-gray-800 break-words">{vm.address || "—"}</span>
//                         </div>
//                         {(vm.lat && vm.lng) || (vm.address && vm.address !== "—") ? (
//                           <a
//                             className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-2"
//                             href={vm.lat && vm.lng
//                               ? `https://www.google.com/maps?q=${vm.lat},${vm.lng}`
//                               : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vm.address)}`
//                             }
//                             target="_blank"
//                             rel="noreferrer"
//                           >
//                             <FiExternalLink /> Open in Maps
//                           </a>
//                         ) : null}
//                       </div>
//                     </div>

//                     {/* Farm */}
//                     <div className="border rounded-lg p-4">
//                       <div className="text-sm font-semibold text-gray-700 mb-2">Farm</div>
//                       <div className="space-y-2 text-sm">
//                         <KeyVal label="Farm size (ha)" value={vm.farmSize ?? "—"} />
//                         <KeyVal label="Preferred language" value={vm.language ?? "—"} />
//                       </div>
//                     </div>

//                     {/* Membership & Meta */}
//                     <div className="border rounded-lg p-4">
//                       <div className="text-sm font-semibold text-gray-700 mt-4 mb-2">Meta</div>
//                       <div className="space-y-2 text-sm">
//                         <div className="flex items-start gap-2">
//                           <FiCalendar className="mt-0.5 text-gray-500" />
//                           <span className="text-gray-700">Created: {fmtDateTime(vm.created) || "—"}</span>
//                         </div>
//                         <div className="flex items-start gap-2">
//                           <FiCalendar className="mt-0.5 text-gray-500" />
//                           <span className="text-gray-700">Updated: {fmtDateTime(vm.updated) || "—"}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Additional fields */}
//                   {displayFields.length > 0 && (
//                     <div className="border-t mt-6 pt-4">
//                       <h3 className="text-sm font-semibold text-gray-700 mb-2">More details</h3>
//                       <div className="grid sm:grid-cols-2 gap-3">
//                         {displayFields.map((f) => (
//                           <div key={f.label} className="flex justify-between gap-4 text-sm">
//                             <span className="text-gray-500">{f.label}</span>
//                             <span className="text-gray-800 font-medium break-all text-right">{String(f.value)}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

                 
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// /* ---------- Create Farmer Modal (unchanged) ---------- */
// function CreateFarmerModal({ onClose, onCreated, dispatch, isLoading, backendError }) {
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "farmer",
//     address: "",
//     phone_number: "",
//   })
//   const [errors, setErrors] = useState({})
//   const [submitting, setSubmitting] = useState(false)

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setForm((prev) => ({ ...prev, [name]: value }))
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
//   }

//   const validate = () => {
//     const e = {}
//     if (!form.username || form.username.length < 3) e.username = "Username is required (min 3 chars)"
//     if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required"
//     if (!form.password || form.password.length < 8) e.password = "Min 8 characters"
//     if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match"
//     if (!form.address || form.address.length < 3) e.address = "Enter address"
//     if (!form.phone_number || !/^\+?[\d\s\-()]{10,}$/.test(form.phone_number)) e.phone_number = "Valid phone required"
//     setErrors(e)
//     return Object.keys(e).length === 0
//   }

//   const submit = async (e) => {
//     e.preventDefault()
//     if (!validate()) return
//     setSubmitting(true)
//     const payload = { ...form, role: "farmer" }
//     const res = await dispatch(signupUser(payload))
//     setSubmitting(false)
//     if (!res.error) {
//       onCreated?.()
//     }
//   }

//   const readBackendError = (err) => {
//     if (!err) return null
//     if (typeof err === "string") return err
//     return err.detail || err.error || err.message || null
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
//         <div className="flex items-center justify-between p-4 border-b">
//           <h3 className="text-lg font-semibold text-gray-800">Add New Farmer</h3>
//           <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
//             <FiX className="text-xl" />
//           </button>
//         </div>

//         <form onSubmit={submit} className="p-4 space-y-4">
//           {readBackendError(backendError) && (
//             <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//               {readBackendError(backendError)}
//             </div>
//           )}

//           <div className="grid md:grid-cols-2 gap-4">
//             <Field label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} placeholder="e.g. farmer_jane" />
//             <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="e.g. jane@example.com" />
//           </div>

//           <div className="grid md:grid-cols-2 gap-4">
//             <PasswordField label="Password" name="password" value={form.password} onChange={handleChange} error={errors.password} />
//             <PasswordField label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
//           </div>

//           <div className="grid md:grid-cols-2 gap-4">
//             <Field label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} error={errors.phone_number} placeholder="+250 7xx ..." />
//             <Field label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="e.g. Kigali, Gasabo..." />
//           </div>

//           <div className="grid md:grid-cols-2 gap-4">
//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700 block">Role</label>
//               <input
//                 value="Farmer"
//                 disabled
//                 className="w-full px-3 py-2 border-2 rounded-lg border-gray-200 bg-gray-50 text-gray-700"
//               />
//             </div>
//             <div />
//           </div>

//           <div className="flex justify-end gap-2 pt-2">
//             <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting || isLoading}
//               className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
//             >
//               {submitting || isLoading ? "Creating…" : "Create Farmer"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// /* ---------- Small helpers ---------- */
// function Field({ label, name, value, onChange, error, placeholder = "", type = "text" }) {
//   return (
//     <div className="space-y-1">
//       <label className="text-sm font-medium text-gray-700 block">{label}</label>
//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition ${
//           error ? "border-red-300 focus:border-red-500" : "border-gray-2 00 focus:border-green-500"
//         }`}
//       />
//       {error && <p className="text-sm text-red-600">{error}</p>}
//     </div>
//   )
// }

// function PasswordField(props) {
//   const [show, setShow] = useState(false)
//   return (
//     <div className="space-y-1">
//       <label className="text-sm font-medium text-gray-700 block">{props.label}</label>
//       <div className="relative">
//         <input
//           type={show ? "text" : "password"}
//           name={props.name}
//           value={props.value}
//           onChange={props.onChange}
//           className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition ${
//             props.error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
//           }`}
//           placeholder="********"
//         />
//         <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
//           {show ? "🙈" : "👁️"}
//         </button>
//       </div>
//       {props.error && <p className="text-sm text-red-600">{props.error}</p>}
//     </div>
//   )
// }

// function KeyVal({ label, value }) {
//   return (
//     <div className="flex items-start justify-between gap-4">
//       <span className="text-gray-500">{label}</span>
//       <span className="text-gray-800 font-medium break-all text-right">{value ?? "—"}</span>
//     </div>
//   )
// }

// function DetailSkeleton() {
//   return (
//     <div className="mt-6 grid md:grid-cols-3 gap-4 animate-pulse">
//       {[1,2,3].map((i) => (
//         <div key={i} className="border rounded-lg p-4 space-y-2">
//           <div className="h-4 bg-gray-100 rounded w-1/3" />
//           <div className="h-3 bg-gray-100 rounded" />
//           <div className="h-3 bg-gray-100 rounded w-5/6" />
//           <div className="h-3 bg-gray-100 rounded w-2/3" />
//         </div>
//       ))}
//       <div className="md:col-span-3 border-t pt-4">
//         <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
//         <div className="grid sm:grid-cols-2 gap-3">
//           {[...Array(6)].map((_, idx) => (
//             <div key={idx} className="h-3 bg-gray-100 rounded" />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function getInitials(name = "") {
//   const parts = String(name).trim().split(/\s+/).filter(Boolean)
//   if (parts.length === 0) return "—"
//   if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
//   return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
// }

// function fmtDateTime(s) {
//   if (!s) return ""
//   const d = new Date(s)
//   if (Number.isNaN(d.getTime())) return String(s)
//   return d.toLocaleString()
// }

"use client"

import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

// USERS slice
import {
  fetchAllUsers,
  clearUserState,
  setUserStatus, // <- thunk to PATCH /users/:id/status/
} from "../../Redux/authentication/userSlice"

// FARMER slice
import { listFarmers, getFarmerById, clearFarmerState } from "../../Redux/farmer/farmerSlice"
import { signupUser } from "../../Redux/authentication/login"

import {
  FiUsers, FiPlus, FiSearch, FiX,
  FiUser, FiPhone, FiRefreshCw, FiCopy, FiMapPin,
  FiCalendar, FiExternalLink, FiUserCheck, FiUserX
} from "react-icons/fi"

export default function LeaderFarmerManagement() {
  const dispatch = useDispatch()

  // Users slice (list)
  const {
    users,
    isLoading: isUsersLoading,
    error: usersError,
  } = useSelector((state) => state.users)

  // Farmers slice (list + details)
  const {
    farmers,
    selectedFarmer,
    isLoadingList,
    isLoadingDetail,
    error: farmerError,
  } = useSelector((state) => state.farmer)

  const authError = useSelector((state) => state.auth?.error)

  const [query, setQuery] = useState("")
  const [selectedFarmerId, setSelectedFarmerId] = useState(null) // for /farmers/:id/
  const [selectedUserId, setSelectedUserId] = useState(null)     // for /users/:id/status/
  const [showUserModal, setShowUserModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)

  // Load users + farmers
  useEffect(() => {
    dispatch(fetchAllUsers())
    dispatch(listFarmers())
    return () => {
      dispatch(clearUserState())
      dispatch(clearFarmerState())
    }
  }, [dispatch])

  // Open modal and fetch details when we have farmerId
  useEffect(() => {
    if (selectedFarmerId != null) {
      dispatch(getFarmerById(selectedFarmerId))
      setShowUserModal(true)
    }
  }, [selectedFarmerId, dispatch])

  // Build userId -> farmer mapping
  const farmerMapByUserId = useMemo(() => {
    const arr = Array.isArray(farmers) ? farmers : []
    return new Map(
      arr
        .map((f) => {
          const uId = f.user?.id ?? f.user_id ?? (typeof f.user === "number" ? f.user : null)
          return uId ? [String(uId), f] : null
        })
        .filter(Boolean)
    )
  }, [farmers])

  // Rows for table (farmers only)
  const rows = useMemo(() => {
    const list = Array.isArray(users) ? users : []
    return list
      .filter((u) => String(u.role || "").toLowerCase() === "farmer")
      .map((u) => {
        const farmerFromMap = farmerMapByUserId.get(String(u.id)) || null
        const farmerId =
          farmerFromMap?.id ??
          u.farmer_id ??
          (typeof u.farmer === "object" ? u.farmer?.id : null) ??
          null

        return {
          userId: u.id,
          farmerId,
          name: u.fullnames || u.username || u.user?.username || "—",
          email: u.email || u.user?.email || "—",
          phone: u.phone_number || u.user?.phone_number || "—",
          address: u.address || u.user?.address || "—",
          status: (u.status || (u.is_active === false ? "inactive" : "active")).toLowerCase(),
        }
      })
  }, [users, farmerMapByUserId])

  const filteredRows = useMemo(() => {
    const q = (query || "").trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const hay = [r.name, r.email, r.phone, r.address, r.status].join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [rows, query])

  const closeModal = () => {
    setShowUserModal(false)
    setSelectedFarmerId(null)
    setSelectedUserId(null)
    setShowRaw(false)
  }

  // Details view model (for modal)
  const vm = useMemo(() => {
    const f = selectedFarmer || {}
    const name = f.user?.fullnames || f.fullnames || f.full_name || f.username || "—"
    const email = f.user?.email || f.email || "—"
    const phone = f.phone_number || f.phone || f.user?.phone_number || "—"
    const address = f.address || f.user?.address || f.location || "—"
    const farmSize = f.farm_size_ha ?? null
    const language = f.preferred_language || null
    const created = f.created_at || null
    const updated = f.updated_at || null
    const id = f.id ?? null
    const lat = f.location_lat || f.latitude || null
    const lng = f.location_lng || f.longitude || null

    // Prefer nested user.id; else the selected one
    const userId = f.user?.id ?? selectedUserId ?? null

    // Resolve status from nested user; else from users list by selectedUserId
    let status =
      f.user?.status ??
      (typeof f.user?.is_active === "boolean" ? (f.user.is_active ? "active" : "inactive") : null)

    if (!status && selectedUserId) {
      const u = (users || []).find((uu) => String(uu.id) === String(selectedUserId))
      if (u) status = (u.status || (u.is_active === false ? "inactive" : "active")).toLowerCase()
    }

    return { id, userId, name, email, phone, address, farmSize, language, created, updated, lat, lng, status: (status || "active").toLowerCase(), raw: f }
  }, [selectedFarmer, selectedUserId, users])

  const currentStatus = vm.status
  const isActive = currentStatus === "active"
  const statusChip = badgeClass(currentStatus)

  // Toggle in modal
  const handleChangeStatus = async (nextStatus) => {
    const uid = vm.userId ?? selectedUserId
    if (!uid) return
    setIsStatusUpdating(true)
    try {
      // If your API uses is_active boolean, swap payload to { is_active: nextStatus === 'active' }
      await dispatch(setUserStatus({ userId: uid, status: nextStatus })).unwrap()
      await Promise.all([
        dispatch(fetchAllUsers()),
        selectedFarmerId ? dispatch(getFarmerById(selectedFarmerId)) : Promise.resolve(),
      ])
    } catch (err) {
      console.error("Status update failed:", err)
    } finally {
      setIsStatusUpdating(false)
    }
  }

  // Quick toggle in table
  const handleQuickToggle = async (userId, status) => {
    setIsStatusUpdating(true)
    try {
      const next = (status || "active").toLowerCase() === "active" ? "inactive" : "active"
      await dispatch(setUserStatus({ userId, status: next })).unwrap()
      await dispatch(fetchAllUsers())
      if (selectedFarmerId) await dispatch(getFarmerById(selectedFarmerId))
    } catch (err) {
      console.error("Quick toggle failed:", err)
    } finally {
      setIsStatusUpdating(false)
    }
  }

  // Fields grid
  const displayFields = useMemo(() => {
    const fields = [
      { label: "Preferred language", value: vm.language },
      { label: "Farm size (ha)", value: vm.farmSize },
      { label: "Created at", value: fmtDateTime(vm.created) },
      { label: "Updated at", value: fmtDateTime(vm.updated) },
    ]
    return fields.filter((x) => x.value != null && x.value !== "")
  }, [vm])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <FiUsers className="text-green-600" /> Farmer Management
        </h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, phone, address…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            <FiPlus /> Add Farmer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {isUsersLoading || isLoadingList ? (
          <div className="text-green-600 py-8 text-center">Loading farmers...</div>
        ) : usersError ? (
          <div className="text-red-600 py-8 text-center">{usersError.detail || usersError.message || String(usersError)}</div>
        ) : filteredRows.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">No farmers found.</div>
        ) : (
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Phone</th>
                <th className="py-2 px-3 text-left">Address</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => {
                const hasFarmerProfile = r.farmerId != null
                return (
                  <tr key={`${r.userId}-${r.farmerId ?? "nofarmer"}`} className="border-t border-gray-100 hover:bg-green-50 transition">
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3 flex items-center gap-2">
                      <FiUser className="text-green-500" />
                      {r.name}
                    </td>
                    <td className="py-2 px-3">{r.email}</td>
                    <td className="py-2 px-3">{r.phone}</td>
                    <td className="py-2 px-3">{r.address}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${badgeClass(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="py-2 px-3 flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (!hasFarmerProfile) {
                            alert("This user does not have a farmer profile yet.")
                            return
                          }
                          setSelectedFarmerId(r.farmerId)
                          setSelectedUserId(r.userId)
                        }}
                        className={`font-medium ${hasFarmerProfile ? "text-green-700 hover:underline" : "text-gray-400 cursor-not-allowed"}`}
                        disabled={!hasFarmerProfile}
                        title={hasFarmerProfile ? "View details" : "No farmer profile available"}
                      >
                        View
                      </button>

                      {/* Quick toggle: suspend/activate directly */}
                      <button
                        onClick={() => handleQuickToggle(r.userId, r.status)}
                        disabled={isStatusUpdating}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-white ${
                          r.status === "active" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                        } disabled:opacity-50`}
                        title={r.status === "active" ? "Suspend account" : "Activate account"}
                      >
                        {r.status === "active" ? <FiUserX /> : <FiUserCheck />}
                        {r.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Farmer Modal */}
      {showCreateModal && (
        <CreateFarmerModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            dispatch(fetchAllUsers())
            dispatch(listFarmers())
          }}
          isLoading={isUsersLoading || isLoadingList}
          backendError={authError}
          dispatch={dispatch}
        />
      )}

      {/* Details Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              onClick={closeModal}
              title="Close"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                    {getInitials(vm.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-gray-900">{vm.name || "—"}</h2>
                      <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full ${statusChip}`}>
                        <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                        {currentStatus}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Farmer Profile</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => selectedFarmerId && dispatch(getFarmerById(selectedFarmerId))}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
                    title="Refresh"
                  >
                    <FiRefreshCw /> Refresh
                  </button>
                  {vm.phone && vm.phone !== "—" && (
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(String(vm.phone))}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
                      title="Copy Phone"
                    >
                      <FiCopy /> Copy Phone
                    </button>
                  )}
                </div>
              </div>

              {/* Account actions in modal */}
              <div className="mt-4 border rounded-lg p-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-700">
                  Account status:
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${statusChip}`}>
                    {currentStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      type="button"
                      disabled={isStatusUpdating || !(vm.userId ?? selectedUserId)}
                      onClick={() => handleChangeStatus("active")}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      title="Activate account"
                    >
                      <FiUserCheck /> {isStatusUpdating ? "Updating…" : "Activate"}
                    </button>
                  )}
                  {isActive && (
                    <button
                      type="button"
                      disabled={isStatusUpdating || !(vm.userId ?? selectedUserId)}
                      onClick={() => handleChangeStatus("inactive")}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      title="Suspend account"
                    >
                      <FiUserX /> {isStatusUpdating ? "Updating…" : "Suspend"}
                    </button>
                  )}
                </div>
              </div>

              {/* Loading / Error */}
              {isLoadingDetail ? (
                <DetailSkeleton />
              ) : farmerError ? (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {farmerError.detail || farmerError.message || String(farmerError)}
                </div>
              ) : !selectedFarmer ? (
                <div className="mt-4 text-gray-500">No farmer selected.</div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {/* Contact */}
                    <div className="border rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Contact</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <FiPhone className="mt-0.5 text-emerald-600" />
                          <a className="text-gray-800 hover:underline" href={vm.phone && vm.phone !== "—" ? `tel:${vm.phone}` : "#"}>{vm.phone || "—"}</a>
                        </div>
                        <div className="flex items-start gap-2">
                          <FiMapPin className="mt-0.5 text-rose-500" />
                          <span className="text-gray-800 break-words">{vm.address || "—"}</span>
                        </div>
                        {(vm.lat && vm.lng) || (vm.address && vm.address !== "—") ? (
                          <a
                            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-2"
                            href={vm.lat && vm.lng
                              ? `https://www.google.com/maps?q=${vm.lat},${vm.lng}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vm.address)}`
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FiExternalLink /> Open in Maps
                          </a>
                        ) : null}
                      </div>
                    </div>

                    {/* Farm */}
                    <div className="border rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Farm</div>
                      <div className="space-y-2 text-sm">
                        <KeyVal label="Farm size (ha)" value={vm.farmSize ?? "—"} />
                        <KeyVal label="Preferred language" value={vm.language ?? "—"} />
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="border rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Meta</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <FiCalendar className="mt-0.5 text-gray-500" />
                          <span className="text-gray-700">Created: {fmtDateTime(vm.created) || "—"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <FiCalendar className="mt-0.5 text-gray-500" />
                          <span className="text-gray-700">Updated: {fmtDateTime(vm.updated) || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Raw JSON toggle */}
                  {showRaw && (
                    <pre className="mt-4 max-h-64 overflow-auto text-xs bg-gray-50 border border-gray-200 rounded p-3">
                      {JSON.stringify(vm.raw, null, 2)}
                    </pre>
                  )}
                  <button
                    onClick={() => setShowRaw((s) => !s)}
                    className="mt-3 text-xs text-emerald-700 hover:underline"
                  >
                    {showRaw ? "Hide raw JSON" : "Show raw JSON"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Create Farmer Modal (unchanged) ---------- */
function CreateFarmerModal({ onClose, onCreated, dispatch, isLoading, backendError }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer",
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
    if (!form.address || form.address.length < 3) e.address = "Enter address"
    if (!form.phone_number || !/^\+?[\d\s\-()]{10,}$/.test(form.phone_number)) e.phone_number = "Valid phone required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const payload = { ...form, role: "farmer" }
    const res = await dispatch(signupUser(payload))
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
          <h3 className="text-lg font-semibold text-gray-800">Add New Farmer</h3>
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
            <Field label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} placeholder="e.g. farmer_jane" />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="e.g. jane@example.com" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <PasswordField label="Password" name="password" value={form.password} onChange={handleChange} error={errors.password} />
            <PasswordField label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} error={errors.phone_number} placeholder="+250 7xx ..." />
            <Field label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="e.g. Kigali, Gasabo..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">Role</label>
              <input
                value="Farmer"
                disabled
                className="w-full px-3 py-2 border-2 rounded-lg border-gray-200 bg-gray-50 text-gray-700"
              />
            </div>
            <div />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting || isLoading ? "Creating…" : "Create Farmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---------- Helpers ---------- */
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

function KeyVal({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium break-all text-right">{value ?? "—"}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mt-6 grid md:grid-cols-3 gap-4 animate-pulse">
      {[1,2,3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
      <div className="md:col-span-3 border-t pt-4">
        <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
        <div className="grid sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-3 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "—"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

function fmtDateTime(s) {
  if (!s) return ""
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return String(s)
  return d.toLocaleString()
}

function badgeClass(status) {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700"
    case "inactive":
    case "suspended":
      return "bg-red-50 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}