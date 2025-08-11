"use client"

import React, { useEffect, useMemo, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  listProductsBySupplier,
  clearProductState,
  updateProduct,
  deleteProduct,
} from "../../../Redux/product/productSlice"

import {
  FiBox,
  FiRefreshCw,
  FiX,
  FiEdit3,
  FiEye,
  FiTrash2,
  FiLayers,
  FiDollarSign,
  FiAlertCircle,
  FiUpload,
  FiImage,
} from "react-icons/fi"

const API_BASE = process.env.REACT_APP_API_BASE_URL
const placeholderImg = "https://via.placeholder.com/600x400?text=No+Image"
const resolveImageUrl = (src) => {
  if (!src || typeof src !== "string") return placeholderImg
  if (src.startsWith("http")) return src
  const base = (API_BASE || "").replace(/\/$/, "")
  return `${base}${src}`
}

// Reusable input
const InputField = ({ label, name, type = "text", placeholder, value, onChange, error, options = null, ...props }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
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
          <option key={opt} value={opt}>{opt}</option>
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

// Image upload
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
            <img src={preview} alt="Preview" className="mx-auto h-56 object-contain rounded-lg" />
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

// Modal base
const Modal = ({ open, onClose, children, title, actions }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <FiX className="text-xl" />
            </button>
          </div>
          <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>
          {actions && <div className="p-4 border-t flex justify-end gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  )
}

// Details + Edit modal
const ProductDetailsModal = ({ open, onClose, product, onSave, isSaving }) => {
  const [editMode, setEditMode] = useState(false)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    quantity_available: "",
    price: "",
    unit: "",
    status: "Available",
    image: null,
  })

  const imageUrl = useMemo(
    () => preview || resolveImageUrl(product?.image || product?.image_url),
    [preview, product]
  )

  useEffect(() => {
    if (product && open) {
      setForm({
        name: product.name ?? "",
        description: product.description ?? "",
        category: product.category ?? "",
        quantity_available: String(product.quantity_available ?? ""),
        price: String(product.price ?? ""),
        unit: product.unit ?? "",
        status: product.status ?? "Available",
        image: null,
      })
      setPreview(null)
      setErrors({})
      setEditMode(false)
    }
  }, [product, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const valid = ["image/jpeg", "image/png", "image/webp"]
    if (!valid.includes(file.type)) return setErrors((p) => ({ ...p, image: "Use JPG, PNG, or WEBP" }))
    if (file.size > 5 * 1024 * 1024) return setErrors((p) => ({ ...p, image: "Image must be < 5MB" }))
    setErrors((p) => ({ ...p, image: "" }))
    setForm((p) => ({ ...p, image: file }))
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const err = {}
    if (!form.name.trim()) err.name = "Product name is required"
    if (!form.description.trim()) err.description = "Description is required"
    if (!form.category.trim()) err.category = "Category is required"
    if (form.quantity_available === "" || isNaN(Number(form.quantity_available))) err.quantity_available = "Quantity is required"
    if (form.price === "" || isNaN(Number(form.price))) err.price = "Price is required"
    if (!form.unit.trim()) err.unit = "Unit is required"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const submit = () => {
    if (!validate()) return
    const fd = new FormData()
    fd.append("name", form.name)
    fd.append("description", form.description)
    fd.append("category", form.category)
    fd.append("quantity_available", String(form.quantity_available))
    fd.append("price", String(form.price))
    fd.append("unit", form.unit)
    fd.append("status", form.status)
    if (form.image) fd.append("image", form.image)
    onSave?.(fd, () => setEditMode(false))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editMode ? `Edit: ${product?.name}` : `Product Details`}
      actions={
        editMode ? (
          <>
            <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
            Edit
          </button>
        )
      }
    >
      {/* Image */}
      <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden mb-4">
        <img
          src={imageUrl || placeholderImg}
          alt={product?.name || "Product"}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = placeholderImg)}
        />
      </div>

      {/* Content */}
      {editMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Product Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
          <InputField
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            error={errors.category}
            placeholder="Select category"
            options={["Fertilizer", "Seeds", "Pesticide", "Tools", "Equipment", "Other"]}
          />
          <div className="md:col-span-2">
            <InputField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Detailed description"
            />
          </div>
          <InputField
            label="Quantity Available"
            name="quantity_available"
            type="number"
            min="0"
            value={form.quantity_available}
            onChange={handleChange}
            error={errors.quantity_available}
          />
          <InputField
            label="Unit"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            error={errors.unit}
            placeholder="Select unit"
            options={["kg", "liter", "piece", "bag", "ton", "gram"]}
          />
          <InputField
            label="Price per Unit ($)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            error={errors.price}
          />
          <InputField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={["Available", "Unavailable"]}
          />
          <div className="md:col-span-2">
            <ImageUploadField label="Product Image" name="image" onChange={handleImageChange} preview={preview} error={errors.image} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-xl font-semibold">{product?.name}</h4>
          <p className="text-gray-600">{product?.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FiLayers className="text-gray-500 text-sm" />
                <span className="text-xs text-gray-500">Quantity</span>
              </div>
              <p className="font-semibold text-gray-800">{product?.quantity_available} {product?.unit}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FiDollarSign className="text-gray-500 text-sm" />
                <span className="text-xs text-gray-500">Price</span>
              </div>
              <p className="font-semibold text-gray-800">${product?.price}/{product?.unit}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Category: {product?.category}</div>
          <div className="text-sm">
            Status:
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
              product?.status === "Available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            }`}>
              {product?.status}
            </span>
          </div>
        </div>
      )}
    </Modal>
  )
}

// Main page (TABLE instead of cards)
export default function ProductModalPage() {
  const dispatch = useDispatch()
  const {
    productsBySupplierUserId,
    loadingBySupplierUserId,
    errorBySupplierUserId,
    isLoading, // global (update/delete)
    error: globalError,
  } = useSelector((s) => s.product)

  const [userId, setUserId] = useState(null)
  useEffect(() => {
    if (typeof window !== "undefined") setUserId(localStorage.getItem("user_id"))
  }, [])

  const supplierKey = userId ? String(userId) : null
  const products = supplierKey ? (productsBySupplierUserId[supplierKey] || []) : []
  const loading = supplierKey ? !!loadingBySupplierUserId[supplierKey] : false
  const loadError = supplierKey ? errorBySupplierUserId[supplierKey] : null

  useEffect(() => {
    if (supplierKey) dispatch(listProductsBySupplier(supplierKey))
    return () => dispatch(clearProductState())
  }, [dispatch, supplierKey])

  const [modalOpen, setModalOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)

  const openView = (p) => {
    setModalProduct(p)
    setModalOpen(true)
  }
  const openEdit = (p) => {
    setModalProduct(p)
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
    setModalProduct(null)
  }

  const handleSave = (formData, after) => {
    if (!modalProduct?.id) return
    dispatch(updateProduct({ id: modalProduct.id, data: formData })).then((res) => {
      if (!res.error && supplierKey) {
        dispatch(listProductsBySupplier(supplierKey))
        after?.()
        closeModal()
      }
    })
  }

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    dispatch(deleteProduct(id)).then((res) => {
      if (!res.error && supplierKey) {
        dispatch(listProductsBySupplier(supplierKey))
        if (modalOpen && modalProduct?.id === id) closeModal()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FiBox className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                <p className="text-gray-600">View details and edit products in a modal</p>
              </div>
            </div>
            <button
              onClick={() => supplierKey && dispatch(listProductsBySupplier(supplierKey))}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
              disabled={loading || !supplierKey}
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">
            {loadError.detail || "Failed to load products"}
          </div>
        )}
        {globalError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">
            {typeof globalError === "string" ? globalError : globalError.detail || "Something went wrong"}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                      <div className="inline-flex items-center gap-2 text-blue-600">
                        <FiRefreshCw className="animate-spin" />
                        Loading products...
                      </div>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((p) => {
                    const imageUrl = resolveImageUrl(p.image || p.image_url)
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <img
                            src={imageUrl || placeholderImg}
                            alt={p.name}
                            className="h-12 w-12 rounded-md object-cover bg-gray-100"
                            onError={(e) => (e.currentTarget.src = placeholderImg)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{p.description}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{p.category}</td>
                        <td className="px-4 py-3 text-gray-700">{p.quantity_available}</td>
                        <td className="px-4 py-3 text-gray-700">{p.unit}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">${p.price}/{p.unit}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.status === "Available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openView(p)}
                              className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm inline-flex items-center gap-1"
                            >
                              <FiEye /> View
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              className="px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg text-sm inline-flex items-center gap-1"
                            >
                              <FiEdit3 /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm inline-flex items-center gap-1"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductDetailsModal
        open={modalOpen}
        onClose={closeModal}
        product={modalProduct}
        onSave={handleSave}
        isSaving={isLoading}
      />
    </div>
  )
}