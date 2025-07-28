// "use client"

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import {
//   createProduct,
//   listProductsBySupplier,
//   clearProductState,
// } from "../../Redux/product/productSlice"
// import { FiBox, FiPlus, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

// const ProductPage = () => {
//   const dispatch = useDispatch()
//   const { supplierProducts, isLoading, error, success } = useSelector((state) => state.product)

//   // Get supplier_id from localStorage (set this after supplier profile setup)
//   const userId = localStorage.getItem("user_id")

//   // Product form state
//   const [form, setForm] = useState({
//     supplier: userId || "",
//     name: "",
//     description: "",
//     category: "",
//     quantity_available: "",
//     price: "",
//     unit: "",
//     status: "Available",
//   })
//   const [formErrors, setFormErrors] = useState({})

//   // Fetch products for this supplier on mount
//   useEffect(() => {
//     if (userId) {
//       dispatch(listProductsBySupplier(userId))
//     }
//     // Clear product state on unmount
//     return () => dispatch(clearProductState())
//   }, [dispatch, userId])

//   // If supplierId changes (e.g. after profile setup), update form
//   useEffect(() => {
//     setForm((prev) => ({ ...prev, supplier: userId }))
//   }, [userId])

//   // Form handlers
//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setForm((prev) => ({ ...prev, [name]: value }))
//     if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
//   }

//   const validate = () => {
//     const errors = {}
//     if (!form.name.trim()) errors.name = "Product name is required"
//     if (!form.description.trim()) errors.name = "Product description is required"
//     if (!form.category.trim()) errors.category = "Category is required"
//     if (!form.quantity_available || isNaN(form.quantity_available)) errors.quantity_available = "Quantity is required"
//     if (!form.price || isNaN(form.price)) errors.price = "Price is required"
//     if (!form.unit.trim()) errors.unit = "Unit is required"
//     if (!form.supplier) errors.supplier = "Supplier ID is missing. Please set up your profile."
//     setFormErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (!validate()) return
//     dispatch(createProduct(form)).then((res) => {
//       // If successful, refresh list and reset form
//       if (!res.error) {
//         dispatch(listProductsBySupplier(userId))
//         setForm({
//           supplier: userId,
//           name: "",
//           category: "",
//           description: "",
//           quantity_available: "",
//           price: "",
//           unit: "",
//           status: "Available",
//         })
//       }
//     })
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-6">
//       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-800">
//         <FiBox /> Supplier Products
//       </h2>

//       {/* Product Form */}
//       <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
//         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
//           <FiPlus /> Add New Product
//         </h3>
//         {success && (
//           <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 mb-4">
//             <FiCheckCircle className="text-green-600" />
//             <span className="text-green-700">Product added successfully!</span>
//           </div>
//         )}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
//             <FiAlertCircle className="text-red-600" />
//             <span className="text-red-700">
//               {typeof error === "string" ? error : error.detail || error.message || "Something went wrong."}
//             </span>
//           </div>
//         )}
//         <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
//             <input
//               type="text"
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                 formErrors.name ? "border-red-300" : "border-gray-200"
//               }`}
//               placeholder="e.g. Urea"
//             />
//             {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
//             <input
//               type="text"
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                 formErrors.name ? "border-red-300" : "border-gray-200"
//               }`}
//               placeholder="e.g. product for "
//             />
//             {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//             <input
//               type="text"
//               name="category"
//               value={form.category}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                 formErrors.category ? "border-red-300" : "border-gray-200"
//               }`}
//               placeholder="e.g. Fertilizer"
//             />
//             {formErrors.category && <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
//             <input
//               type="number"
//               name="quantity_available"
//               value={form.quantity_available}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                 formErrors.quantity_available ? "border-red-300" : "border-gray-200"
//               }`}
//               placeholder="e.g. 100"
//               min="0"
//             />
//             {formErrors.quantity_available && <p className="text-xs text-red-600 mt-1">{formErrors.quantity_available}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
//             <input
//               type="number"
//               name="price"
//               value={form.price}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                 formErrors.price ? "border-red-300" : "border-gray-200"
//               }`}
//               placeholder="e.g. 500.00"
//               min="0"
//               step="0.01"
//             />
//             {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
//             <input
//               type="text"
//               name="unit"
//               value={form.unit}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                 formErrors.unit ? "border-red-300" : "border-gray-200"
//               }`}
//               placeholder="e.g. kg, liter"
//             />
//             {formErrors.unit && <p className="text-xs text-red-600 mt-1">{formErrors.unit}</p>}
//           </div>
//           {/* Status is hidden, always "Available" */}
//           <div className="md:col-span-2 flex justify-end">
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
//             >
//               {isLoading ? "Saving..." : "Add Product"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Product List */}
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
//           <FiBox /> Your Products
//         </h3>
//         {isLoading && <div className="text-blue-600">Loading products...</div>}
//         {supplierProducts && supplierProducts.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="py-2 px-3 text-left">Name</th>
//                   <th className="py-2 px-3 text-left">Description</th>
//                   <th className="py-2 px-3 text-left">Category</th>
//                   <th className="py-2 px-3 text-left">Quantity</th>
//                   <th className="py-2 px-3 text-left">Unit</th>
//                   <th className="py-2 px-3 text-left">Price</th>
//                   <th className="py-2 px-3 text-left">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {supplierProducts.map((product) => (
//                   <tr key={product.id} className="border-t border-gray-100">
//                     <td className="py-2 px-3">{product.name}</td>
//                     <td className="py-2 px-3">{product.description}</td>
//                     <td className="py-2 px-3">{product.category}</td>
//                     <td className="py-2 px-3">{product.quantity_available}</td>
//                     <td className="py-2 px-3">{product.unit}</td>
//                     <td className="py-2 px-3">{product.price}</td>
//                     <td className="py-2 px-3">
//                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                         product.status === "Available"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-gray-200 text-gray-600"
//                       }`}>
//                         {product.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="text-gray-500">No products found. Add your first product above.</div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ProductPage


"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createProduct, listProductsBySupplier, clearProductState } from "../../Redux/product/productSlice"
import {
  FiBox,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiX,
  FiPackage,
  FiDollarSign,
  FiLayers,
  FiRefreshCw,
} from "react-icons/fi"

const ProductPage = () => {
  const dispatch = useDispatch()
  const { supplierProducts, isLoading, error, success } = useSelector((state) => state.product)

  // Get supplier_id from localStorage (set this after supplier profile setup)
  const userId = localStorage.getItem("user_id")

  // UI State
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Product form state
  const [form, setForm] = useState({
    supplier: userId || "",
    name: "",
    description: "",
    category: "",
    quantity_available: "",
    price: "",
    unit: "",
    status: "Available",
  })

  const [formErrors, setFormErrors] = useState({})

  // Fetch products for this supplier on mount
  useEffect(() => {
    if (userId) {
      dispatch(listProductsBySupplier(userId))
    }
    // Clear product state on unmount
    return () => dispatch(clearProductState())
  }, [dispatch, userId])

  // If supplierId changes (e.g. after profile setup), update form
  useEffect(() => {
    setForm((prev) => ({ ...prev, supplier: userId }))
  }, [userId])

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = "Product name is required"
    if (!form.description.trim()) errors.description = "Product description is required"
    if (!form.category.trim()) errors.category = "Category is required"
    if (!form.quantity_available || isNaN(form.quantity_available)) errors.quantity_available = "Quantity is required"
    if (!form.price || isNaN(form.price)) errors.price = "Price is required"
    if (!form.unit.trim()) errors.unit = "Unit is required"
    if (!form.supplier) errors.supplier = "Supplier ID is missing. Please set up your profile."
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    dispatch(createProduct(form)).then((res) => {
      // If successful, refresh list and reset form
      if (!res.error) {
        dispatch(listProductsBySupplier(userId))
        resetForm()
        setShowForm(false)
      }
    })
  }

  const resetForm = () => {
    setForm({
      supplier: userId,
      name: "",
      category: "",
      description: "",
      quantity_available: "",
      price: "",
      unit: "",
      status: "Available",
    })
    setFormErrors({})
  }

  const fillSampleData = () => {
    setForm({
      supplier: userId,
      name: "Premium Urea Fertilizer",
      description: "High-quality nitrogen fertilizer for enhanced crop growth and yield",
      category: "Fertilizer",
      quantity_available: "500",
      price: "45.50",
      unit: "kg",
      status: "Available",
    })
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setForm({
      supplier: product.supplier,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity_available: product.quantity_available.toString(),
      price: product.price.toString(),
      unit: product.unit,
      status: product.status,
    })
    setShowForm(true)
  }

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      // Implement delete functionality
      console.log("Delete product:", productId)
    }
  }

  const handleView = (product) => {
    setSelectedProduct(product)
    // You can implement a modal or navigate to product details
    console.log("View product:", product)
  }

  const categories = ["Fertilizer", "Seeds", "Pesticide", "Tools", "Equipment", "Other"]
  const units = ["kg", "liter", "piece", "bag", "ton", "gram"]

  const InputField = ({ label, name, type = "text", placeholder, options = null, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {options ? (
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            formErrors[name] ? "border-red-300" : "border-gray-200"
          }`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            formErrors[name] ? "border-red-300" : "border-gray-200"
          }`}
          {...props}
        />
      )}
      {formErrors[name] && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4" />
          {formErrors[name]}
        </p>
      )}
    </div>
  )

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FiPackage className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.category}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            product.status === "Available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {product.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FiLayers className="text-gray-500 text-sm" />
            <span className="text-xs text-gray-500">Quantity</span>
          </div>
          <p className="font-semibold text-gray-800">
            {product.quantity_available} {product.unit}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FiDollarSign className="text-gray-500 text-sm" />
            <span className="text-xs text-gray-500">Price</span>
          </div>
          <p className="font-semibold text-gray-800">
            ${product.price}/{product.unit}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleView(product)}
          className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <FiEye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => handleEdit(product)}
          className="flex-1 bg-green-50 text-green-600 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <FiEdit3 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => handleDelete(product.id)}
          className="bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <FiBox className="text-blue-600 text-2xl" />
                </div>
                Product Management
              </h1>
              <p className="text-gray-600">Manage your agricultural products and inventory</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(listProductsBySupplier(userId))}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => {
                  setShowForm(!showForm)
                  if (!showForm) resetForm()
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                {showForm ? <FiX /> : <FiPlus />}
                {showForm ? "Cancel" : "Add Product"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiPackage className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{supplierProducts?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {supplierProducts?.filter((p) => p.status === "Available").length || 0}
                </p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiLayers className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(supplierProducts?.map((p) => p.category)).size || 0}
                </p>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FiDollarSign className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  $
                  {supplierProducts
                    ?.reduce((sum, p) => sum + Number.parseFloat(p.price) * Number.parseInt(p.quantity_available), 0)
                    .toFixed(0) || 0}
                </p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiPlus className="text-blue-600" />
                {selectedProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={fillSampleData}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
              >
                Fill Sample Data
              </button>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 mb-6">
                <FiCheckCircle className="text-green-600" />
                <span className="text-green-700">Product saved successfully!</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
                <FiAlertCircle className="text-red-600" />
                <span className="text-red-700">
                  {typeof error === "string" ? error : error.detail || error.message || "Something went wrong."}
                </span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Product Name" name="name" placeholder="e.g. Premium Urea Fertilizer" />
                <InputField label="Category" name="category" placeholder="Select category" options={categories} />
                <div className="md:col-span-2">
                  <InputField label="Description" name="description" placeholder="Detailed product description" />
                </div>
                <InputField
                  label="Quantity Available"
                  name="quantity_available"
                  type="number"
                  placeholder="e.g. 500"
                  min="0"
                />
                <InputField label="Unit" name="unit" placeholder="Select unit" options={units} />
                <InputField
                  label="Price per Unit ($)"
                  name="price"
                  type="number"
                  placeholder="e.g. 45.50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                    setSelectedProduct(null)
                  }}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      {selectedProduct ? "Update Product" : "Add Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiBox className="text-blue-600" />
              Your Products
            </h2>
            {supplierProducts && supplierProducts.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{supplierProducts.length} products</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-blue-600">
                <FiRefreshCw className="animate-spin text-xl" />
                <span>Loading products...</span>
              </div>
            </div>
          ) : supplierProducts && supplierProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplierProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first product to showcase your inventory</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <FiPlus />
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPage
