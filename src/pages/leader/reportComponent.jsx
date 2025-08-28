// "use client"

// import React, { useMemo, useState } from "react"
// import { FiFilter, FiDownload, FiFileText } from "react-icons/fi"
// import jsPDF from "jspdf"
// import autoTable from "jspdf-autotable"

// // Utils
// const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
// const formatNum = (v) => toNumber(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
// const formatMoney = (v, currency = "") => {
//   const s = toNumber(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
//   return currency ? `${currency} ${s}` : s
// }
// const pad2 = (n) => String(n).padStart(2, "0")
// function parseYMD(ymd) {
//   const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "")
//   if (!m) return null
//   const [_, y, mo, d] = m
//   return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
// }
// const seasonOrder = (s) => ({ "Season A": 0, "Season B": 1, "Season C": 2 }[s] ?? 99)

// // Users / names
// const buildUserMap = (users = []) => {
//   const pairs = []
//   for (const u of users) {
//     const id = u.id ?? u.user_id ?? u.farmer_user_id ?? u.pk ?? u.uid
//     if (id != null) pairs.push([String(id), u])
//   }
//   return new Map(pairs)
// }
// const getFarmerId = (u) =>
//   u.user_id ??
//   u.farmer_user_id ??
//   (typeof u.user === "object" ? u.user?.id : u.user) ??
//   u.farmer_id ??
//   u.farmer?.id ??
//   u.owner_id ??
//   null

// const getFarmerName = (u, userMap) => {
//   const fid = getFarmerId(u)
//   const candidate = (fid != null ? userMap.get(String(fid)) : null) || null
//   const fallback =
//     u.farmer_name ||
//     u.user_name ||
//     (typeof u.user === "object" ? u.user?.username : u.username) ||
//     (fid != null ? `User #${fid}` : "Unknown")
//   return (
//     candidate?.full_name ||
//     candidate?.username ||
//     candidate?.name ||
//     candidate?.email ||
//     fallback
//   )
// }

// // Normalize "product name" for grouping (seed uses crop)
// const productLabel = (u) =>
//   (u.input_type === "seed" ? (u.crop || u.product_name) : u.product_name)?.trim() || "—"

// export default function LeaderInputsReportBuilder({
//   usages = [],
//   users = [],
//   seasons = ["Season A", "Season B", "Season C"],
//   years,                  // optional: [2025, 2024, ...]
//   systemName = "AIOS",
//   currency = "",
//   preparedBy = "",        // <= NEW: pass logged-in user's name
// }) {
//   const userMap = useMemo(() => buildUserMap(users), [users])

//   const availableYears = useMemo(() => {
//     if (Array.isArray(years) && years.length) return years
//     const set = new Set(usages.filter(u => u.season_year != null).map(u => Number(u.season_year)))
//     return Array.from(set).sort((a, b) => b - a)
//   }, [years, usages])

//   // Filters
//   const [groupBy, setGroupBy] = useState("product") // "product" | "season"
//   const [seasonYear, setSeasonYear] = useState("")
//   const [seasonName, setSeasonName] = useState("")
//   const [inputType, setInputType] = useState("")
//   const [query, setQuery] = useState("")
//   const [startDate, setStartDate] = useState("")
//   const [endDate, setEndDate] = useState("")
//   const [showFarmerNames, setShowFarmerNames] = useState(true)
//   const [isGenerating, setIsGenerating] = useState(false)

//   // Apply filters to records
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase()
//     const sd = startDate ? new Date(`${startDate}T00:00:00Z`) : null
//     const ed = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null

//     return (usages || []).filter((u) => {
//       if (seasonYear && String(u.season_year) !== String(seasonYear)) return false
//       if (seasonName && String(u.season_name) !== String(seasonName)) return false
//       if (inputType && u.input_type !== inputType) return false

//       if (sd || ed) {
//         const d = parseYMD(u.application_date)
//         if (!d) return false
//         if (sd && d < sd) return false
//         if (ed && d > ed) return false
//       }

//       if (q) {
//         const hay = [
//           productLabel(u),
//           u.brand,
//           u.crop,
//           u.field_name,
//           u.input_type,
//         ]
//           .filter(Boolean)
//           .join(" ")
//           .toLowerCase()
//         if (!hay.includes(q)) return false
//       }
//       return true
//     })
//   }, [usages, seasonYear, seasonName, inputType, startDate, endDate, query])

//   // Dynamic units present
//   const unitsList = useMemo(() => {
//     const set = new Set(filtered.map((u) => (u.unit || "").trim()).filter(Boolean))
//     const order = ["kg", "l", "pcs"]
//     return Array.from(set).sort((a, b) => {
//       const ia = order.indexOf(a), ib = order.indexOf(b)
//       if (ia === -1 && ib === -1) return a.localeCompare(b)
//       if (ia === -1) return 1
//       if (ib === -1) return -1
//       return ia - ib
//     })
//   }, [filtered])

//   // Grouped rows
//   const rowsProduct = useMemo(() => groupByProduct(filtered, userMap), [filtered, userMap])
//   const rowsSeason = useMemo(() => groupBySeason(filtered, unitsList, userMap), [filtered, unitsList, userMap])

//   // Top summary metrics (5 tiles)
//   const kpis = useMemo(() => {
//     const uniqFarmers = new Set(filtered.map((u) => getFarmerName(u, userMap))).size
//     const uniqProducts = new Set(filtered.map((u) => productLabel(u))).size
//     const uniqSeasons = new Set(filtered.map((u) => `${u.season_year || ""} ${u.season_name || ""}`.trim())).size
//     const totalSpent = filtered.reduce((acc, u) => acc + toNumber(u.cost), 0)
//     const applications = filtered.length
//     return { uniqFarmers, uniqProducts, uniqSeasons, totalSpent, applications }
//   }, [filtered, userMap])

//   const resetFilters = () => {
//     setGroupBy("product")
//     setSeasonYear("")
//     setSeasonName("")
//     setInputType("")
//     setQuery("")
//     setStartDate("")
//     setEndDate("")
//     setShowFarmerNames(true)
//   }

//   // PDF
//   const downloadPDF = async () => {
//   const rows = groupBy === "product" ? rowsProduct : rowsSeason
//   if (!rows.length) return
//   setIsGenerating(true)
//   try {
//     const doc = new jsPDF({ unit: "pt", format: "a4" })
//     const marginLeft = 40
//     const headerHeight = 100
//     const pageWidth = doc.internal.pageSize.getWidth()
//     const pageHeight = doc.internal.pageSize.getHeight()

//     const groupPhrase = groupBy === "product" ? "Grouped by product" : "Grouped by season"
//     const seasonPhrase =
//       seasonYear && seasonName
//         ? `for ${seasonYear} ${seasonName}`
//         : seasonYear
//         ? `for ${seasonYear} (all seasons)`
//         : "for all seasons"
//     const typePhrase = inputType ? `only ${inputType}` : "all input types"
//     let datePhrase = ""
//     if (startDate && endDate) {
//       datePhrase = startDate === endDate ? `on ${startDate}` : `from ${startDate} to ${endDate}`
//     } else if (startDate) {
//       datePhrase = `from ${startDate}`
//     } else if (endDate) {
//       datePhrase = `up to ${endDate}`
//     } else {
//       datePhrase = "for all dates"
//     }
//     const qPhrase = query ? `matching "${query}"` : "no text filter"
//     const filtersLine = `${groupPhrase} ${seasonPhrase}, ${typePhrase}, ${datePhrase}, ${qPhrase}`

//     // Columns + body
//     let columns = []
//     let body = []

//     if (groupBy === "product") {
//       columns = [
//         { header: "Product", dataKey: "product" },
//         { header: "Type", dataKey: "type" },
//         { header: "Unit", dataKey: "unit" },
//         { header: "Qty", dataKey: "qty" },
//         { header: "Total Spent", dataKey: "spent" },
//         { header: "Applications", dataKey: "apps" },
//         { header: "Farmers (#)", dataKey: "farmerCount" },
//       ]
//       if (showFarmerNames) columns.push({ header: "Farmers (names)", dataKey: "farmers" })

//       body = rows.map((r) => ({
//         product: r.product,
//         type: r.input_type,
//         unit: r.unit,
//         qty: formatNum(r.totalQty),
//         spent: formatMoney(r.totalCost, currency),
//         apps: r.applications,
//         farmerCount: r.farmers.length,
//         ...(showFarmerNames ? { farmers: r.farmers.join(", ") } : {}),
//       }))
//     } else {
//       // By season
//       columns = [
//         { header: "Season", dataKey: "season" },
//         ...unitsList.map((u) => ({ header: `Qty (${u})`, dataKey: `qty_${u}` })),
//         { header: "Total Spent", dataKey: "spent" },
//         { header: "Applications", dataKey: "apps" },
//         { header: "Farmers (#)", dataKey: "farmerCount" },
//       ]
//       body = rows.map((r) => {
//         const base = {
//           season: `${r.season_year} ${r.season_name}`,
//           spent: formatMoney(r.totalCost, currency),
//           apps: r.applications,
//           farmerCount: r.farmers.length,
//         }
//         for (const u of unitsList) base[`qty_${u}`] = formatNum(r.qtyByUnit[u] || 0)
//         return base
//       })
//     }

//     doc.setProperties({
//       title: `${systemName} — Leaders Inputs Report`,
//       subject: "Inputs usage report (leader)",
//       creator: systemName,
//     })

//     autoTable(doc, {
//       columns,
//       body,
//       startY: headerHeight,
//       margin: { top: headerHeight + 10, bottom: 60, left: marginLeft, right: marginLeft },
//       styles: { fontSize: 9, cellPadding: 4 },
//       headStyles: { fillColor: [34, 197, 94] },
//       didDrawPage: (data) => {
//         // Header
//         doc.setDrawColor(230)
//         doc.line(marginLeft, headerHeight - 16, pageWidth - marginLeft, headerHeight - 16)
//         doc.setTextColor(40)
//         doc.setFontSize(16)
//         doc.text(`${systemName} — Leaders Inputs Report`, marginLeft, 34)
//         doc.setFontSize(10)
//         doc.text(`Prepared by: ${preparedBy || "—"}`, marginLeft, 52)
//         doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 68)

//         // Filters line (wrap)
//         const wrapped = doc.splitTextToSize(filtersLine, pageWidth - marginLeft * 2)
//         doc.text(wrapped, marginLeft, 84)

//         // Footer page number
//         doc.setFontSize(9)
//         doc.setTextColor(120)
//         doc.text(`Page ${data.pageNumber}`, pageWidth - marginLeft - 40, pageHeight - 20)
//       },
//     })

//     // Summary after table (no redeclare of pageHeight)
//     const finalY = (doc.lastAutoTable?.finalY || headerHeight) + 16
//     const summaryLines = [
//       `Summary:`,
//       `- Total spent: ${formatMoney(kpis.totalSpent, currency)}`,
//       `- Applications: ${kpis.applications}`,
//       `- Unique farmers: ${kpis.uniqFarmers}`,
//       `- Unique products: ${kpis.uniqProducts}`,
//       `- Seasons covered: ${kpis.uniqSeasons}`,
//     ]
//     if (finalY + summaryLines.length * 14 > pageHeight - 40) {
//       doc.addPage()
//     }
//     const y = Math.max(finalY, pageHeight - Math.max(120, summaryLines.length * 14 + 40))
//     doc.setFontSize(11)
//     doc.setTextColor(40)
//     doc.text(summaryLines, marginLeft, y)

//     const yr = seasonYear || "ALL"
//     const sn = seasonName ? seasonName.replace(/\s+/g, "") : "ALL"
//     const gb = groupBy === "product" ? "ByProduct" : "BySeason"
//     const sd = startDate ? startDate.replace(/-/g, "") : "ALL"
//     const ed = endDate ? endDate.replace(/-/g, "") : "ALL"
//     const it = inputType ? inputType.toUpperCase() : "ALL"
//     const fileName = `${systemName}_LeaderInputs_${gb}_${yr}_${sn}_${it}_${sd}_${ed}.pdf`
//     doc.save(fileName)
//   } finally {
//     setIsGenerating(false)
//   }
// }

//   // No data colSpan
//   const noDataColSpan =
//     groupBy === "product"
//       ? 7 + (showFarmerNames ? 1 : 0)
//       : 4 + unitsList.length

//   return (
//     <div className="bg-white rounded-xl shadow p-4 space-y-4">
//       {/* Title + counters */}
//       <div className="flex items-center justify-between">
//         <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//           <FiFilter /> Leaders Inputs Report
//         </h3>
//         <div className="text-xs md:text-sm text-gray-500">
//           Records: <span className="font-medium text-gray-700">{filtered.length}</span>
//         </div>
//       </div>

//       {/* 5 KPIs (push table down a little) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//         <Kpi title="Total Spent" value={formatMoney(kpis.totalSpent, currency)} />
//         <Kpi title="Applications" value={kpis.applications.toLocaleString()} />
//         <Kpi title="Unique Farmers" value={kpis.uniqFarmers.toLocaleString()} />
//         <Kpi title="Unique Products" value={kpis.uniqProducts.toLocaleString()} />
//         <Kpi title="Seasons Covered" value={kpis.uniqSeasons.toLocaleString()} />
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
//         <div className="md:col-span-2">
//           <label className="block text-xs text-gray-600 mb-1">Group by</label>
//           <div className="bg-gray-100 rounded-lg p-1 w-fit">
//             <button
//               onClick={() => setGroupBy("product")}
//               className={`px-3 py-1 rounded-md text-sm ${groupBy === "product" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
//             >
//               Product
//             </button>
//             <button
//               onClick={() => setGroupBy("season")}
//               className={`px-3 py-1 rounded-md text-sm ${groupBy === "season" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
//             >
//               Season
//             </button>
//           </div>
//         </div>

//         <div>
//           <label className="block text-xs text-gray-600 mb-1">Season year</label>
//           <select
//             value={seasonYear}
//             onChange={(e) => setSeasonYear(e.target.value)}
//             className="w-full border rounded-lg px-3 py-2 text-sm"
//           >
//             <option value="">All</option>
//             {availableYears.map((y) => (
//               <option key={y} value={y}>{y}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-xs text-gray-600 mb-1">Season name</label>
//           <select
//             value={seasonName}
//             onChange={(e) => setSeasonName(e.target.value)}
//             className="w-full border rounded-lg px-3 py-2 text-sm"
//           >
//             <option value="">All</option>
//             {seasons.map((s) => (
//               <option key={s} value={s}>{s}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-xs text-gray-600 mb-1">Input type</label>
//           <select
//             value={inputType}
//             onChange={(e) => setInputType(e.target.value)}
//             className="w-full border rounded-lg px-3 py-2 text-sm"
//           >
//             <option value="">All</option>
//             <option value="fertilizer">Fertilizer</option>
//             <option value="pesticide">Pesticide</option>
//             <option value="seed">Seed</option>
//           </select>
//         </div>

//         <div className="md:col-span-2">
//           <label className="block text-xs text-gray-600 mb-1">Search (product, crop, brand, field)</label>
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="e.g., DAP, maize, Yara…"
//             className="w-full border rounded-lg px-3 py-2 text-sm"
//           />
//         </div>

//         <div>
//           <label className="block text-xs text-gray-600 mb-1">Start date</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="w-full border rounded-lg px-3 py-2 text-sm"
//             max={endDate || undefined}
//           />
//         </div>

//         <div>
//           <label className="block text-xs text-gray-600 mb-1">End date</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="w-full border rounded-lg px-3 py-2 text-sm"
//             min={startDate || undefined}
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <input
//             id="showNames"
//             type="checkbox"
//             checked={showFarmerNames}
//             onChange={(e) => setShowFarmerNames(e.target.checked)}
//             className="rounded"
//           />
//           <label htmlFor="showNames" className="text-sm text-gray-700">Show farmer names</label>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex items-center gap-2">
//         <button
//           onClick={downloadPDF}
//           disabled={isGenerating || (groupBy === "product" ? rowsProduct.length === 0 : rowsSeason.length === 0)}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
//         >
//           <FiDownload />
//           {isGenerating ? "Generating…" : "Download PDF"}
//         </button>

//         <button
//           onClick={resetFilters}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//         >
//           <FiFileText /> Reset
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         {groupBy === "product" ? (
//           <table className="min-w-full text-sm border border-gray-200 rounded">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="py-2 px-3 text-left">Product</th>
//                 <th className="py-2 px-3 text-left">Type</th>
//                 <th className="py-2 px-3 text-left">Unit</th>
//                 <th className="py-2 px-3 text-left">Qty</th>
//                 <th className="py-2 px-3 text-left">Total Spent</th>
//                 <th className="py-2 px-3 text-left">Applications</th>
//                 <th className="py-2 px-3 text-left">Farmers (#)</th>
//                 {showFarmerNames && <th className="py-2 px-3 text-left">Farmers (names)</th>}
//               </tr>
//             </thead>
//             <tbody>
//               {rowsProduct.length === 0 ? (
//                 <tr>
//                   <td className="py-4 px-3 text-gray-500" colSpan={noDataColSpan}>
//                     No data for the selected filters.
//                   </td>
//                 </tr>
//               ) : (
//                 rowsProduct.map((r) => (
//                   <tr key={r.key} className="border-t align-top hover:bg-green-50 transition">
//                     <td className="py-2 px-3">{r.product}</td>
//                     <td className="py-2 px-3 capitalize">{r.input_type}</td>
//                     <td className="py-2 px-3">{r.unit || "—"}</td>
//                     <td className="py-2 px-3">{formatNum(r.totalQty)}</td>
//                     <td className="py-2 px-3">{formatMoney(r.totalCost, currency)}</td>
//                     <td className="py-2 px-3">{r.applications}</td>
//                     <td className="py-2 px-3">{r.farmers.length}</td>
//                     {showFarmerNames && (
//                       <td className="py-2 px-3">
//                         <div className="flex flex-wrap gap-1">
//                           {r.farmers.map((name, idx) => (
//                             <span
//                               key={idx}
//                               className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs"
//                             >
//                               {name}
//                             </span>
//                           ))}
//                         </div>
//                       </td>
//                     )}
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         ) : (
//           <table className="min-w-full text-sm border border-gray-200 rounded">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="py-2 px-3 text-left">Season</th>
//                 {unitsList.map((u) => (
//                   <th key={u} className="py-2 px-3 text-left">Qty ({u})</th>
//                 ))}
//                 <th className="py-2 px-3 text-left">Total Spent</th>
//                 <th className="py-2 px-3 text-left">Applications</th>
//                 <th className="py-2 px-3 text-left">Farmers (#)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rowsSeason.length === 0 ? (
//                 <tr>
//                   <td className="py-4 px-3 text-gray-500" colSpan={noDataColSpan}>
//                     No data for the selected filters.
//                   </td>
//                 </tr>
//               ) : (
//                 rowsSeason.map((r) => (
//                   <tr key={r.key} className="border-t hover:bg-green-50 transition">
//                     <td className="py-2 px-3 whitespace-nowrap">
//                       {r.season_year} {r.season_name}
//                     </td>
//                     {unitsList.map((u) => (
//                       <td key={u} className="py-2 px-3">{formatNum(r.qtyByUnit[u] || 0)}</td>
//                     ))}
//                     <td className="py-2 px-3">{formatMoney(r.totalCost, currency)}</td>
//                     <td className="py-2 px-3">{r.applications}</td>
//                     <td className="py-2 px-3">{r.farmers.length}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Footer summary (under table) */}
//       <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//         <FooterStat label="Total Spent" value={formatMoney(kpis.totalSpent, currency)} />
//         <FooterStat label="Applications" value={kpis.applications.toLocaleString()} />
//         <FooterStat label="Total Farmers Used" value={kpis.uniqFarmers.toLocaleString()} />
//         <FooterStat label="Unique Products" value={kpis.uniqProducts.toLocaleString()} />
//         <FooterStat label="Seasons Covered" value={kpis.uniqSeasons.toLocaleString()} />
//       </div>
//     </div>
//   )
// }

// /* ---- Small subcomponents ---- */
// function Kpi({ title, value }) {
//   return (
//     <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
//       <div className="text-xs text-gray-500">{title}</div>
//       <div className="text-base font-semibold text-gray-800">{value}</div>
//     </div>
//   )
// }
// function FooterStat({ label, value }) {
//   return (
//     <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
//       <div className="text-xs text-gray-500">{label}</div>
//       <div className="text-sm font-medium text-gray-800">{value}</div>
//     </div>
//   )
// }

// /* ---- Grouping helpers ---- */
// function groupByProduct(records = [], userMap) {
//   const map = new Map()
//   for (const u of records) {
//     const prod = productLabel(u)
//     const key = `${u.input_type}||${prod}||${u.unit || ""}`
//     if (!map.has(key)) {
//       map.set(key, {
//         key,
//         input_type: u.input_type,
//         product: prod,
//         unit: u.unit || "",
//         totalQty: 0,
//         totalCost: 0,
//         applications: 0,
//         farmersSet: new Set(),
//       })
//     }
//     const g = map.get(key)
//     g.totalQty += toNumber(u.quantity)
//     g.totalCost += toNumber(u.cost)
//     g.applications += 1
//     g.farmersSet.add(getFarmerName(u, userMap))
//   }

//   const rows = Array.from(map.values()).map((g) => ({
//     ...g,
//     farmers: Array.from(g.farmersSet).sort((a, b) => a.localeCompare(b)),
//   }))

//   rows.sort((a, b) => {
//     if (a.input_type !== b.input_type) return a.input_type.localeCompare(b.input_type)
//     if (a.product !== b.product) return a.product.localeCompare(b.product)
//     return (a.unit || "").localeCompare(b.unit || "")
//   })
//   return rows
// }

// function groupBySeason(records = [], unitsList = [], userMap) {
//   const map = new Map()
//   for (const u of records) {
//     const key = `${u.season_year}||${u.season_name}`
//     if (!map.has(key)) {
//       map.set(key, {
//         key,
//         season_year: u.season_year,
//         season_name: u.season_name,
//         qtyByUnit: {},
//         totalCost: 0,
//         applications: 0,
//         farmersSet: new Set(),
//       })
//     }
//     const g = map.get(key)
//     const unit = (u.unit || "").trim()
//     g.qtyByUnit[unit] = (g.qtyByUnit[unit] || 0) + toNumber(u.quantity)
//     g.totalCost += toNumber(u.cost)
//     g.applications += 1
//     g.farmersSet.add(getFarmerName(u, userMap))
//   }

//   const rows = Array.from(map.values()).map((g) => ({
//     ...g,
//     farmers: Array.from(g.farmersSet).sort((a, b) => a.localeCompare(b)),
//   }))

//   rows.sort((a, b) => {
//     if (b.season_year !== a.season_year) return b.season_year - a.season_year
//     return seasonOrder(a.season_name) - seasonOrder(b.season_name)
//   })
//   return rows
// }



"use client"

import React, { useMemo, useState } from "react"
import { FiFilter, FiDownload, FiFileText } from "react-icons/fi"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Utils
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const formatNum = (v) => toNumber(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
const formatMoney = (v, currency = "") => {
  const s = toNumber(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return currency ? `${currency} ${s}` : s
}
const pad2 = (n) => String(n).padStart(2, "0")
function parseYMD(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "")
  if (!m) return null
  const [_, y, mo, d] = m
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
}
const seasonOrder = (s) => ({ "Season A": 0, "Season B": 1, "Season C": 2 }[s] ?? 99)

// Users / names
const buildUserMap = (users = []) => {
  const pairs = []
  for (const u of users) {
    const id = u.id ?? u.user_id ?? u.farmer_user_id ?? u.pk ?? u.uid
    if (id != null) pairs.push([String(id), u])
  }
  return new Map(pairs)
}
const getFarmerId = (u) =>
  u.user_id ??
  u.farmer_user_id ??
  (typeof u.user === "object" ? u.user?.id : u.user) ??
  u.farmer_id ??
  u.farmer?.id ??
  u.owner_id ??
  null

const getFarmerName = (u, userMap) => {
  const fid = getFarmerId(u)
  const candidate = (fid != null ? userMap.get(String(fid)) : null) || null
  const fallback =
    u.farmer_name ||
    u.user_name ||
    (typeof u.user === "object" ? u.user?.username : u.username) ||
    (fid != null ? `User #${fid}` : "Unknown")
  return (
    candidate?.full_name ||
    candidate?.username ||
    candidate?.name ||
    candidate?.email ||
    fallback
  )
}

// Normalize "product name" (seed uses crop)
const productLabel = (u) =>
  (u.input_type === "seed" ? (u.crop || u.product_name) : u.product_name)?.trim() || "—"

export default function LeaderInputsReportBuilder({
  usages = [],
  users = [],
  seasons = ["Season A", "Season B", "Season C"],
  years,                  // optional: [2025, 2024, ...]
  systemName = "AIOS",
  currency = "",
  preparedBy = "",        // pass logged-in user's name
  logoPath = "/logo.png", // NEW: pass your logo path
}) {
  const userMap = useMemo(() => buildUserMap(users), [users])

  const availableYears = useMemo(() => {
    if (Array.isArray(years) && years.length) return years
    const set = new Set(usages.filter(u => u.season_year != null).map(u => Number(u.season_year)))
    return Array.from(set).sort((a, b) => b - a)
  }, [years, usages])

  // Filters
  const [groupBy, setGroupBy] = useState("product") // "product" | "season"
  const [seasonYear, setSeasonYear] = useState("")
  const [seasonName, setSeasonName] = useState("")
  const [inputType, setInputType] = useState("")
  const [query, setQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showFarmerNames, setShowFarmerNames] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // Filtered records
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sd = startDate ? new Date(`${startDate}T00:00:00Z`) : null
    const ed = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null

    return (usages || []).filter((u) => {
      if (seasonYear && String(u.season_year) !== String(seasonYear)) return false
      if (seasonName && String(u.season_name) !== String(seasonName)) return false
      if (inputType && u.input_type !== inputType) return false

      if (sd || ed) {
        const d = parseYMD(u.application_date)
        if (!d) return false
        if (sd && d < sd) return false
        if (ed && d > ed) return false
      }

      if (q) {
        const hay = [
          productLabel(u),
          u.brand,
          u.crop,
          u.field_name,
          u.input_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [usages, seasonYear, seasonName, inputType, startDate, endDate, query])

  // Dynamic units present
  const unitsList = useMemo(() => {
    const set = new Set(filtered.map((u) => (u.unit || "").trim()).filter(Boolean))
    const order = ["kg", "l", "pcs"]
    return Array.from(set).sort((a, b) => {
      const ia = order.indexOf(a), ib = order.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [filtered])

  // Grouped rows
  const rowsProduct = useMemo(() => groupByProduct(filtered, userMap), [filtered, userMap])
  const rowsSeason = useMemo(() => groupBySeason(filtered, unitsList, userMap), [filtered, unitsList, userMap])

  // KPIs
  const kpis = useMemo(() => {
    const uniqFarmers = new Set(
      filtered.map((u) => getFarmerId(u) ?? getFarmerName(u, userMap))
    ).size
    const uniqProducts = new Set(filtered.map((u) => productLabel(u))).size
    const uniqSeasons = new Set(filtered.map((u) => `${u.season_year || ""} ${u.season_name || ""}`.trim())).size
    const totalSpent = filtered.reduce((acc, u) => acc + toNumber(u.cost), 0)
    const applications = filtered.length
    return { uniqFarmers, uniqProducts, uniqSeasons, totalSpent, applications }
  }, [filtered, userMap])

  const resetFilters = () => {
    setGroupBy("product")
    setSeasonYear("")
    setSeasonName("")
    setInputType("")
    setQuery("")
    setStartDate("")
    setEndDate("")
    setShowFarmerNames(true)
  }

  // Load logo into PDF (same approach you used)
  const addLogoToPDF = async (doc, x, y, width = 50, height = 50) => {
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      return new Promise((resolve) => {
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const imgData = canvas.toDataURL("image/png")
            doc.addImage(imgData, "PNG", x, y, width, height)
          } catch (_) {}
          resolve()
        }
        img.onerror = () => resolve()
        img.src = logoPath
      })
    } catch {
      return Promise.resolve()
    }
  }

  // PDF
  const downloadPDF = async () => {
    const rows = groupBy === "product" ? rowsProduct : rowsSeason
    if (!rows.length) return
    setIsGenerating(true)
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      const marginLeft = 40
      const headerHeight = 120 // taller to fit logo + text
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      const groupPhrase = groupBy === "product" ? "Grouped by product" : "Grouped by season"
      const seasonPhrase =
        seasonYear && seasonName
          ? `for ${seasonYear} ${seasonName}`
          : seasonYear
          ? `for ${seasonYear} (all seasons)`
          : "for all seasons"
      const typePhrase = inputType ? `only ${inputType}` : "all input types"
      let datePhrase = ""
      if (startDate && endDate) datePhrase = startDate === endDate ? `on ${startDate}` : `from ${startDate} to ${endDate}`
      else if (startDate) datePhrase = `from ${startDate}`
      else if (endDate) datePhrase = `up to ${endDate}`
      else datePhrase = "for all dates"
      const qPhrase = query ? `matching "${query}"` : "no text filter"
      const filtersLine = `${groupPhrase} ${seasonPhrase}, ${typePhrase}, ${datePhrase}, ${qPhrase}`

      // Build main table
      let columns = []
      let body = []
      if (groupBy === "product") {
        columns = [
          { header: "Product", dataKey: "product" },
          { header: "Type", dataKey: "type" },
          { header: "Unit", dataKey: "unit" },
          { header: "Qty", dataKey: "qty" },
          { header: "Total Spent", dataKey: "spent" },
          { header: "Applications", dataKey: "apps" },
          { header: "Farmers (#)", dataKey: "farmerCount" },
        ]
        if (showFarmerNames) columns.push({ header: "Farmers (names)", dataKey: "farmers" })
        body = rows.map((r) => ({
          product: r.product,
          type: r.input_type,
          unit: r.unit,
          qty: formatNum(r.totalQty),
          spent: formatMoney(r.totalCost, currency),
          apps: r.applications,
          farmerCount: r.farmers.length,
          ...(showFarmerNames ? { farmers: r.farmers.join(", ") } : {}),
        }))
      } else {
        columns = [
          { header: "Season", dataKey: "season" },
          ...unitsList.map((u) => ({ header: `Qty (${u})`, dataKey: `qty_${u}` })),
          { header: "Total Spent", dataKey: "spent" },
          { header: "Applications", dataKey: "apps" },
          { header: "Farmers (#)", dataKey: "farmerCount" },
        ]
        body = rows.map((r) => {
          const base = {
            season: `${r.season_year} ${r.season_name}`,
            spent: formatMoney(r.totalCost, currency),
            apps: r.applications,
            farmerCount: r.farmers.length,
          }
          for (const u of unitsList) base[`qty_${u}`] = formatNum(r.qtyByUnit[u] || 0)
          return base
        })
      }

      doc.setProperties({
        title: `${systemName} — Inputs Usage Report`,
        subject: "Inputs usage report (leader)",
        creator: systemName,
        author: preparedBy || undefined,
      })

      autoTable(doc, {
        columns,
        body,
        startY: headerHeight,
        margin: { top: headerHeight + 10, bottom: 60, left: marginLeft, right: marginLeft },
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [34, 197, 94] },
        didDrawPage: async (data) => {
          // Logo
          const isFirst = data.pageNumber === 1
          const logoW = isFirst ? 50 : 40
          const logoH = isFirst ? 50 : 40
          await addLogoToPDF(doc, marginLeft, 20, logoW, logoH)

          // Text to the right of logo
          const textStartX = marginLeft + logoW + 15
          doc.setDrawColor(230)
          doc.line(marginLeft, headerHeight - 12, pageWidth - marginLeft, headerHeight - 12)

          doc.setTextColor(40)
          doc.setFontSize(14)
          doc.text(systemName || "Inputs Usage Report", textStartX, 38)

          doc.setFontSize(10)
          doc.text(`Generated: ${new Date().toLocaleString()}`, textStartX, 55)
          doc.text(`Prepared by: ${preparedBy || "—"}`, textStartX, 69)

          // Filters (wrap to available width)
          const availableWidth = pageWidth - textStartX - marginLeft
          const wrapped = doc.splitTextToSize(filtersLine, availableWidth)
          doc.text(wrapped, textStartX, 87)

          // Footer
          doc.setFontSize(9)
          doc.setTextColor(120)
          doc.text(`Page ${data.pageNumber}`, pageWidth - marginLeft - 40, pageHeight - 20)
        },
      })

      // Summary after table
      const finalY = (doc.lastAutoTable?.finalY || headerHeight) + 16
      const summaryLines = [
        `Summary:`,
        `- Total spent: ${formatMoney(kpis.totalSpent, currency)}`,
        `- Applications: ${kpis.applications}`,
        `- Unique farmers: ${kpis.uniqFarmers}`,
        `- Unique products: ${kpis.uniqProducts}`,
        `- Seasons covered: ${kpis.uniqSeasons}`,
      ]
      if (finalY + summaryLines.length * 14 > pageHeight - 40) {
        doc.addPage()
      }
      const y = Math.max(finalY, pageHeight - Math.max(120, summaryLines.length * 14 + 40))
      doc.setFontSize(11)
      doc.setTextColor(40)
      doc.text(summaryLines, marginLeft, y)

      const yr = seasonYear || "ALL"
      const sn = seasonName ? seasonName.replace(/\s+/g, "") : "ALL"
      const gb = groupBy === "product" ? "ByProduct" : "BySeason"
      const sd = startDate ? startDate.replace(/-/g, "") : "ALL"
      const ed = endDate ? endDate.replace(/-/g, "") : "ALL"
      const it = inputType ? inputType.toUpperCase() : "ALL"
      const fileName = `${systemName}_Inputs_${gb}_${yr}_${sn}_${it}_${sd}_${ed}.pdf`
      doc.save(fileName)
    } finally {
      setIsGenerating(false)
    }
  }

  // No data colSpan
  const noDataColSpan =
    groupBy === "product"
      ? 7 + (showFarmerNames ? 1 : 0)
      : 4 + unitsList.length

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      {/* Title + counters with logo + Prepared by */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoPath}
            alt={`${systemName} Logo`}
            className="w-8 h-8 object-contain"
            onError={(e) => { e.currentTarget.style.display = "none" }}
          />
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FiFilter /> Leaders Inputs Report
            </h3>
            <div className="text-xs text-gray-500 mt-0.5">
              Prepared by: {preparedBy || "—"}
            </div>
          </div>
        </div>
        <div className="text-xs md:text-sm text-gray-500">
          Records: <span className="font-medium text-gray-700">{filtered.length}</span>
        </div>
      </div>

      {/* 5 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi title="Total Spent" value={formatMoney(kpis.totalSpent, currency)} />
        <Kpi title="Applications" value={kpis.applications.toLocaleString()} />
        <Kpi title="Unique Farmers" value={kpis.uniqFarmers.toLocaleString()} />
        <Kpi title="Unique Products" value={kpis.uniqProducts.toLocaleString()} />
        <Kpi title="Seasons Covered" value={kpis.uniqSeasons.toLocaleString()} />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Group by</label>
          <div className="bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setGroupBy("product")}
              className={`px-3 py-1 rounded-md text-sm ${groupBy === "product" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Product
            </button>
            <button
              onClick={() => setGroupBy("season")}
              className={`px-3 py-1 rounded-md text-sm ${groupBy === "season" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Season
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Season year</label>
          <select
            value={seasonYear}
            onChange={(e) => setSeasonYear(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Season name</label>
          <select
            value={seasonName}
            onChange={(e) => setSeasonName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {seasons.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Input type</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="pesticide">Pesticide</option>
            <option value="seed">Seed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Search (product, crop, brand, field)</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., DAP, maize, Yara…"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            max={endDate || undefined}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            min={startDate || undefined}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="showNames"
            type="checkbox"
            checked={showFarmerNames}
            onChange={(e) => setShowFarmerNames(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="showNames" className="text-sm text-gray-700">Show farmer names</label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={downloadPDF}
          disabled={isGenerating || (groupBy === "product" ? rowsProduct.length === 0 : rowsSeason.length === 0)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <FiDownload />
          {isGenerating ? "Generating…" : "Download PDF"}
        </button>

        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <FiFileText /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {groupBy === "product" ? (
          <table className="min-w-full text-sm border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left">Product</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-left">Unit</th>
                <th className="py-2 px-3 text-left">Qty</th>
                <th className="py-2 px-3 text-left">Total Spent</th>
                <th className="py-2 px-3 text-left">Applications</th>
                <th className="py-2 px-3 text-left">Farmers (#)</th>
                {showFarmerNames && <th className="py-2 px-3 text-left">Farmers (names)</th>}
              </tr>
            </thead>
            <tbody>
              {rowsProduct.length === 0 ? (
                <tr>
                  <td className="py-4 px-3 text-gray-500" colSpan={noDataColSpan}>
                    No data for the selected filters.
                  </td>
                </tr>
              ) : (
                rowsProduct.map((r) => (
                  <tr key={r.key} className="border-t align-top hover:bg-green-50 transition">
                    <td className="py-2 px-3">{r.product}</td>
                    <td className="py-2 px-3 capitalize">{r.input_type}</td>
                    <td className="py-2 px-3">{r.unit || "—"}</td>
                    <td className="py-2 px-3">{formatNum(r.totalQty)}</td>
                    <td className="py-2 px-3">{formatMoney(r.totalCost, currency)}</td>
                    <td className="py-2 px-3">{r.applications}</td>
                    <td className="py-2 px-3">{r.farmers.length}</td>
                    {showFarmerNames && (
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {r.farmers.map((name, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full text-sm border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left">Season</th>
                {unitsList.map((u) => (
                  <th key={u} className="py-2 px-3 text-left">Qty ({u})</th>
                ))}
                <th className="py-2 px-3 text-left">Total Spent</th>
                <th className="py-2 px-3 text-left">Applications</th>
                <th className="py-2 px-3 text-left">Farmers (#)</th>
              </tr>
            </thead>
            <tbody>
              {rowsSeason.length === 0 ? (
                <tr>
                  <td className="py-4 px-3 text-gray-500" colSpan={noDataColSpan}>
                    No data for the selected filters.
                  </td>
                </tr>
              ) : (
                rowsSeason.map((r) => (
                  <tr key={r.key} className="border-t hover:bg-green-50 transition">
                    <td className="py-2 px-3 whitespace-nowrap">
                      {r.season_year} {r.season_name}
                    </td>
                    {unitsList.map((u) => (
                      <td key={u} className="py-2 px-3">{formatNum(r.qtyByUnit[u] || 0)}</td>
                    ))}
                    <td className="py-2 px-3">{formatMoney(r.totalCost, currency)}</td>
                    <td className="py-2 px-3">{r.applications}</td>
                    <td className="py-2 px-3">{r.farmers.length}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer summary */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <FooterStat label="Total Spent" value={formatMoney(kpis.totalSpent, currency)} />
        <FooterStat label="Applications" value={kpis.applications.toLocaleString()} />
        <FooterStat label="Total Farmers Used" value={kpis.uniqFarmers.toLocaleString()} />
        <FooterStat label="Unique Products" value={kpis.uniqProducts.toLocaleString()} />
        <FooterStat label="Seasons Covered" value={kpis.uniqSeasons.toLocaleString()} />
      </div>
    </div>
  )
}

/* ---- Small subcomponents ---- */
function Kpi({ title, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-base font-semibold text-gray-800">{value}</div>
    </div>
  )
}
function FooterStat({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </div>
  )
}

/* ---- Grouping helpers ---- */
function groupByProduct(records = [], userMap) {
  const map = new Map()
  for (const u of records) {
    const prod = productLabel(u)
    const key = `${u.input_type}||${prod}||${u.unit || ""}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        input_type: u.input_type,
        product: prod,
        unit: u.unit || "",
        totalQty: 0,
        totalCost: 0,
        applications: 0,
        farmersSet: new Set(),
      })
    }
    const g = map.get(key)
    g.totalQty += toNumber(u.quantity)
    g.totalCost += toNumber(u.cost)
    g.applications += 1
    g.farmersSet.add(getFarmerName(u, userMap))
  }

  const rows = Array.from(map.values()).map((g) => ({
    ...g,
    farmers: Array.from(g.farmersSet).sort((a, b) => a.localeCompare(b)),
  }))

  rows.sort((a, b) => {
    if (a.input_type !== b.input_type) return a.input_type.localeCompare(b.input_type)
    if (a.product !== b.product) return a.product.localeCompare(b.product)
    return (a.unit || "").localeCompare(b.unit || "")
  })
  return rows
}

function groupBySeason(records = [], unitsList = [], userMap) {
  const map = new Map()
  for (const u of records) {
    const key = `${u.season_year}||${u.season_name}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        season_year: u.season_year,
        season_name: u.season_name,
        qtyByUnit: {},
        totalCost: 0,
        applications: 0,
        farmersSet: new Set(),
      })
    }
    const g = map.get(key)
    const unit = (u.unit || "").trim()
    g.qtyByUnit[unit] = (g.qtyByUnit[unit] || 0) + toNumber(u.quantity)
    g.totalCost += toNumber(u.cost)
    g.applications += 1
    g.farmersSet.add(getFarmerName(u, userMap))
  }

  const rows = Array.from(map.values()).map((g) => ({
    ...g,
    farmers: Array.from(g.farmersSet).sort((a, b) => a.localeCompare(b)),
  }))

  rows.sort((a, b) => {
    if (b.season_year !== a.season_year) return b.season_year - a.season_year
    return seasonOrder(a.season_name) - seasonOrder(b.season_name)
  })
  return rows
}