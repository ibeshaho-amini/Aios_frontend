// "use client"

// import React, { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { FiFilter } from "react-icons/fi"

// // Call the slice exactly like your inline example
// import { fetchAllUsages } from "../../Redux/farmer/usageSlice"

// // Call your leader report component (default export)
// import LeaderInputsReportBuilder from "../leader/reportComponent"

// const SEASONS = ["Season A", "Season B", "Season C"]
// const currentYear = new Date().getFullYear()
// const lastYears = Array.from({ length: 6 }, (_, i) => currentYear - i)

// export default function LeaderInputsReportPage() {
//   const dispatch = useDispatch()
//   const { allUsages = [], isLoadingAll, error } = useSelector((s) => s.usage || {})

//   // Optional server-side filters for GET /admin/usages/
//   const [filters, setFilters] = useState({
//     input_type: "",
//     season_year: "",
//     season_name: "",
//     crop: "",
//     start_date: "",
//     end_date: "",
//     // user_id: "", // uncomment if your backend supports filtering by user/farmer
//   })

//   // Initial load (same as your inline example)
//   useEffect(() => {
//     dispatch(fetchAllUsages({}))
//   }, [dispatch])

//   const applyServerFilters = () => {
//     dispatch(fetchAllUsages(filters))
//   }

//   const resetServerFilters = () => {
//     const cleared = {
//       input_type: "",
//       season_year: "",
//       season_name: "",
//       crop: "",
//       start_date: "",
//       end_date: "",
//       // user_id: "",
//     }
//     setFilters(cleared)
//     dispatch(fetchAllUsages({}))
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <header className="flex items-center justify-between">
//         <h1 className="text-2xl md:text-3xl font-bold text-green-800">Leaders Inputs Report</h1>
//       </header>

//       {/* Server-side Filters (optional) */}
//       <div className="bg-white rounded-xl shadow p-4">
//         <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//           <FiFilter /> Fetch data (server filters, optional)
//         </h3>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//           <div>
//             <label className="block text-xs text-gray-600 mb-1">Input type</label>
//             <select
//               value={filters.input_type}
//               onChange={(e) => setFilters((f) => ({ ...f, input_type: e.target.value }))}
//               className="w-full border rounded-lg px-3 py-2 text-sm"
//             >
//               <option value="">All</option>
//               <option value="fertilizer">Fertilizer</option>
//               <option value="pesticide">Pesticide</option>
//               <option value="seed">Seed</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs text-gray-600 mb-1">Season year</label>
//             <select
//               value={filters.season_year}
//               onChange={(e) => setFilters((f) => ({ ...f, season_year: e.target.value }))}
//               className="w-full border rounded-lg px-3 py-2 text-sm"
//             >
//               <option value="">All</option>
//               {lastYears.map((y) => (
//                 <option key={y} value={y}>
//                   {y}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs text-gray-600 mb-1">Season name</label>
//             <select
//               value={filters.season_name}
//               onChange={(e) => setFilters((f) => ({ ...f, season_name: e.target.value }))}
//               className="w-full border rounded-lg px-3 py-2 text-sm"
//             >
//               <option value="">All</option>
//               {SEASONS.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs text-gray-600 mb-1">Crop</label>
//             <input
//               value={filters.crop}
//               onChange={(e) => setFilters((f) => ({ ...f, crop: e.target.value }))}
//               className="w-full border rounded-lg px-3 py-2 text-sm"
//               placeholder="e.g., Maize"
//             />
//           </div>

//           <div>
//             <label className="block text-xs text-gray-600 mb-1">Start date</label>
//             <input
//               type="date"
//               value={filters.start_date}
//               onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
//               className="w-full border rounded-lg px-3 py-2 text-sm"
//               max={filters.end_date || undefined}
//             />
//           </div>

//           <div>
//             <label className="block text-xs text-gray-600 mb-1">End date</label>
//             <input
//               type="date"
//               value={filters.end_date}
//               onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
//               className="w-full border rounded-lg px-3 py-2 text-sm"
//               min={filters.start_date || undefined}
//             />
//           </div>

//           {/* Optional: filter by user/farmer if your API supports it
//           <div>
//             <label className="block text-xs text-gray-600 mb-1">Farmer (user_id)</label>
//             <input
//               value={filters.user_id || ""}
//               onChange={(e) => setFilters((f) => ({ ...f, user_id: e.target.value }))}
//               className="w-full border rounded-lg px-3 py-2 text-sm"
//               placeholder="e.g., 123"
//             />
//           </div>
//           */}
//         </div>

//         <div className="flex items-center gap-2 mt-3">
//           <button
//             onClick={applyServerFilters}
//             className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
//           >
//             Apply
//           </button>
//           <button
//             onClick={resetServerFilters}
//             className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//           >
//             Reset
//           </button>
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
//           {typeof error === "string" ? error : error?.detail || "Failed to load data"}
//         </div>
//       )}

//       {/* Report Builder (client-side grouping + PDF) */}
//       <div className="bg-white rounded-xl shadow p-4">
//         {isLoadingAll ? (
//           <p className="text-sm text-gray-500">Loading data…</p>
//         ) : (
//           <LeaderInputsReportBuilder
//             usages={allUsages}   // data from your slice
//             users={[]}           // optionally pass users for better names
//             seasons={SEASONS}
//             years={lastYears}
//             systemName="AIOS"
//             currency=""
//           />
//         )}
//       </div>
//     </div>
//   )
// }

"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FiFilter } from "react-icons/fi"

import { fetchAllUsages } from "../../Redux/farmer/usageSlice"

import LeaderInputsReportBuilder from "../leader/reportComponent"

const SEASONS = ["Season A", "Season B"]
const currentYear = new Date().getFullYear()
const lastYears = Array.from({ length: 6 }, (_, i) => currentYear - i)

export default function LeaderInputsReportPage() {
  const dispatch = useDispatch()
  const { allUsages = [], isLoadingAll, error } = useSelector((s) => s.usage || {})
  const authUser = useSelector((s) => s.auth?.user) // adapt to your auth slice

  const preparedBy =
    authUser?.full_name || authUser?.username || authUser?.email || "—"

  // Optional server-side filters for GET /admin/usages/
  const [filters, setFilters] = useState({
    input_type: "",
    season_year: "",
    season_name: "",
    crop: "",
    start_date: "",
    end_date: "",
    // user_id: "", // uncomment if your backend supports it
  })

  useEffect(() => {
    dispatch(fetchAllUsages({}))
  }, [dispatch])

  const applyServerFilters = () => {
    dispatch(fetchAllUsages(filters))
  }

  const resetServerFilters = () => {
    const cleared = {
      input_type: "",
      season_year: "",
      season_name: "",
      crop: "",
      start_date: "",
      end_date: "",
      // user_id: "",
    }
    setFilters(cleared)
    dispatch(fetchAllUsages({}))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">
            Leaders Inputs Report
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Prepared by: {preparedBy}
          </p>
        </div>
      </header>

      {/* Server-side Filters (optional) */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiFilter /> Fetch data (server filters, optional)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Input type</label>
            <select
              value={filters.input_type}
              onChange={(e) => setFilters((f) => ({ ...f, input_type: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="pesticide">Pesticide</option>
              <option value="seed">Seed</option>
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

          {/* Optional: filter by specific farmer if API supports it
          <div>
            <label className="block text-xs text-gray-600 mb-1">Farmer (user_id)</label>
            <input
              value={filters.user_id || ""}
              onChange={(e) => setFilters((f) => ({ ...f, user_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., 123"
            />
          </div>
          */}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={applyServerFilters}
            disabled={isLoadingAll}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Apply
          </button>
          <button
            onClick={resetServerFilters}
            disabled={isLoadingAll}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {typeof error === "string" ? error : error?.detail || "Failed to load data"}
        </div>
      )}

      {/* Report Builder */}
      <div className="bg-white rounded-xl shadow p-4">
        {isLoadingAll ? (
          <p className="text-sm text-gray-500">Loading data…</p>
        ) : (
          <LeaderInputsReportBuilder
            usages={allUsages}
            users={[]}               
            seasons={SEASONS}
            years={lastYears}
            systemName="AIOS"
            currency=""
            preparedBy={preparedBy}  
          />
        )}
      </div>
    </div>
  )
}