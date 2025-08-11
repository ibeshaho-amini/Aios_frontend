"use client"

import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createProduct, listProductsBySupplier, clearProductState } from "../../Redux/product/productSlice"
import {
  FiBox,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiPackage,
  FiDollarSign,
  FiLayers,
  FiRefreshCw,
  FiImage,
  FiUpload,
} from "react-icons/fi"

// Adjust this path to where you saved the table component
import SupplierProductsTable from "../supplier/components/productForm"

// ---------- Reusable Inputs (outside of ProductPage) ----------
const InputField = ({ label, name, type = "text", placeholder, options = null, value, onChange, error, ...props }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>

    {options ? (
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
          error ? "border-red-300" : "border-gray-200"
        }`}
        {...props}
      >
        <option value="">{placeholder || "Select"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
          error ? "border-red-300" : "border-gray-200"
        }`}
        {...props}
      />
    )}

    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <FiAlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
)

const ImageUploadField = ({ label, name, onChange, preview, error }) => {
  const inputRef = useRef(null)
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="mx-auto h-48 object-contain rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-black/50 text-white p-2 rounded-lg flex items-center gap-2">
                <FiUpload /> Change Image
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center">
            <FiImage className="text-gray-400 text-4xl mb-2" />
            <p className="text-gray-500">Click to upload product image</p>
            <p className="text-gray-400 text-sm mt-1">JPG, PNG or WEBP (max 5MB)</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

// ---------- Main Page ----------
const ProductPage = () => {
  const dispatch = useDispatch()

  // Read keyed product state from slice
  const {
    productsBySupplierUserId,
    loadingBySupplierUserId,
    isLoading, // global loading for create/update/delete
    error,
    success,
  } = useSelector((state) => state.product)

  // Read user id safely in client
  const [userId, setUserId] = useState(null)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"))
    }
  }, [])

  // Derive per-supplier data for the current user (for Stats only)
  const supplierProducts = userId ? productsBySupplierUserId[userId] || [] : []
  const isLoadingProducts = userId ? !!loadingBySupplierUserId[userId] : false

  // UI State
  const [showForm, setShowForm] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  // Form state
  const [form, setForm] = useState({
    supplier: "",
    name: "",
    description: "",
    category: "",
    quantity_available: "",
    price: "",
    unit: "",
    status: "Available",
    image: null,
  })
  const [formErrors, setFormErrors] = useState({})

  // Fetch products for this supplier when userId is available
  useEffect(() => {
    if (userId) {
      setForm((prev) => ({ ...prev, supplier: userId }))
      dispatch(listProductsBySupplier(userId))
    }
    return () => {
      dispatch(clearProductState())
    }
  }, [dispatch, userId])

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const valid = ["image/jpeg", "image/png", "image/webp"]
    if (!valid.includes(file.type)) {
      setFormErrors((p) => ({ ...p, image: "Please upload a JPG, PNG, or WEBP file" }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((p) => ({ ...p, image: "Image must be less than 5MB" }))
      return
    }

    setFormErrors((p) => ({ ...p, image: "" }))
    setForm((prev) => ({ ...prev, image: file }))

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const err = {}
    if (!form.supplier) err.supplier = "Supplier ID is missing"
    if (!form.name.trim()) err.name = "Product name is required"
    if (!form.description.trim()) err.description = "Product description is required"
    if (!form.category.trim()) err.category = "Category is required"
    if (form.quantity_available === "" || isNaN(Number(form.quantity_available))) err.quantity_available = "Quantity is required"
    if (form.price === "" || isNaN(Number(form.price))) err.price = "Price is required"
    if (!form.unit.trim()) err.unit = "Unit is required"
    setFormErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    if (!userId) return

    const formData = new FormData()
    formData.append("supplier", form.supplier)
    formData.append("name", form.name)
    formData.append("description", form.description)
    formData.append("category", form.category)
    formData.append("quantity_available", String(form.quantity_available))
    formData.append("price", String(form.price))
    formData.append("unit", form.unit)
    formData.append("status", form.status)
    if (form.image) formData.append("image", form.image)

    dispatch(createProduct(formData)).then((res) => {
      if (!res.error) {
        dispatch(listProductsBySupplier(userId))
        resetForm()
        setShowForm(false)
      }
    })
  }

  const resetForm = () => {
    setForm({
      supplier: userId || "",
      name: "",
      description: "",
      category: "",
      quantity_available: "",
      price: "",
      unit: "",
      status: "Available",
      image: null,
    })
    setImagePreview(null)
    setFormErrors({})
  }

  const fillSampleData = () => {
    setForm((prev) => ({
      ...prev,
      name: "Premium Urea Fertilizer",
      description: "High-quality nitrogen fertilizer for enhanced crop growth and yield",
      category: "Fertilizer",
      quantity_available: "500",
      price: "45.50",
      unit: "kg",
      status: "Available",
    }))
  }

  const categories = ["Fertilizer", "Seeds", "Pesticide", "Tools", "Equipment", "Other"]
  const units = ["kg", "liter", "piece", "bag", "ton", "gram"]
  const statusOptions = ["Available", "Unavailable"]

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
                onClick={() => userId && dispatch(listProductsBySupplier(userId))}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                disabled={isLoadingProducts || !userId}
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoadingProducts ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => {
                  const next = !showForm
                  setShowForm(next)
                  if (next) resetForm()
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                disabled={!userId}
              >
                {showForm ? <FiX /> : <FiPlus />}
                {showForm ? "Cancel" : "Add Product"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats (from keyed map) */}
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
                Add New Product
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
                <InputField
                  label="Product Name"
                  name="name"
                  placeholder="e.g. Premium Urea Fertilizer"
                  value={form.name}
                  onChange={handleChange}
                  error={formErrors.name}
                />
                <InputField
                  label="Category"
                  name="category"
                  placeholder="Select category"
                  options={categories}
                  value={form.category}
                  onChange={handleChange}
                  error={formErrors.category}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Description"
                    name="description"
                    placeholder="Detailed product description"
                    value={form.description}
                    onChange={handleChange}
                    error={formErrors.description}
                  />
                </div>
                <InputField
                  label="Quantity Available"
                  name="quantity_available"
                  type="number"
                  placeholder="e.g. 500"
                  min="0"
                  value={form.quantity_available}
                  onChange={handleChange}
                  error={formErrors.quantity_available}
                />
                <InputField
                  label="Unit"
                  name="unit"
                  placeholder="Select unit"
                  options={units}
                  value={form.unit}
                  onChange={handleChange}
                  error={formErrors.unit}
                />
                <InputField
                  label="Price per Unit ($)"
                  name="price"
                  type="number"
                  placeholder="e.g. 45.50"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  error={formErrors.price}
                />
                <InputField
                  label="Status"
                  name="status"
                  placeholder="Select status"
                  options={statusOptions}
                  value={form.status}
                  onChange={handleChange}
                  error={formErrors.status}
                />
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Product Image"
                    name="image"
                    onChange={handleImageChange}
                    preview={imagePreview}
                    error={formErrors.image}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
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
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table (only this component renders the list) */}
        {userId && (
          <div className="mt-8">
            <SupplierProductsTable supplierUserId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductPage