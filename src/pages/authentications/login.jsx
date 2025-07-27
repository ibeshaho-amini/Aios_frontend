// "use client"

// import { useState, useEffect } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { useDispatch, useSelector } from "react-redux"
// import { login, clearSuccessMessage } from "../../Redux/authentication/login" // ✅ Adjust path accordingly

// export default function LoginPage() {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   })

//   const [showPassword, setShowPassword] = useState(false)
//   const [errors, setErrors] = useState({})

//   const { isLoading, isAuthenticated, error: loginError } = useSelector((state) => state.auth)

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }))

//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }))
//     }
//   }

//   const validateForm = () => {
//     const newErrors = {}

//     if (!formData.email) {
//       newErrors.email = "Email is required"
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email"
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required"
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters"
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) return

//     dispatch(login({ email: formData.email, password: formData.password }))
//   }

//   // Redirect when login successful
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/dashboard")
//     }
//   }, [isAuthenticated, navigate])

//   // Clear messages on component unmount
//   useEffect(() => {
//     return () => {
//       dispatch(clearSuccessMessage())
//     }
//   }, [dispatch])

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4 relative">
//       {/* Background */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
//       </div>

//       <div className="w-full max-w-md relative z-10">
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="relative">
//               <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-75"></div>
//               <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
//                 <span className="text-white text-2xl">🌱</span>
//               </div>
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
//           <p className="text-gray-600">Sign in to your AIOS account</p>
//         </div>

//         <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl border-0">
//           <div className="p-6">
//             <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>

//             {/* Display login error from Redux */}
//             {loginError && (
//               <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//                 <div className="flex items-center">
//                   <span className="text-red-600 mr-2">🚫</span>
//                   <span className="text-red-700">{loginError?.detail || loginError}</span>
//                 </div>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Email */}
//               <div>
//                 <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
//                   Email Address
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
//                     errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
//                   } focus:outline-none`}
//                   placeholder="Enter your email"
//                   disabled={isLoading}
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-600 mt-1">⚠ {errors.email}</p>
//                 )}
//               </div>

//               {/* Password */}
//               <div>
//                 <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
//                       errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
//                     } focus:outline-none`}
//                     placeholder="Enter your password"
//                     disabled={isLoading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
//                     disabled={isLoading}
//                   >
//                     {showPassword ? "🙈" : "👁️"}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-sm text-red-600 mt-1">⚠ {errors.password}</p>
//                 )}
//               </div>

//               {/* Remember Me & Forgot */}
//               <div className="flex items-center justify-between">
//                 <label className="flex items-center space-x-2 text-sm text-gray-600">
//                   <input
//                     name="rememberMe"
//                     type="checkbox"
//                     checked={formData.rememberMe}
//                     onChange={handleInputChange}
//                     className="w-4 h-4 text-green-600"
//                   />
//                   <span>Remember me</span>
//                 </label>
//                 <Link
//                   to="/forgot-password"
//                   className="text-sm font-medium text-green-600 hover:text-green-700"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               {/* Submit button */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow hover:shadow-md transition-all duration-300 disabled:opacity-50"
//               >
//                 {isLoading ? "Signing In..." : "Sign In"}
//               </button>
//             </form>

//             {/* Divider */}
//             <div className="my-6 border-t border-gray-200 text-center">
//               <span className="inline-block -mt-3 bg-white px-4 text-sm text-gray-600">
//                 New to AIOS?
//               </span>
//             </div>

//             <p className="text-sm text-center">
//               Don’t have an account?{" "}
//               <Link to="/signup" className="text-green-600 hover:underline font-medium">
//                 Sign up
//               </Link>
//             </p>
//           </div>
//         </div>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           © 2024 AIOS — Empowering Agriculture
//         </p>
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useState, useEffect,useRef  } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { useDispatch, useSelector } from "react-redux"
// import { login, clearSuccessMessage } from "../../Redux/authentication/login" // ✅ Adjust the path

// export default function LoginPage() {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const didAttemptLogin = useRef(false)
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   })

//   const [showPassword, setShowPassword] = useState(false)
//   const [errors, setErrors] = useState({})

//   // ✅ Get Redux state
//   const { isLoading, isAuthenticated, role, error: loginError } = useSelector((state) => state.auth || {})

//   // ✅ Input change handler
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }))

//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }))
//     }
//   }

//   // ✅ Form validation
//   const validateForm = () => {
//     const newErrors = {}

//     if (!formData.email) {
//       newErrors.email = "Email is required"
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email"
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required"
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters"
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) return
//     didAttemptLogin.current = true


//     dispatch(login({ email: formData.email, password: formData.password }))
//   }

//   // ✅ Redirect based on role after login
//   // useEffect(() => {
//   //   if (isAuthenticated && role) {
//   //     switch (role) {
//   //       case "Admin":
//   //         navigate("/admin-dashboard")
//   //         break
//   //       case "Farmer":
//   //         navigate("/farmer-dashboard")
//   //         break
//   //       case "Supplier":
//   //         navigate("/supplier-dashboard")
//   //         break
        
//   //     }
//   //   }
//   // }, [isAuthenticated, role, navigate])


//   useEffect(() => {
//     console.log("Auth state:", { isAuthenticated, role, didAttemptLogin: didAttemptLogin.current });
    
//     if (isAuthenticated && role && didAttemptLogin.current) {
//       console.log("Redirecting to dashboard for role:", role);
//       switch (role) {
//         case "Admin":
//           navigate("/admin-dashboard")  
//           break
//         case "Farmer":
//           navigate("/farmer-dashboard")
//           break
//         case "Supplier":
//           navigate("/supplier-dashboard")
//           break
//       }
//     }
//   }, [isAuthenticated, role, navigate])
//   // ✅ Clear messages on component unmount
//   useEffect(() => {
//     return () => {
//       dispatch(clearSuccessMessage())
//     }
//   }, [dispatch])

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4 relative">
//       {/* Background */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
//       </div>

//       <div className="w-full max-w-md relative z-10">
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="relative">
//               <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-75"></div>
//               <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
//                 <span className="text-white text-2xl">🌱</span>
//               </div>
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
//           <p className="text-gray-600">Sign in to your AIOS account</p>
//         </div>

//         <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl border-0">
//           <div className="p-6">
//             <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>

//             {/* Redux login error */}
//             {loginError && (
//               <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//                 <div className="flex items-center">
//                   <span className="text-red-600 mr-2">🚫</span>
//                   <span className="text-red-700">{loginError?.detail || loginError}</span>
//                 </div>
//               </div>
//             )}

//             {/* Form */}
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Email */}
//               <div>
//                 <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
//                   Email Address
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
//                     errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
//                   } focus:outline-none`}
//                   placeholder="Enter your email"
//                   disabled={isLoading}
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-600 mt-1">⚠ {errors.email}</p>
//                 )}
//               </div>

//               {/* Password */}
//               <div>
//                 <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
//                       errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
//                     } focus:outline-none`}
//                     placeholder="Enter your password"
//                     disabled={isLoading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
//                     disabled={isLoading}
//                   >
//                     {showPassword ? "🙈" : "👁️"}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-sm text-red-600 mt-1">⚠ {errors.password}</p>
//                 )}
//               </div>

//               {/* Remember Me & Forgot */}
//               <div className="flex items-center justify-between">
//                 <label className="flex items-center space-x-2 text-sm text-gray-600">
//                   <input
//                     name="rememberMe"
//                     type="checkbox"
//                     checked={formData.rememberMe}
//                     onChange={handleInputChange}
//                     className="w-4 h-4 text-green-600"
//                   />
//                   <span>Remember me</span>
//                 </label>
//                 <Link
//                   to="/forgot-password"
//                   className="text-sm font-medium text-green-600 hover:text-green-700"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               {/* Submit button */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow hover:shadow-md transition-all duration-300 disabled:opacity-50"
//               >
//                 {isLoading ? "Signing In..." : "Sign In"}
//               </button>
//             </form>

//             {/* Divider */}
//             <div className="my-6 border-t border-gray-200 text-center">
//               <span className="inline-block -mt-3 bg-white px-4 text-sm text-gray-600">
//                 New to AIOS?
//               </span>
//             </div>

//             <p className="text-sm text-center">
//               Don’t have an account?{" "}
//               <Link to="/signup" className="text-green-600 hover:underline font-medium">
//                 Sign up
//               </Link>
//             </p>
//           </div>
//         </div>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           © 2024 AIOS — Empowering Agriculture
//         </p>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { login, clearSuccessMessage } from "../../Redux/authentication/login"

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Change from useRef to useState
  const [attemptedLogin, setAttemptedLogin] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const { isLoading, isAuthenticated, role, error: loginError } = useSelector((state) => state.auth || {})

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    // Set state instead of ref
    setAttemptedLogin(true)
    
    dispatch(login({ email: formData.email, password: formData.password }))
  }

  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, role, attemptedLogin });
    
    if (isAuthenticated && role && attemptedLogin) {
      console.log("Redirecting to dashboard for role:", role);
      switch (role) {
        case "Admin":
          navigate("/admin-dashboard")  
          break
        case "Farmer":
          navigate("/farmer-dashboard")
          break
        case "Supplier":
          navigate("/supplier-dashboard")
          break
      }
    }
  }, [isAuthenticated, role, navigate, attemptedLogin]) // Add attemptedLogin to dependencies

  useEffect(() => {
    return () => {
      dispatch(clearSuccessMessage())
    }
  }, [dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
                <span className="text-white text-2xl">🌱</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your AIOS account</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl border-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>

            {/* Redux login error */}
            {loginError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">🚫</span>
                  <span className="text-red-700">{loginError?.detail || loginError}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                    errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                  } focus:outline-none`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">⚠ {errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                      errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                    } focus:outline-none`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                    disabled={isLoading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">⚠ {errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow hover:shadow-md transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200 text-center">
              <span className="inline-block -mt-3 bg-white px-4 text-sm text-gray-600">
                New to AIOS?
              </span>
            </div>

            <p className="text-sm text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="text-green-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 AIOS — Empowering Agriculture
        </p>
      </div>
    </div>
  )
}