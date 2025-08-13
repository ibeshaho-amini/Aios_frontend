"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { listOrders } from "../../Redux/order/orderSlice"
import { FiRefreshCw, FiSearch, FiEye, FiX } from "react-icons/fi"

const fmtRWF = (value) => {
  const n = Number(value)
  if (Number.isNaN(n)) return "RWF 0"
  try {
    return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(n)
  } catch {
    return `RWF ${n.toLocaleString()}`
  }
}

const fmtDateTime = (iso) => {
  if (!iso) return "-"
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}

const badgeByStatus = (status) => {
  const base = "px-2 py-1 rounded-full text-xs font-semibold"
  switch ((status || "").toLowerCase()) {
    case "pending": return `${base} bg-yellow-100 text-yellow-700`
    case "approved": return `${base} bg-green-100 text-green-700`
    case "completed": return `${base} bg-emerald-100 text-emerald-700`
    case "rejected": return `${base} bg-red-100 text-red-700`
    case "cart": return `${base} bg-gray-100 text-gray-700`
    default: return `${base} bg-gray-100 text-gray-700`
  }
}

export default function FarmerOrdersPage() {
  const dispatch = useDispatch()
  const { orders = [], isLoading, error } = useSelector((s) => s.order || {})

  // Logged-in farmer (buyer) id
  const buyerUserId = useMemo(() => {
    const id = localStorage.getItem("user_id")
    return id ? Number(id) : null
  }, [])

  const [statusFilter, setStatusFilter] = useState("")
  const [q, setQ] = useState("")
  const [expanded, setExpanded] = useState({}) // orderID -> boolean
  const [viewOrder, setViewOrder] = useState(null)

  useEffect(() => {
    dispatch(listOrders())
  }, [dispatch])

  // Only this buyer’s orders
  const myOrders = useMemo(() => {
    if (!buyerUserId) return []
    return (orders || []).filter((o) => Number(o?.user) === buyerUserId)
  }, [orders, buyerUserId])

  // Filters and search
  const filteredOrders = useMemo(() => {
    const text = q.trim().toLowerCase()
    return myOrders.filter((o) => {
      const statusOk = !statusFilter || (o?.status || "").toLowerCase() === statusFilter
      if (!statusOk) return false
      if (!text) return true
      // Search by supplier username, orderID, status
      const supplier = (o?.supplier_username || "").toLowerCase()
      const oid = String(o?.orderID || "").toLowerCase()
      const st = (o?.status || "").toLowerCase()
      return supplier.includes(text) || oid.includes(text) || st.includes(text)
    })
  }, [myOrders, statusFilter, q])

  const totalAmount = (order) => {
    const items = order?.items || []
    return items.reduce((sum, it) => {
      const price = it?.price_at_order != null ? Number(it.price_at_order) : 0
      return sum + price * Number(it.quantity || 0)
    }, 0)
  }

  const toggleExpand = (orderID) => setExpanded((prev) => ({ ...prev, [orderID]: !prev[orderID] }))
  const openModal = (order) => setViewOrder(order)
  const closeModal = () => setViewOrder(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-2xl p-5 mb-6 border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
              <p className="text-sm text-gray-600">Current placed Orders</p>
            </div>
            <button
              onClick={() => dispatch(listOrders())}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition"
              disabled={isLoading}
            >
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-2xl p-4 mb-6 border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by order ID, supplier, status"
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border-gray-200"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border-gray-200 bg-white"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredOrders.length}</span> of{" "}
                <span className="font-semibold">{myOrders.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {typeof error === "string" ? error : error.detail || "Failed to load orders"}
          </div>
        )}

        {/* Orders table */}
        <div className="bg-white shadow rounded-2xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-3">Order ID</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-3">Supplier</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-3">Items</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-3">Total</th>
                  <th className="text-right text-xs font-semibold text-gray-600 uppercase px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading && filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center px-4 py-10 text-blue-600">Loading orders…</td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => {
                    const total = totalAmount(o)
                    const isOpen = !!expanded[o.orderID]
                    return (
                      <React.Fragment key={o.orderID}>
                        <tr className="hover:bg-gray-50/60">
                          <td className="px-4 py-3 font-semibold text-gray-800">#{o.orderID}</td>
                          <td className="px-4 py-3 text-gray-800">@{o.supplier_username || o.supplier}</td>
                          <td className="px-4 py-3 text-gray-700">{fmtDateTime(o.orderDate)}</td>
                          <td className="px-4 py-3"><span className={badgeByStatus(o.status)}>{o.status}</span></td>
                          <td className="px-4 py-3 text-gray-700">{o.items?.length || 0}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{fmtRWF(total)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleExpand(o.orderID)}
                                className="px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                              >
                                {isOpen ? "Hide items" : "View items"}
                              </button>
                              <button
                                onClick={() => setViewOrder(o)}
                                className="px-3 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm inline-flex items-center gap-1"
                              >
                                <FiEye /> Details
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td colSpan={7} className="px-4 pb-4">
                              <div className="mt-2 border rounded-xl overflow-hidden">
                                <table className="min-w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="text-left text-xs font-semibold text-gray-600 uppercase px-3 py-2">Product</th>
                                      <th className="text-left text-xs font-semibold text-gray-600 uppercase px-3 py-2">Qty</th>
                                      <th className="text-left text-xs font-semibold text-gray-600 uppercase px-3 py-2">Price</th>
                                      <th className="text-left text-xs font-semibold text-gray-600 uppercase px-3 py-2">Line total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100">
                                    {(o.items || []).map((it) => {
                                      const price = it?.price_at_order != null ? Number(it.price_at_order) : 0
                                      const line = price * Number(it.quantity || 0)
                                      return (
                                        <tr key={it.id}>
                                          <td className="px-3 py-2 text-gray-800">{it.product_name || `#${it.product}`}</td>
                                          <td className="px-3 py-2 text-gray-700">{it.quantity}</td>
                                          <td className="px-3 py-2 text-gray-700">{fmtRWF(price)}</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900">{fmtRWF(line)}</td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center px-4 py-10 text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        <OrderDetailsModal order={viewOrder} onClose={closeModal} />
      </div>
    </div>
  )
}

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null
  const total = (order.items || []).reduce((sum, it) => {
    const price = it?.price_at_order != null ? Number(it.price_at_order) : 0
    return sum + price * Number(it.quantity || 0)
  }, 0)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Order #{order.orderID}</h3>
              <p className="text-sm text-gray-500">
                Supplier @{order.supplier_username || order.supplier} • {fmtDateTime(order.orderDate)}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <FiX className="text-xl" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className={badgeByStatus(order.status)}>{order.status}</span>
              <span className="text-gray-600">Total:</span>
              <span className="font-bold">{fmtRWF(total)}</span>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase px-3 py-2">Product</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase px-3 py-2">Qty</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase px-3 py-2">Price</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase px-3 py-2">Line total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {(order.items || []).map((it) => {
                    const price = it?.price_at_order != null ? Number(it.price_at_order) : 0
                    const line = price * Number(it.quantity || 0)
                    return (
                      <tr key={it.id}>
                        <td className="px-3 py-2 text-gray-800">{it.product_name || `#${it.product}`}</td>
                        <td className="px-3 py-2 text-gray-700">{it.quantity}</td>
                        <td className="px-3 py-2 text-gray-700">{fmtRWF(price)}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900">{fmtRWF(line)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-sm text-gray-500">
              Buyer (you): @{order.user_username || order.user}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}