"use client"

import React, { useEffect, useMemo, useState } from "react"
import { FiAlertCircle, FiCheckCircle, FiRefreshCw, FiX } from "react-icons/fi"

const InputField = React.memo(function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  options = null,
  ...props
}) {
  return (
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
          <option value="">{placeholder || "Select an option"}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            error ? "border-red-300" : "border-gray-200"
          }`}
          rows={4}
          {...props}
        />
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
})

const defaultCategories = ["Fertilizer", "Seeds", "Pesticide", "Tools", "Equipment", "Other"]
const defaultUnits = ["kg", "liter", "piece", "bag", "ton", "gram"]
const statusOptions = ["Available", "Unavailable"]

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) return ""
  return String(value)
}

export default function ProductForm({
  supplierUserId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialValues = null, // pass product to edit, else leave null for create
  categories = defaultCategories,
  units = defaultUnits,
}) {
  const mode = useMemo(() => (initialValues ? "edit" : "create"), [initialValues])

  const [form, setForm] = useState({
    supplier: supplierUserId || "",
    name: "",
    description: "",
    category: "",
    quantity_available: "",
    price: "",
    unit: "",
    status: "Available",
  })
  const [errors, setErrors] = useState({})

  // Seed initial values when editing
  useEffect(() => {
    if (initialValues) {
      setForm({
        supplier: initialValues.supplier ?? supplierUserId ?? "",
        name: initialValues.name ?? "",
        description: initialValues.description ?? "",
        category: initialValues.category ?? "",
        quantity_available: normalizeNumber(initialValues.quantity_available),
        price: normalizeNumber(initialValues.price),
        unit: initialValues.unit ?? "",
        status: initialValues.status ?? "Available",
      })
    } else {
      setForm((prev) => ({ ...prev, supplier: supplierUserId || "" }))
    }
  }, [initialValues, supplierUserId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    const err = {}
    if (!form.supplier) err.supplier = "Supplier ID is missing"
    if (!form.name.trim()) err.name = "Product name is required"
    if (!form.description.trim()) err.description = "Product description is required"
    if (!form.category.trim()) err.category = "Category is required"
    if (form.quantity_available === "" || isNaN(Number(form.quantity_available))) {
      err.quantity_available = "Quantity is required"
    }
    if (form.price === "" || isNaN(Number(form.price))) {
      err.price = "Price is required"
    }
    if (!form.unit.trim()) err.unit = "Unit is required"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    // Create payload; backend expects supplier as user id
    const payload = {
      supplier: form.supplier,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      quantity_available: Number(form.quantity_available),
      price: Number(form.price),
      unit: form.unit,
      status: form.status,
    }

    await onSubmit?.(payload)
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {mode === "edit" ? "Edit Product" : "Add New Product"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fillSampleData}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
          >
            Fill Sample Data
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <FiX />
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Product Name"
          name="name"
          placeholder="e.g. Premium Urea Fertilizer"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />

        <InputField
          label="Category"
          name="category"
          placeholder="Select category"
          options={categories}
          value={form.category}
          onChange={handleChange}
          error={errors.category}
        />

        <div className="md:col-span-2">
          <InputField
            label="Description"
            name="description"
            type="textarea"
            placeholder="Detailed product description"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
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
          error={errors.quantity_available}
        />

        <InputField
          label="Unit"
          name="unit"
          placeholder="Select unit"
          options={units}
          value={form.unit}
          onChange={handleChange}
          error={errors.unit}
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
          error={errors.price}
        />

        <InputField
          label="Status"
          name="status"
          placeholder="Select status"
          options={statusOptions}
          value={form.status}
          onChange={handleChange}
          error={errors.status}
        />
      </div>

      {errors.form && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="text-red-600" />
          <span className="text-red-700">{errors.form}</span>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <FiRefreshCw className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiCheckCircle />
              {mode === "edit" ? "Update Product" : "Add Product"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}