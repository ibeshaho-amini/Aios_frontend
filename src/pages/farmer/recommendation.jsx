

// "use client"

// import { useState, useEffect } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import {
//   createFullRecommendation,
//   createCropOnlyRecommendation,
//   clearRecommendationState,
//   fetchFertilizerByCrop,
// } from "../../Redux/Recommen  dation/cropRecommendation"
// import {
//   FiDroplet,
//   FiThermometer,
//   FiCloud,
//   FiTrendingUp,
//   FiFeather,
//   FiBarChart2,
//   FiCheckCircle,
//   FiAlertCircle,
//   FiRefreshCw,
//   FiSun,
//   FiCloudRain,
//   FiSearch,
//   FiCalendar,
//   FiInfo,
// } from "react-icons/fi"

// const FertilizerInfoCard = ({ data, crop }) => {
//   if (!data || Object.keys(data).length === 0) {
//     return null
//   }

//   return (
//     <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
//       <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
//         <FiTrendingUp className="text-blue-600" />
//         Fertilizer Plan for <span className="capitalize text-green-600">{crop}</span>
//       </h3>

//       {/* NPK Recommendation */}
//       {data.npk_kg_per_ha && (
//         <div className="mb-6">
//           <div className="flex items-center gap-2 mb-3">
//             <FiBarChart2 className="text-green-600" />
//             <span className="font-semibold text-gray-700">Recommended NPK per Hectare:</span>
//           </div>
//           <div className="grid grid-cols-3 gap-4">
//             <div className="bg-green-50 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-green-700">{data.npk_kg_per_ha.N}</div>
//               <div className="text-sm text-green-600">Nitrogen (N) kg</div>
//             </div>
//             <div className="bg-blue-50 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-blue-700">{data.npk_kg_per_ha.P}</div>
//               <div className="text-sm text-blue-600">Phosphorus (P) kg</div>
//             </div>
//             <div className="bg-purple-50 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-purple-700">{data.npk_kg_per_ha.K}</div>
//               <div className="text-sm text-purple-600">Potassium (K) kg</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Fertilizer Types */}
//       {data.fertilizers && data.fertilizers.length > 0 && (
//         <div className="mb-6">
//           <div className="flex items-center gap-2 mb-3">
//             <FiDroplet className="text-blue-600" />
//             <span className="font-semibold text-gray-700">Recommended Fertilizers:</span>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {data.fertilizers.map((fertilizer, index) => (
//               <span
//                 key={index}
//                 className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
//               >
//                 {fertilizer}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Application Schedule */}
//       {data.application_schedule && data.application_schedule.length > 0 && (
//         <div className="mb-6">
//           <div className="flex items-center gap-2 mb-3">
//             <FiCalendar className="text-orange-600" />
//             <span className="font-semibold text-gray-700">Application Schedule:</span>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Stage</th>
//                   <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Method</th>
//                   <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Dose</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.application_schedule.map((schedule, index) => (
//                   <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                     <td className="py-3 px-4 text-sm text-gray-800 border-b">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                         {schedule.stage}
//                       </div>
//                     </td>
//                     <td className="py-3 px-4 text-sm text-gray-600 border-b">{schedule.method}</td>
//                     <td className="py-3 px-4 text-sm font-medium text-gray-800 border-b">{schedule.dose}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Source */}
//       {data.source && (
//         <div className="mt-4 pt-4 border-t border-gray-100">
//           <div className="flex items-center gap-2 text-sm text-gray-500">
//             <FiInfo className="w-4 h-4" />
//             <span>Source: {data.source}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// const PredictionForm = () => {
//   const dispatch = useDispatch()
//   const { isLoading, fullRecommendation, cropOnlyRecommendation, error, success, fertilizerData } = useSelector(
//     (state) => state.recommendation,
//   )

//   const [formData, setFormData] = useState({
//     soil_type: "",
//     nitrogen: "",
//     phosphorous: "",
//     potassium: "",
//     ph_value: "",
//     temperature: "",
//     rainfall: "",
//     humidity: "",
//     moisture: "",
//   })

//   const [activeTab, setActiveTab] = useState("form")
//   const [formErrors, setFormErrors] = useState({})

//   // New state for fertilizer info tab
//   const [fertilizerCrop, setFertilizerCrop] = useState("")
//   const [fertilizerError, setFertilizerError] = useState(null)
//   const [fertilizerLoading, setFertilizerLoading] = useState(false)

//   // Debug logging
//   useEffect(() => {
//     console.log("Fertilizer data updated:", fertilizerData)
//   }, [fertilizerData])

//   // Fetch fertilizer when crop is available from recommendations
//   useEffect(() => {
//     const crop =
//       fullRecommendation?.crop_predicted ||
//       fullRecommendation?.recommended_crop ||
//       cropOnlyRecommendation?.crop_predicted ||
//       cropOnlyRecommendation?.recommended_crop

//     if (crop) {
//       console.log("Auto-fetching fertilizer data for crop:", crop)
//       dispatch(fetchFertilizerByCrop(crop))
//     }
//   }, [fullRecommendation, cropOnlyRecommendation, dispatch])

//   // Auto-switch to results tab when we get data or errors
//   useEffect(() => {
//     if (fullRecommendation || cropOnlyRecommendation || error) {
//       setActiveTab("results")
//     }
//   }, [fullRecommendation, cropOnlyRecommendation, error])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//     if (formErrors[name]) {
//       setFormErrors((prev) => ({ ...prev, [name]: "" }))
//     }
//   }

//   // Form validation
//   const validateForm = () => {
//     const errors = {}
//     const requiredFields = [
//       "soil_type",
//       "nitrogen",
//       "phosphorous",
//       "potassium",
//       "ph_value",
//       "temperature",
//       "rainfall",
//       "humidity",
//       "moisture",
//     ]

//     requiredFields.forEach((field) => {
//       if (!formData[field] || formData[field].toString().trim() === "") {
//         errors[field] = "This field is required"
//       }
//     })

//     if (formData.ph_value && (Number.parseFloat(formData.ph_value) < 0 || Number.parseFloat(formData.ph_value) > 14)) {
//       errors.ph_value = "pH value must be between 0 and 14"
//     }

//     if (formData.humidity && (Number.parseFloat(formData.humidity) < 0 || Number.parseFloat(formData.humidity) > 100)) {
//       errors.humidity = "Humidity must be between 0 and 100%"
//     }

//     if (formData.moisture && (Number.parseFloat(formData.moisture) < 0 || Number.parseFloat(formData.moisture) > 100)) {
//       errors.moisture = "Moisture must be between 0 and 100%"
//     }

//     if (formData.temperature && Number.parseFloat(formData.temperature) < -50) {
//       errors.temperature = "Temperature seems too low"
//     }

//     setFormErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleFullSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) return
//     try {
//       await dispatch(createFullRecommendation(formData))
//     } catch (error) {
//       console.error("Full recommendation error:", error)
//     }
//   }

//   const handleCropOnlySubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) return
//     try {
//       await dispatch(createCropOnlyRecommendation(formData))
//     } catch (error) {
//       console.error("Crop-only recommendation error:", error)
//     }
//   }

//   const clearResults = () => {
//     dispatch(clearRecommendationState())
//     setActiveTab("form")
//     setFertilizerCrop("")
//     setFertilizerError(null)
//   }

//   // Handle fertilizer info fetch for any crop
//   const handleFertilizerFetch = async (e) => {
//     e.preventDefault()
//     setFertilizerError(null)

//     if (!fertilizerCrop.trim()) {
//       setFertilizerError("Please enter a crop name.")
//       return
//     }

//     setFertilizerLoading(true)
//     console.log("Fetching fertilizer data for:", fertilizerCrop.trim())

//     try {
//       await dispatch(fetchFertilizerByCrop(fertilizerCrop.trim()))
//     } catch (err) {
//       console.error("Fertilizer fetch error:", err)
//       setFertilizerError("Could not fetch fertilizer info.")
//     } finally {
//       setFertilizerLoading(false)
//     }
//   }

//   const soilTypes = ["Sandy", "Clay", "Loamy", "Silt", "Peaty", "Chalky"]

//   const InputField = ({ icon, label, name, type = "text", placeholder, options = null, min, max, step }) => (
//     <div className="space-y-2">
//       <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
//         <span className="text-green-600">{icon}</span>
//         {label}
//       </label>
//       {options ? (
//         <select
//           name={name}
//           value={formData[name]}
//           onChange={handleChange}
//           className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
//             formErrors[name] ? "border-red-300" : "border-gray-200"
//           }`}
//         >
//           <option value="">{placeholder}</option>
//           {options.map((option) => (
//             <option key={option} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//       ) : (
//         <input
//           type={type}
//           name={name}
//           value={formData[name]}
//           onChange={handleChange}
//           placeholder={placeholder}
//           min={min}
//           max={max}
//           step={step}
//           className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
//             formErrors[name] ? "border-red-300" : "border-gray-200"
//           }`}
//         />
//       )}
//       {formErrors[name] && (
//         <p className="text-sm text-red-600 flex items-center gap-1">
//           <FiAlertCircle className="w-4 h-4" />
//           {formErrors[name]}
//         </p>
//       )}
//     </div>
//   )

//   const RecommendationCard = ({ title, data, icon, color = "green" }) => (
//     <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
//       <div className="flex items-center gap-3 mb-4">
//         <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
//           <span className={`text-${color}-600 text-xl`}>{icon}</span>
//         </div>
//         <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//       </div>

//       {(data.crop_predicted || data.recommended_crop) && (
//         <div className="mb-4">
//           <div className="flex items-center gap-2 mb-2">
//             <FiFeather className="text-green-600" />
//             <span className="font-medium text-gray-700">Recommended Crop</span>
//           </div>
//           <div className="bg-green-50 rounded-lg p-3">
//             <span className="text-2xl font-bold text-green-700">{data.crop_predicted || data.recommended_crop}</span>
//           </div>
//         </div>
//       )}

         

//       {data.disease_prediction && (
//         <div className="mb-4">
//           <div className="flex items-center gap-2 mb-2">
//             <FiAlertCircle className="text-orange-600" />
//             <span className="font-medium text-gray-700">Disease Prediction</span>
//           </div>
//           <div className="bg-orange-50 rounded-lg p-3">
//             <span className="text-lg font-semibold text-orange-700">{data.disease_prediction}</span>
//           </div>
//         </div>
//       )}

//       {data.yield_prediction && (
//         <div className="mb-4">
//           <div className="flex items-center gap-2 mb-2">
//             <FiBarChart2 className="text-purple-600" />
//             <span className="font-medium text-gray-700">Yield Prediction</span>
//           </div>
//           <div className="bg-purple-50 rounded-lg p-3">
//             <span className="text-lg font-semibold text-purple-700">{data.yield_prediction}</span>
//           </div>
//         </div>
//       )}

//       <div className="mt-4 pt-4 border-t border-gray-100">
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           {data.status && (
//             <div>
//               <span className="text-gray-600">Status:</span>
//               <div className="flex items-center gap-1 mt-1">
//                 <div
//                   className={`w-2 h-2 rounded-full ${
//                     data.status === "Completed"
//                       ? "bg-green-500"
//                       : data.status === "Pending"
//                         ? "bg-yellow-500"
//                         : "bg-gray-500"
//                   }`}
//                 ></div>
//                 <span className="font-medium text-gray-700">{data.status}</span>
//               </div>
//             </div>
//           )}

//           {data.timestamp && (
//             <div>
//               <span className="text-gray-600">Generated:</span>
//               <p className="font-medium text-gray-700 mt-1">{new Date(data.timestamp).toLocaleDateString()}</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="mt-4 pt-4 border-t border-gray-100">
//         <h4 className="text-sm font-medium text-gray-700 mb-2">Input Parameters:</h4>
//         <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
//           {data.soil_type && data.soil_type !== "Unknown" && (
//             <div>
//               Soil: <span className="font-medium">{data.soil_type}</span>
//             </div>
//           )}
//           {data.temperature && (
//             <div>
//               Temp: <span className="font-medium">{data.temperature}°C</span>
//             </div>
//           )}
//           {data.nitrogen && (
//             <div>
//               N: <span className="font-medium">{data.nitrogen}</span>
//             </div>
//           )}
//           {data.phosphorous && (
//             <div>
//               P: <span className="font-medium">{data.phosphorous}</span>
//             </div>
//           )}
//           {data.potassium && (
//             <div>
//               K: <span className="font-medium">{data.potassium}</span>
//             </div>
//           )}
//           {data.humidity > 0 && (
//             <div>
//               Humidity: <span className="font-medium">{data.humidity}%</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {(data.confidence_score || data.confidence) && (
//         <div className="mt-4 pt-4 border-t border-gray-100">
//           <div className="flex items-center justify-between">
//             <span className="text-sm text-gray-600">Confidence Score</span>
//             <div className="flex items-center gap-2">
//               <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full bg-${color}-500 transition-all duration-500`}
//                   style={{ width: `${data.confidence_score || data.confidence || 85}%` }}
//                 ></div>
//               </div>
//               <span className="text-sm font-medium text-gray-700">
//                 {data.confidence_score || data.confidence || 85}%
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800 mb-2">Crop Recommendation System</h1>
//             <p className="text-gray-600">
//               Get AI-powered recommendations for your farm based on soil and weather conditions
//             </p>
//           </div>
//           <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
//             <FiFeather className="text-green-600 text-2xl" />
//           </div>
//         </div>
//       </div>

//       {/* Tab Navigation */}
//       <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
//         <div className="flex border-b border-gray-100">
//           <button
//             onClick={() => setActiveTab("form")}
//             className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
//               activeTab === "form"
//                 ? "text-green-600 border-b-2 border-green-600 bg-green-50"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Input Parameters
//           </button>
//           <button
//             onClick={() => setActiveTab("results")}
//             className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
//               activeTab === "results"
//                 ? "text-green-600 border-b-2 border-green-600 bg-green-50"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Recommendations
//           </button>
//           <button
//             onClick={() => setActiveTab("fertilizer")}
//             className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
//               activeTab === "fertilizer"
//                 ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Fertilizer Guide
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Form Tab */}
//           {activeTab === "form" && (
//             <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
//               {/* Soil Parameters */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <FiDroplet className="text-blue-600" />
//                   Soil Parameters
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <InputField
//                     icon={<FiDroplet />}
//                     label="Soil Type"
//                     name="soil_type"
//                     placeholder="Select soil type"
//                     options={soilTypes}
//                   />
//                   <InputField
//                     icon={<FiTrendingUp />}
//                     label="pH Value"
//                     name="ph_value"
//                     type="number"
//                     placeholder="6.5"
//                     min="0"
//                     max="14"
//                     step="0.1"
//                   />
//                   <InputField
//                     icon={<FiBarChart2 />}
//                     label="Nitrogen (N) mg/kg"
//                     name="nitrogen"
//                     type="number"
//                     placeholder="40"
//                     min="0"
//                   />
//                   <InputField
//                     icon={<FiBarChart2 />}
//                     label="Phosphorous (P) mg/kg"
//                     name="phosphorous"
//                     type="number"
//                     placeholder="30"
//                     min="0"
//                   />
//                   <InputField
//                     icon={<FiBarChart2 />}
//                     label="Potassium (K) mg/kg"
//                     name="potassium"
//                     type="number"
//                     placeholder="20"
//                     min="0"
//                   />
//                   <InputField
//                     icon={<FiDroplet />}
//                     label="Soil Moisture (%)"
//                     name="moisture"
//                     type="number"
//                     placeholder="65"
//                     min="0"
//                     max="100"
//                   />
//                 </div>
//               </div>

//               {/* Weather Parameters */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <FiSun className="text-yellow-600" />
//                   Weather Conditions
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <InputField
//                     icon={<FiThermometer />}
//                     label="Temperature (°C)"
//                     name="temperature"
//                     type="number"
//                     placeholder="25"
//                     min="-50"
//                     max="60"
//                   />
//                   <InputField
//                     icon={<FiCloudRain />}
//                     label="Rainfall (mm)"
//                     name="rainfall"
//                     type="number"
//                     placeholder="150"
//                     min="0"
//                   />
//                   <InputField
//                     icon={<FiCloud />}
//                     label="Humidity (%)"
//                     name="humidity"
//                     type="number"
//                     placeholder="70"
//                     min="0"
//                     max="100"
//                   />
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
//                 <button
//                   type="button"
//                   onClick={handleFullSubmit}
//                   disabled={isLoading}
//                   className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />}
//                   {isLoading ? "Analyzing..." : "Get Full Recommendation"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleCropOnlySubmit}
//                   disabled={isLoading}
//                   className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiFeather />}
//                   {isLoading ? "Analyzing..." : "Get Crop Recommendation"}
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* Results Tab */}
//           {activeTab === "results" && (
//             <div className="space-y-6">
//               {/* Status Messages */}
//               {isLoading && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
//                   <FiRefreshCw className="text-yellow-600 animate-spin" />
//                   <span className="text-yellow-700">Analyzing your farm data...</span>
//                 </div>
//               )}

//               {success && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
//                   <FiCheckCircle className="text-green-600" />
//                   <span className="text-green-700">{success}</span>
//                 </div>
//               )}

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
//                   <FiAlertCircle className="text-red-600" />
//                   <span className="text-red-700">
//                     {typeof error === "string" ? error : error.detail || error.message || "Something went wrong."}
//                   </span>
//                 </div>
//               )}

//               {/* Results */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {fullRecommendation && (
//                   <RecommendationCard
//                     title="Complete Farm Analysis"
//                     data={fullRecommendation}
//                     icon={<FiBarChart2 />}
//                     color="green"
//                   />
//                 )}

//                 {cropOnlyRecommendation && (
//                   <RecommendationCard
//                     title="Crop Recommendation"
//                     data={cropOnlyRecommendation}
//                     icon={<FiFeather />}
//                     color="blue"
//                   />
//                 )}
//               </div>

//               {/* Auto-fetched Fertilizer Recommendation */}
//               {/* {fertilizerData && Object.keys(fertilizerData).length > 0 && (
//                 <div className="mt-6">
//                   <FertilizerInfoCard
//                     data={fertilizerData}
//                     crop={
//                       fullRecommendation?.crop_predicted ||
//                       fullRecommendation?.recommended_crop ||
//                       cropOnlyRecommendation?.crop_predicted ||
//                       cropOnlyRecommendation?.recommended_crop ||
//                       "Selected Crop"
//                     }
//                   />
//                 </div>
//               )} */}

//               {/* Action Buttons */}
//               {(fullRecommendation || cropOnlyRecommendation) && (
//                 <div className="flex justify-center pt-6 border-t border-gray-100">
//                   <button
//                     onClick={clearResults}
//                     className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
//                   >
//                     <FiRefreshCw />
//                     New Analysis
//                   </button>
//                 </div>
//               )}

//               {/* Empty State */}
//               {!isLoading && !fullRecommendation && !cropOnlyRecommendation && !error && (
//                 <div className="text-center py-12">
//                   <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <FiFeather className="text-gray-400 text-3xl" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-600 mb-2">No recommendations yet</h3>
//                   <p className="text-gray-500 mb-4">Fill out the form to get AI-powered crop recommendations</p>
//                   <button
//                     onClick={() => setActiveTab("form")}
//                     className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
//                   >
//                     Start Analysis
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Fertilizer Info Tab */}
//           {activeTab === "fertilizer" && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 rounded-lg p-4">
//                 <h3 className="font-semibold text-blue-800 mb-2">Get Fertilizer Information</h3>
//                 <p className="text-sm text-blue-600 mb-4">
//                   Enter any crop name to get detailed fertilizer recommendations, NPK requirements, and application
//                   schedules.
//                 </p>
//               </div>

//               <form className="flex flex-col sm:flex-row gap-4 items-end" onSubmit={handleFertilizerFetch}>
//                 <div className="flex-1">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name</label>
//                   <input
//                     type="text"
//                     value={fertilizerCrop}
//                     onChange={(e) => setFertilizerCrop(e.target.value)}
//                     placeholder="Enter crop name (e.g., Rice, Wheat, Corn)"
//                     className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={fertilizerLoading}
//                   className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
//                 >
//                   {fertilizerLoading ? <FiRefreshCw className="animate-spin" /> : <FiSearch />}
//                   {fertilizerLoading ? "Searching..." : "Get Fertilizer Info"}
//                 </button>
//               </form>

//               {fertilizerError && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
//                   <FiAlertCircle className="text-red-600" />
//                   <span className="text-red-700">{fertilizerError}</span>
//                 </div>
//               )}

//               {/* Loading state */}
//               {fertilizerLoading && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
//                   <FiRefreshCw className="text-yellow-600 animate-spin" />
//                   <span className="text-yellow-700">Fetching fertilizer information...</span>
//                 </div>
//               )}

//               {/* Show the fertilizer info card */}
//               {fertilizerData && Object.keys(fertilizerData).length > 0 && !fertilizerLoading && (
//                 <FertilizerInfoCard data={fertilizerData} crop={fertilizerCrop} />
//               )}

//               {/* Empty state for fertilizer tab */}
//               {!fertilizerData && !fertilizerLoading && !fertilizerError && (
//                 <div className="text-center py-12">
//                   <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <FiTrendingUp className="text-gray-400 text-3xl" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-600 mb-2">No fertilizer data yet</h3>
//                   <p className="text-gray-500">Enter a crop name above to get detailed fertilizer recommendations</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Debug Section - Remove in production */}
//       {/* {process.env.NODE_ENV === "development" && fertilizerData && (
//         // <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//         //   <h4 className="text-sm font-medium text-gray-700 mb-2">Debug - Fertilizer API Response:</h4>
//         //   <pre className="text-xs text-gray-600 overflow-auto max-h-40">{JSON.stringify(fertilizerData, null, 2)}</pre>
//         // </div>
//       )} */}
//     </div>
//   )
// }

// export default PredictionForm
"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  createCropOnlyRecommendation,
  createFullRecommendation,
  submitRecommendation,
  clearRecommendationState,
} from "../../Redux/Recommendation/cropRecommendation"

import {
  FiCheckCircle,
  FiFeather,
  FiRefreshCw,
  FiAlertCircle,
  FiSend,
} from "react-icons/fi"

const PredictionForm = () => {
  const dispatch = useDispatch()
  const {
    isLoading,
    fullRecommendation,
    cropOnlyRecommendation,
    error,
    success,
  } = useSelector((state) => state.recommendation)

  const [formData, setFormData] = useState({
    soil_type: "",
    nitrogen: "",
    phosphorous: "",
    potassium: "",
    ph_value: "",
    temperature: "",
    humidity: "",
    rainfall: "",
    moisture: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [activeTab, setActiveTab] = useState("form")
  const [submissionMessage, setSubmissionMessage] = useState("")

  const extractCrop = (data) =>
    data?.crop_predicted || data?.recommended_crop || ""

  const validateForm = () => {
    const requiredFields = [
      "soil_type",
      "nitrogen",
      "phosphorous",
      "potassium",
      "ph_value",
      "temperature",
      "humidity",
      "rainfall",
      "moisture",
    ]
    const errors = {}

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "Required"
      }
    })

    if (formData.ph_value < 0 || formData.ph_value > 14)
      errors.ph_value = "pH must be between 0 and 14"
    if (formData.humidity < 0 || formData.humidity > 100)
      errors.humidity = "Humidity must be between 0–100%"
    if (formData.moisture < 0 || formData.moisture > 100)
      errors.moisture = "Moisture must be between 0–100%"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmitToAgronomist = async (recommendation) => {
    const payload = {
      ...formData,
      crop_predicted: extractCrop(recommendation),
      farmer_inputs: formData,
      ai_outputs: {
        crop_predicted: extractCrop(recommendation),
        confidence: recommendation.confidence || recommendation.confidence_score || null,
        yield_prediction: recommendation.yield_prediction || null,
        disease_prediction: recommendation.disease_prediction || null,
        fertilizer_predicted: recommendation.fertilizer_predicted || null,
      },
    }

    console.log("🛰️ Submitting to backend", payload)

    try {
      await dispatch(submitRecommendation(payload)).unwrap()
      setSubmissionMessage("✅ Recommendation submitted to agronomist.")
    } catch (err) {
      console.error("Submission error:", err)
      setSubmissionMessage("❌ Submission failed.")
    }
  }

  const handleFullSubmit = async (e) => {
    e.preventDefault()
    setSubmissionMessage("")
    if (!validateForm()) return

    const result = await dispatch(createFullRecommendation(formData))
    const prediction = result.payload
    if (prediction) {
      await handleSubmitToAgronomist(prediction)
    }
  }

  const handleCropOnlySubmit = async (e) => {
    e.preventDefault()
    setSubmissionMessage("")
    if (!validateForm()) return

    const result = await dispatch(createCropOnlyRecommendation(formData))
    const prediction = result.payload
    if (prediction) {
      await handleSubmitToAgronomist(prediction)
    }
  }

  const handleReset = () => {
    dispatch(clearRecommendationState())
    setFormData({
      soil_type: "",
      nitrogen: "",
      phosphorous: "",
      potassium: "",
      ph_value: "",
      temperature: "",
      humidity: "",
      rainfall: "",
      moisture: "",
    })
    setFormErrors({})
    setSubmissionMessage("")
    setActiveTab("form")
  }

  useEffect(() => {
    if (fullRecommendation || cropOnlyRecommendation || error) {
      setActiveTab("results")
    }
  }, [fullRecommendation, cropOnlyRecommendation, error])

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Crop Recommendation</h1>

      {/* Tabs */}
      <div className="flex gap-4 mt-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "form"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Input
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "results"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("results")}
        >
          Results
        </button>
      </div>

      {/* FORM TAB */}
      {activeTab === "form" && (
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {[
            { name: "soil_type", label: "Soil Type", type: "text" },
            { name: "ph_value", label: "pH Value", type: "number" },
            { name: "moisture", label: "Moisture (%)", type: "number" },
            { name: "nitrogen", label: "Nitrogen", type: "number" },
            { name: "phosphorous", label: "Phosphorous", type: "number" },
            { name: "potassium", label: "Potassium", type: "number" },
            { name: "temperature", label: "Temperature (°C)", type: "number" },
            { name: "humidity", label: "Humidity (%)", type: "number" },
            { name: "rainfall", label: "Rainfall (mm)", type: "number" },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleFieldChange}
                className="w-full mt-1 px-4 py-2 border rounded-md"
              />
              {formErrors[name] && (
                <p className="text-sm text-red-500">{formErrors[name]}</p>
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="button"
              onClick={handleFullSubmit}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <FiRefreshCw className="animate-spin" />
                  Loading...
                </span>
              ) : (
                "Get Full Recommendation"
              )}
            </button>

            <button
              type="button"
              onClick={handleCropOnlySubmit}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <FiRefreshCw className="animate-spin" />
                  Loading...
                </span>
              ) : (
                "Get Crop Recommendation"
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {/* RESULTS TAB */}
      {activeTab === "results" && (
        <div className="space-y-6">
          {submissionMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded flex items-center gap-2">
              <FiSend />
              {submissionMessage}
            </div>
          )}

          {success && (
            <div className="bg-green-100 p-4 rounded flex items-center gap-3">
              <FiCheckCircle className="text-green-700" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 p-4 rounded flex items-center gap-3">
              <FiAlertCircle className="text-red-700" />
              <span>{error?.detail || "Something went wrong"}</span>
            </div>
          )}

          {fullRecommendation && (
            <div className="p-4 bg-white border rounded shadow">
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Full Recommendation
              </h3>
              <p>
                <strong>Crop:</strong> {extractCrop(fullRecommendation)}
              </p>
              <p>
                <strong>Yield:</strong>{" "}
                {fullRecommendation?.yield_prediction || "N/A"}
              </p>
              <p>
                <strong>Disease:</strong>{" "}
                {fullRecommendation?.disease_prediction || "N/A"}
              </p>
            </div>
          )}

          {cropOnlyRecommendation && (
            <div className="p-4 bg-white border rounded shadow">
              <h3 className="text-xl font-bold text-blue-700 mb-2">
                Crop-Only Recommendation
              </h3>
              <p>
                <strong>Crop:</strong> {extractCrop(cropOnlyRecommendation)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PredictionForm