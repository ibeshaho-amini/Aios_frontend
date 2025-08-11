import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { listSuppliers } from '../../Redux/supplier/supplier_slice'
import { listProductsBySupplier, listProducts } from '../../Redux/product/productSlice'
import { Link, useNavigate } from 'react-router-dom'

const placeholderImg = 'https://via.placeholder.com/300x200?text=No+Image'
const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '')

function resolveImageUrl(image) {
  if (!image || typeof image !== 'string') return placeholderImg
  if (image.startsWith('http')) return image
  return `${apiBaseUrl}${image}`
}

const fmtRWF = (value) => {
  const n = Number(value)
  if (Number.isNaN(n)) return 'RWF 0'
  try {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n)
  } catch {
    return `RWF ${n.toLocaleString()}`
  }
}

const MarketplacePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    suppliers,
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useSelector((state) => state.supplier)

  const {
    productsBySupplierUserId,
    loadingBySupplierUserId,
    errorBySupplierUserId,
    products: allProducts, // for fallback
  } = useSelector((state) => state.product)

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)
  const [modalSupplierName, setModalSupplierName] = useState('')
  const [orderQty, setOrderQty] = useState(1)

  // Fetch suppliers on mount
  useEffect(() => {
    dispatch(listSuppliers())
  }, [dispatch])

  // Fetch products per supplier
  useEffect(() => {
    if (!suppliers || suppliers.length === 0) return
    suppliers.forEach((s) => {
      const supplierUserId = s?.user?.id
      if (!supplierUserId) return
      const alreadyLoaded = Array.isArray(productsBySupplierUserId[supplierUserId])
      const isLoading = loadingBySupplierUserId[supplierUserId]
      if (!alreadyLoaded && !isLoading) {
        dispatch(listProductsBySupplier(supplierUserId))
      }
    })
  }, [dispatch, suppliers, productsBySupplierUserId, loadingBySupplierUserId])

  // Optional fallback: if no suppliers, load all products
  const useFallbackAllProducts = !suppliersLoading && (!suppliers || suppliers.length === 0)
  useEffect(() => {
    if (useFallbackAllProducts) dispatch(listProducts())
  }, [dispatch, useFallbackAllProducts])

  // Map product.supplier id -> supplier name
  const supplierNameById = useMemo(() => {
    const map = {}
    suppliers?.forEach((s) => {
      if (s?.user?.id != null) map[s.user.id] = s.name
      // also map supplier.id just in case product.supplier equals Supplier.id
      if (s?.id != null) map[s.id] = s.name
    })
    return map
  }, [suppliers])

  // Flatten all loaded products (for categories and filter bounds)
  const flattenedLoadedProducts = useMemo(() => {
    if (!suppliers) return []
    const list = []
    suppliers.forEach((s) => {
      const supplierUserId = s?.user?.id
      const prods = supplierUserId ? productsBySupplierUserId[supplierUserId] : []
      if (Array.isArray(prods)) list.push(...prods)
    })
    return list
  }, [suppliers, productsBySupplierUserId])

  const sourceProducts = useFallbackAllProducts ? allProducts : flattenedLoadedProducts

  const categories = useMemo(() => {
    const set = new Set()
    sourceProducts?.forEach((p) => p?.category && set.add(p.category))
    return Array.from(set).sort()
  }, [sourceProducts])

  const priceBounds = useMemo(() => {
    const prices = (sourceProducts || [])
      .map((p) => Number.parseFloat(p?.price))
      .filter((n) => !Number.isNaN(n))
    if (prices.length === 0) return { min: 0, max: 0 }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [sourceProducts])

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setStatus('')
    setMinPrice('')
    setMaxPrice('')
  }

  const filterProducts = (products) => {
    if (!Array.isArray(products)) return []
    const q = search.trim().toLowerCase()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    return products.filter((p) => {
      const nameMatch = !q || p?.name?.toLowerCase().includes(q) || p?.description?.toLowerCase().includes(q)
      const categoryMatch = !category || p?.category === category
      const statusMatch = !status || p?.status === status
      const priceVal = Number.parseFloat(p?.price)
      const priceMatch =
        (min === null || (!Number.isNaN(priceVal) && priceVal >= min)) &&
        (max === null || (!Number.isNaN(priceVal) && priceVal <= max))

      return nameMatch && categoryMatch && statusMatch && priceMatch
    })
  }

  const openModal = (product, supplierName) => {
    setModalProduct(product)
    setModalSupplierName(supplierName || supplierNameById[product?.supplier] || 'Unknown supplier')
    setOrderQty(1)
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
    setModalProduct(null)
  }

  const handleMakeOrder = () => {
    // Navigate to an order page with product and qty, or integrate your order flow here
    navigate(`/orders/new?product=${modalProduct.id}&qty=${orderQty}`)
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Marketplace</h1>

      {/* Filters */}
      <div style={styles.filtersWrap}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products or descriptions"
          style={styles.input}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
          <option value="">Any status</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <input
          type="number"
          placeholder={`Min ${fmtRWF(priceBounds.min)}`}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ ...styles.input, maxWidth: 160 }}
          min={0}
        />
        <input
          type="number"
          placeholder={`Max ${fmtRWF(priceBounds.max)}`}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ ...styles.input, maxWidth: 160 }}
          min={0}
        />

        <button onClick={clearFilters} style={styles.clearBtn}>Clear</button>
      </div>

      {suppliersLoading && <div style={styles.info}>Loading suppliers…</div>}
      {suppliersError && <div style={styles.error}>{suppliersError.detail || 'Failed to load suppliers'}</div>}

      {/* Fallback: All products if there are no suppliers */}
      {useFallbackAllProducts ? (
        <AllProductsSection
          products={filterProducts(allProducts)}
          supplierNameById={supplierNameById}
          onOpenModal={openModal}
        />
      ) : (
        <div style={styles.supplierGrid}>
          {suppliers?.map((supplier) => {
            const supplierUserId = supplier?.user?.id
            const products = supplierUserId ? productsBySupplierUserId[supplierUserId] : []
            const loading = supplierUserId ? !!loadingBySupplierUserId[supplierUserId] : false
            const error = supplierUserId ? errorBySupplierUserId[supplierUserId] : null

            const filtered = filterProducts(products)

            // Hide suppliers with zero matching products
            if (!loading && !error && filtered.length === 0) return null

            return (
              <SupplierSection
                key={supplier.id}
                supplier={supplier}
                products={filtered}
                loading={loading}
                error={error}
                onOpenModal={openModal}
              />
            )
          })}
        </div>
      )}

      <ProductModal
        open={modalOpen}
        onClose={closeModal}
        product={modalProduct}
        supplierName={modalSupplierName}
        orderQty={orderQty}
        setOrderQty={setOrderQty}
        onMakeOrder={handleMakeOrder}
      />
    </div>
  )
}

const SupplierSection = ({ supplier, products, loading, error, onOpenModal }) => {
  const logoUrl = resolveImageUrl(supplier.logo)

  return (
    <div style={styles.supplierCard}>
      <div style={styles.supplierHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={styles.logoWrap}>
            {supplier.logo ? (
              <img src={logoUrl} alt={supplier.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={styles.logoFallback}>{supplier.name?.charAt(0) || 'S'}</div>
            )}
          </div>
          <div style={styles.supplierInfo}>
            <h2 style={styles.supplierName}>{supplier.name}</h2>
            <div style={styles.meta}>
              <span>{supplier.location}</span>
              <span style={{ marginLeft: 8, color: supplier.status === 'Active' ? '#16a34a' : '#ef4444' }}>
                {supplier.status}
              </span>
            </div>
          </div>
        </div>
        <Link to={`/suppliers/${supplier.id}`} style={styles.viewSupplierLink}>Visit store →</Link>
      </div>

      {loading && <div style={styles.info}>Loading products…</div>}
      {error && <div style={styles.error}>{error.detail || 'Failed to load products'}</div>}

      {!loading && !error && (
        <>
          {Array.isArray(products) && products.length > 0 ? (
            <div style={styles.productsGrid}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} supplierName={supplier.name} onOpenModal={onOpenModal} />
              ))}
            </div>
          ) : (
            <div style={styles.muted}>No products available.</div>
          )}
        </>
      )}
    </div>
  )
}

const AllProductsSection = ({ products, supplierNameById, onOpenModal }) => {
  return (
    <div style={styles.supplierCard}>
      <div style={styles.supplierHeader}>
        <h2 style={styles.supplierName}>All Products</h2>
        <div style={{ color: '#6b7280' }}>{products?.length || 0} items</div>
      </div>
      {Array.isArray(products) && products.length > 0 ? (
        <div style={styles.productsGrid}>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              supplierName={supplierNameById[p.supplier] || 'Unknown supplier'}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>
      ) : (
        <div style={styles.muted}>No products found.</div>
      )}
    </div>
  )
}

const ProductCard = ({ product, supplierName, onOpenModal }) => {
  const imageUrl = resolveImageUrl(product.image || product.image_url)

  return (
    <div style={styles.productCard}>
      <div style={styles.imageWrap}>
        <img
          src={imageUrl}
          alt={product.name}
          style={styles.productImg}
          onError={(e) => (e.currentTarget.src = placeholderImg)}
        />
      </div>
      <div style={styles.productBody}>
        <div style={styles.productTop}>
          <div>
            <div style={styles.productName}>{product.name}</div>
            <div style={styles.productCategory}>{product.category}</div>
            {supplierName && <div style={styles.productSupplier}>by {supplierName}</div>}
          </div>
          <div style={styles.price}>
            {fmtRWF(product.price)} / {product.unit}
          </div>
        </div>
        {product.description && <div style={styles.productDesc}>{product.description}</div>}
        <div style={styles.productFooter}>
          <span>Qty: {product.quantity_available}</span>
          <span
            style={{
              color: product.status === 'Available' ? '#16a34a' : '#ef4444',
              fontWeight: 600,
            }}
          >
            {product.status}
          </span>
        </div>
        <div style={styles.cardActions}>
          <button onClick={() => onOpenModal(product, supplierName)} style={styles.btnPrimary}>
            View
          </button>
          <button onClick={() => onOpenModal(product, supplierName)} style={styles.btnSecondary}>
            Order
          </button>
        </div>
      </div>
    </div>
  )
}

const ProductModal = ({ open, onClose, product, supplierName, orderQty, setOrderQty, onMakeOrder }) => {
  if (!open || !product) return null
  const imageUrl = resolveImageUrl(product.image || product.image_url)
  const total = Number(product.price) * Number(orderQty || 0)

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>{product.name}</h3>
          <button onClick={onClose} style={styles.modalClose}>×</button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.modalImageWrap}>
            <img
              src={imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => (e.currentTarget.src = placeholderImg)}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#6b7280' }}>{product.category}</div>
            <div style={{ fontSize: 16 }}>{product.description}</div>
            <div><strong>Supplier:</strong> {supplierName || 'Unknown supplier'}</div>
            <div><strong>Status:</strong> {product.status}</div>
            <div><strong>Available:</strong> {product.quantity_available} {product.unit}</div>
            <div style={{ fontWeight: 700 }}>{fmtRWF(product.price)} / {product.unit}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <label htmlFor="qty"><strong>Quantity:</strong></label>
              <input
                id="qty"
                type="number"
                min="1"
                max={Number(product.quantity_available) || undefined}
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                style={styles.qtyInput}
              />
              <span style={{ color: '#6b7280' }}>Total: {fmtRWF(total)}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={onMakeOrder} style={styles.btnPrimary}>Make Order</button>
              <Link to={`/products/${product.id}`} style={{ ...styles.btnLink }}>Go to detail</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '24px' },
  title: { fontSize: 28, marginBottom: 16 },

  // Filters
  filtersWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
    background: '#fff',
    padding: 12,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
  },
  input: {
    flex: '1 1 220px',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    outline: 'none',
  },
  select: {
    flex: '0 1 200px',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    outline: 'none',
    background: '#fff',
  },
  clearBtn: {
    padding: '10px 14px',
    borderRadius: 10,
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
  },

  info: { padding: '8px 12px', background: '#f1f5f9', borderRadius: 8, display: 'inline-block' },
  error: { padding: '8px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, display: 'inline-block' },
  muted: { color: '#6b7280', fontStyle: 'italic' },

  supplierGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: 16 },
  supplierCard: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' },
  supplierHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  supplierInfo: { display: 'flex', flexDirection: 'column' },
  supplierName: { margin: 0, fontSize: 20 },
  meta: { color: '#6b7280', fontSize: 14 },
  viewSupplierLink: { color: '#2563eb', fontWeight: 600, textDecoration: 'none' },

  logoWrap: { width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoFallback: { fontWeight: 700, color: '#4f46e5' },

  productsGrid: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 12,
  },

  productCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
  },
  imageWrap: { width: '100%', height: 160, overflow: 'hidden', background: '#f8fafc' },
  productImg: { width: '100%', height: '100%', objectFit: 'cover' },
  productBody: { padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  productTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontWeight: 600 },
  productCategory: { fontSize: 12, color: '#6b7280' },
  productSupplier: { fontSize: 12, color: '#6b7280' },
  price: { fontWeight: 700 },
  productDesc: { fontSize: 13, color: '#4b5563' },
  productFooter: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' },
  cardActions: { display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8 },
  btnPrimary: { padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 },
  btnSecondary: { padding: '8px 12px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 },
  btnLink: { padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none' },

  // Modal
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modalCard: { width: 'min(900px, 96vw)', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' },
  modalClose: { background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', lineHeight: 1 },
  modalBody: { display: 'flex', gap: 16, padding: 16 },
  modalImageWrap: { width: 380, height: 280, background: '#f3f4f6', borderRadius: 12, overflow: 'hidden' },
  qtyInput: { width: 100, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' },
}

export default MarketplacePage