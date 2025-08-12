"use client"

import React, { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getCart, updateCartItem, removeCartItem, checkoutCart } from "../Redux/order/cartSlice"
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiCheck } from "react-icons/fi"

const placeholderImg = "https://via.placeholder.com/300x200?text=No+Image"
const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "")

function resolveImageUrl(image) {
  if (!image || typeof image !== "string") return placeholderImg
  if (image.startsWith("http")) return image
  return `${apiBaseUrl}${image}`
}

const fmtRWF = (value) => {
  const n = Number(value)
  if (Number.isNaN(n)) return "RWF 0"
  try {
    return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(n)
  } catch {
    return `RWF ${n.toLocaleString()}`
  }
}

export default function CartDrawer({ open, onClose, productIndex = {} }) {
  const dispatch = useDispatch()
  const { cart, isLoading, error, checkoutResult } = useSelector((s) => s.cart || {})

  useEffect(() => {
    if (open) dispatch(getCart())
  }, [open, dispatch])

  const items = cart?.items || []

  const enrichedItems = useMemo(() => {
    return items.map((it) => {
      const p = productIndex[it.product] || it.product_detail || {}
      return {
        ...it,
        name: p.name || `Product #${it.product}`,
        unit: p.unit || "",
        image: p.image || p.image_url || null,
        currentPrice: p.price != null ? Number(p.price) : null,
      }
    })
  }, [items, productIndex])

  const total = enrichedItems.reduce((sum, it) => {
    const price = it.price_at_order != null ? Number(it.price_at_order) : (it.currentPrice || 0)
    return sum + price * Number(it.quantity || 0)
  }, 0)

  const setQty = (itemId, next) => {
    const qty = Number(next)
    if (Number.isNaN(qty)) return
    dispatch(updateCartItem({ itemId, quantity: qty }))
  }

  const removeItem = (itemId) => {
    dispatch(removeCartItem(itemId))
  }

  const checkout = () => {
    dispatch(checkoutCart())
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FiShoppingCart className="text-xl" />
            </div>
            <div>
              <h3 className="m-0 font-semibold text-lg">Your Cart</h3>
              <p className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Close cart"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {typeof error === "string" ? error : error.detail || "Something went wrong"}
          </div>
        )}

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {isLoading && items.length === 0 ? (
            <div className="text-blue-600">Loading cart…</div>
          ) : items.length === 0 ? (
            <div className="text-gray-500">Your cart is empty</div>
          ) : (
            enrichedItems.map((it) => {
              const img = resolveImageUrl(it.image)
              const price = it.price_at_order != null ? Number(it.price_at_order) : (it.currentPrice || 0)
              const lineTotal = price * Number(it.quantity || 0)

              return (
                <div key={it.id} className="border border-gray-100 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={img}
                      alt={it.name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = placeholderImg)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{it.name}</div>
                    <div className="text-xs text-gray-500">
                      {fmtRWF(price)} {it.unit ? ` / ${it.unit}` : ""}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQty(it.id, Math.max(0, Number(it.quantity) - 1))}
                        className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        disabled={isLoading}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={it.quantity}
                        onChange={(e) => setQty(it.id, e.target.value)}
                        className="w-16 px-2 py-1 rounded-md border border-gray-200 text-center"
                        disabled={isLoading}
                      />
                      <button
                        onClick={() => setQty(it.id, Number(it.quantity) + 1)}
                        className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        disabled={isLoading}
                        aria-label="Increase quantity"
                      >
                        <FiPlus />
                      </button>

                      <button
                        onClick={() => removeItem(it.id)}
                        className="ml-2 px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 text-sm inline-flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="font-semibold text-gray-900">{fmtRWF(lineTotal)}</div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-600">Total</div>
            <div className="text-lg font-bold">{fmtRWF(total)}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Continue shopping
            </button>
            <button
              onClick={checkout}
              disabled={isLoading || items.length === 0}
              className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Placing…" : "Checkout"}
            </button>
          </div>

          {Array.isArray(checkoutResult) && checkoutResult.length > 0 && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              <FiCheck />
              Order placed! Created {checkoutResult.length} order{checkoutResult.length !== 1 ? "s" : ""}.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}