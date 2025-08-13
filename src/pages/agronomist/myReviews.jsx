// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchAllAgronomistRecommendations } from "../../Redux/Recommendation/reviews";
// import {
//   FiCheckCircle,
//   FiUserCheck,
//   FiClock,
//   FiLayers,
//   FiEye,
// } from "react-icons/fi";

// const MyReviews = () => {
//   const dispatch = useDispatch();
//   const { isLoading, allRecommendations, error } = useSelector(
//     (state) => state.recommend
//   );

//   // Grab user_id from localStorage
//   const storedUser = localStorage.getItem("user_id");

//   const [filter, setFilter] = useState("all"); // all, in_review, completed

//   useEffect(() => {
//     dispatch(fetchAllAgronomistRecommendations());
//   }, [dispatch]);

//   // 🧠 Filter only MY reviews (recommendations I've worked on)
//   const myReviews = allRecommendations?.filter((rec) => {
//     // Only show recommendations where I am the agronomist
//     return rec.agronomist_id === parseInt(storedUser) && 
//            ["translated", "returned", "in_review"].includes(rec.status);
//   });

//   // Additional filtering based on selected filter
//   const filteredRecommendations = myReviews?.filter((rec) => {
//     if (filter === "in_review") {
//       return rec.status === "in_review";
//     }
//     if (filter === "completed") {
//       return ["translated", "returned"].includes(rec.status);
//     }
//     return true; // show all my reviews
//   });

//   const getStatusBadge = (rec) => {
//     if (rec.status === "in_review") {
//       return (
//         <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full flex gap-2 items-center">
//           <FiUserCheck />
//           In Progress
//         </span>
//       );
//     }
//     if (rec.status === "translated") {
//       return (
//         <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex gap-2 items-center">
//           <FiCheckCircle />
//           Translated
//         </span>
//       );
//     }
//     if (rec.status === "returned") {
//       return (
//         <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full flex gap-2 items-center">
//           <FiCheckCircle />
//           Returned
//         </span>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
//           <FiLayers />
//           My Reviews ({filteredRecommendations?.length || 0})
//         </h1>

//         <select
//           className="border text-sm rounded px-4 py-2 bg-white shadow-sm"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="all">All My Reviews</option>
//           <option value="in_review">In Progress</option>
//           <option value="completed">Completed</option>
//         </select>
//       </div>

//       {isLoading && (
//         <div className="flex items-center justify-center py-8">
//           <p className="text-yellow-600 flex items-center gap-2">
//             <FiClock className="animate-spin" />
//             Fetching your reviews...
//           </p>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-600">Error: {error.detail || error}</p>
//         </div>
//       )}

//       {!isLoading && filteredRecommendations?.length === 0 && (
//         <div className="text-center py-12">
//           <FiEye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//           <p className="text-gray-500 text-lg">
//             {filter === "all" 
//               ? "No reviews found. Start reviewing recommendations to see them here."
//               : `No ${filter.replace('_', ' ')} reviews found.`}
//           </p>
//         </div>
//       )}

//       <div className="space-y-4">
//         {filteredRecommendations?.map((rec) => (
//           <div
//             key={rec.id}
//             className="bg-white border border-gray-200 rounded-lg p-6 shadow hover:shadow-md transition-shadow"
//           >
//             <div className="flex justify-between items-start">
//               <div className="space-y-3 flex-1">
//                 <div className="flex items-center gap-3">
//                   <p className="text-xl font-bold text-green-800">
//                     {rec.crop_predicted || "N/A"}
//                   </p>
//                   {getStatusBadge(rec)}
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
//                   <p className="flex items-center gap-2">
//                     <FiClock />
//                     Submitted: {new Date(rec.timestamp).toLocaleString()}
//                   </p>
                  
//                   {rec.user && (
//                     <p className="flex items-center gap-2">
//                       👤 Farmer: {rec.user.name || rec.user.username || `User ${rec.user_id}`}
//                     </p>
//                   )}
//                 </div>

//                 {/* Show recommendation details if available */}
//                 {rec.recommendation_text && (
//                   <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                     <h4 className="font-medium text-gray-700 mb-2">My Recommendation:</h4>
//                     <p className="text-gray-600 text-sm leading-relaxed">
//                       {rec.recommendation_text}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Summary stats */}
//       {!isLoading && myReviews?.length > 0 && (
//         <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
//           <h3 className="text-lg font-semibold text-gray-700 mb-4">Review Summary</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
//             <div className="bg-white rounded-lg p-4 shadow-sm">
//               <div className="text-2xl font-bold text-yellow-600">
//                 {myReviews.filter(r => r.status === "in_review").length}
//               </div>
//               <div className="text-sm text-gray-600">In Progress</div>
//             </div>
//             <div className="bg-white rounded-lg p-4 shadow-sm">
//               <div className="text-2xl font-bold text-green-600">
//                 {myReviews.filter(r => r.status === "translated").length}
//               </div>
//               <div className="text-sm text-gray-600">Translated</div>
//             </div>
//             <div className="bg-white rounded-lg p-4 shadow-sm">
//               <div className="text-2xl font-bold text-blue-600">
//                 {myReviews.filter(r => r.status === "returned").length}
//               </div>
//               <div className="text-sm text-gray-600">Returned</div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyReviews;


import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAgronomistRecommendations } from "../../Redux/Recommendation/reviews";
import {
  FiCheckCircle,
  FiUserCheck,
  FiClock,
  FiLayers,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiEdit3,
  FiUser,
  FiMapPin,
} from "react-icons/fi";

const MyReviews = () => {
  const dispatch = useDispatch();
  const { isLoading, allRecommendations, error } = useSelector(
    (state) => state.recommend
  );

  // Grab user_id from localStorage
  const storedUser = localStorage.getItem("user_id");

  const [filter, setFilter] = useState("all"); // all, in_review, completed
  const [expandedItems, setExpandedItems] = useState(new Set()); // Track expanded recommendation cards

  useEffect(() => {
    dispatch(fetchAllAgronomistRecommendations());
  }, [dispatch]);

  // 🧠 Filter only MY reviews (recommendations I've worked on)
  const myReviews = allRecommendations?.filter((rec) => {
    // Only show recommendations where I am the agronomist
    return rec.agronomist_id === parseInt(storedUser) && 
           ["translated", "returned", "in_review"].includes(rec.status);
  });

  // Additional filtering based on selected filter
  const filteredRecommendations = myReviews?.filter((rec) => {
    if (filter === "in_review") {
      return rec.status === "in_review";
    }
    if (filter === "completed") {
      return ["translated", "returned"].includes(rec.status);
    }
    return true; // show all my reviews
  });

  const toggleExpanded = (recId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(recId)) {
      newExpanded.delete(recId);
    } else {
      newExpanded.add(recId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusBadge = (rec) => {
    if (rec.status === "in_review") {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full flex gap-2 items-center">
          <FiUserCheck />
          In Progress
        </span>
      );
    }
    if (rec.status === "translated") {
      return (
        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex gap-2 items-center">
          <FiCheckCircle />
          Translated
        </span>
      );
    }
    if (rec.status === "returned") {
      return (
        <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full flex gap-2 items-center">
          <FiCheckCircle />
          Returned
        </span>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
          <FiLayers />
          My Reviews ({filteredRecommendations?.length || 0})
        </h1>

        <select
          className="border text-sm rounded px-4 py-2 bg-white shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All My Reviews</option>
          <option value="in_review">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-yellow-600 flex items-center gap-2">
            <FiClock className="animate-spin" />
            Fetching your reviews...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error.detail || error}</p>
        </div>
      )}

      {!isLoading && filteredRecommendations?.length === 0 && (
        <div className="text-center py-12">
          <FiEye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === "all" 
              ? "No reviews found. Start reviewing recommendations to see them here."
              : `No ${filter.replace('_', ' ')} reviews found.`}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filteredRecommendations?.map((rec) => {
          const isExpanded = expandedItems.has(rec.id);
          
          return (
            <div
              key={rec.id}
              className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              {/* Main Card Content */}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-bold text-green-800">
                        {rec.crop_predicted || "N/A"}
                      </p>
                      {getStatusBadge(rec)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <FiClock />
                        Submitted: {new Date(rec.timestamp).toLocaleString()}
                      </p>
                      
                      {rec.user && (
                        <p className="flex items-center gap-2">
                          <FiUser />
                          Farmer: {rec.user.name || rec.user.username || `User ${rec.user_id}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleExpanded(rec.id)}
                    className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isExpanded ? "Hide details" : "Show details"}
                  >
                    {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="space-y-6">
                    
                    {/* Original Farmer Data */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiMapPin className="text-blue-500" />
                        Farmer's Input Data
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                        {rec.nitrogen && (
                          <div>
                            <span className="text-gray-600">Nitrogen:</span>
                            <span className="ml-2 font-medium">{rec.nitrogen}</span>
                          </div>
                        )}
                        {rec.phosphorous && (
                          <div>
                            <span className="text-gray-600">Phosphorous:</span>
                            <span className="ml-2 font-medium">{rec.phosphorous}</span>
                          </div>
                        )}
                        {rec.potassium && (
                          <div>
                            <span className="text-gray-600">Potassium:</span>
                            <span className="ml-2 font-medium">{rec.potassium}</span>
                          </div>
                        )}
                        {rec.temperature && (
                          <div>
                            <span className="text-gray-600">Temperature:</span>
                            <span className="ml-2 font-medium">{rec.temperature}°C</span>
                          </div>
                        )}
                        {rec.humidity && (
                          <div>
                            <span className="text-gray-600">Humidity:</span>
                            <span className="ml-2 font-medium">{rec.humidity}%</span>
                          </div>
                        )}
                        {rec.ph_value && (
                          <div>
                            <span className="text-gray-600">pH:</span>
                            <span className="ml-2 font-medium">{rec.ph_value}</span>
                          </div>
                        )}
                        {rec.rainfall && (
                          <div>
                            <span className="text-gray-600">Rainfall:</span>
                            <span className="ml-2 font-medium">{rec.rainfall}mm</span>
                          </div>
                        )}
                        {rec.soil_type && (
                          <div>
                            <span className="text-gray-600">Soil Type:</span>
                            <span className="ml-2 font-medium">{rec.soil_type}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Predictions */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiLayers className="text-green-500" />
                        AI Predictions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Predicted Crop:</span>
                          <span className="ml-2 font-medium text-green-700">
                            {rec.crop_predicted || "N/A"}
                          </span>
                        </div>
                        {rec.fertilizer_predicted && (
                          <div>
                            <span className="text-gray-600">Predicted Fertilizer:</span>
                            <span className="ml-2 font-medium text-green-700">
                              {rec.fertilizer_predicted}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* My Reviews */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <FiEdit3 className="text-blue-500" />
                        My Review & Recommendations
                      </h4>
                      
                      {/* Agronomist Notes */}
                      {rec.agronomist_notes && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiFileText size={16} />
                            My Notes:
                          </h5>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {rec.agronomist_notes}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Translated Summary */}
                      {rec.translated_summary && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiFileText size={16} />
                            Translated Summary:
                          </h5>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {rec.translated_summary}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* General Recommendation Text */}
                      {rec.recommendation_text && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiFileText size={16} />
                            Recommendation:
                          </h5>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {rec.recommendation_text}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* If no review content */}
                      {!rec.agronomist_notes && !rec.translated_summary && !rec.recommendation_text && (
                        <p className="text-gray-500 text-sm italic">
                          No review content available yet.
                        </p>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiClock className="text-purple-500" />
                        Timeline
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submitted:</span>
                          <span className="font-medium">
                            {new Date(rec.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {rec.updated_at && rec.updated_at !== rec.timestamp && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="font-medium">
                              {new Date(rec.updated_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      {!isLoading && myReviews?.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Review Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">
                {myReviews.filter(r => r.status === "in_review").length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {myReviews.filter(r => r.status === "translated").length}
              </div>
              <div className="text-sm text-gray-600">Translated</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {myReviews.filter(r => r.status === "returned").length}
              </div>
              <div className="text-sm text-gray-600">Returned</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;