"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  createProduct,
  listProductsBySupplier,
  clearProductState,
} from "../../Redux/product/productSlice"
import { FiBox, FiPlus, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

const ProductPage = () => {
  const dispatch = useDispatch()
  const { supplierProducts, isLoading, error, success } = useSelector((state) => state.product)

  // Get supplier_id from localStorage (set this after supplier profile setup)
  const supplierId = localStorage.getItem("supplier_id")

  // Product form state
  const [form, setForm] = useState({
    supplier: supplierId || "",
    name: "",
    category: "",
    quantity_available: "",
    price: "",
    unit: "",
    status: "Available",
  })
  const [formErrors, setFormErrors] = useState({})

  // Fetch products for this supplier on mount
  useEffect(() => {
    if (supplierId) {
      dispatch(listProductsBySupplier(supplierId))
    }
    // Clear product state on unmount
    return () => dispatch(clearProductState())
  }, [dispatch, supplierId])

  // If supplierId changes (e.g. after profile setup), update form
  useEffect(() => {
    setForm((prev) => ({ ...prev, supplier: supplierId }))
  }, [supplierId])

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = "Product name is required"
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
        dispatch(listProductsBySupplier(supplierId))
        setForm({
          supplier: supplierId,
          name: "",
          category: "",
          quantity_available: "",
          price: "",
          unit: "",
          status: "Available",
        })
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-800">
        <FiBox /> Supplier Products
      </h2>

      {/* Product Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
          <FiPlus /> Add New Product
        </h3>
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 mb-4">
            <FiCheckCircle className="text-green-600" />
            <span className="text-green-700">Product added successfully!</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
            <FiAlertCircle className="text-red-600" />
            <span className="text-red-700">
              {typeof error === "string" ? error : error.detail || error.message || "Something went wrong."}
            </span>
          </div>
        )}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.name ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="e.g. Urea"
            />
            {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.category ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="e.g. Fertilizer"
            />
            {formErrors.category && <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
            <input
              type="number"
              name="quantity_available"
              value={form.quantity_available}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.quantity_available ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="e.g. 100"
              min="0"
            />
            {formErrors.quantity_available && <p className="text-xs text-red-600 mt-1">{formErrors.quantity_available}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.price ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="e.g. 500.00"
              min="0"
              step="0.01"
            />
            {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.unit ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="e.g. kg, liter"
            />
            {formErrors.unit && <p className="text-xs text-red-600 mt-1">{formErrors.unit}</p>}
          </div>
          {/* Status is hidden, always "Available" */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
          <FiBox /> Your Products
        </h3>
        {isLoading && <div className="text-blue-600">Loading products...</div>}
        {supplierProducts && supplierProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3 text-left">Category</th>
                  <th className="py-2 px-3 text-left">Quantity</th>
                  <th className="py-2 px-3 text-left">Unit</th>
                  <th className="py-2 px-3 text-left">Price</th>
                  <th className="py-2 px-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {supplierProducts.map((product) => (
                  <tr key={product.id} className="border-t border-gray-100">
                    <td className="py-2 px-3">{product.name}</td>
                    <td className="py-2 px-3">{product.category}</td>
                    <td className="py-2 px-3">{product.quantity_available}</td>
                    <td className="py-2 px-3">{product.unit}</td>
                    <td className="py-2 px-3">{product.price}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500">No products found. Add your first product above.</div>
        )}
      </div>
    </div>
  )
}

export default ProductPage