import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { listSuppliers } from '../../Redux/supplier/supplier_slice' // only for supplier list
import { listProductsBySupplier } from '../../Redux/product/productSlice'
import { Link } from 'react-router-dom'
import axios from '../../Redux/axiosInstance' // to get baseURL for media

const placeholderImg = 'https://via.placeholder.com/300x200?text=No+Image'
const apiBaseUrl = axios.defaults?.baseURL || ''

function resolveImageUrl(image) {
  if (!image) return placeholderImg
  if (typeof image !== 'string') return placeholderImg
  if (image.startsWith('http')) return image
  // If backend returns relative path like `/media/...`
  return `${apiBaseUrl.replace(/\/$/, '')}${image}`
}

const SupplierProductsPage = () => {
  const dispatch = useDispatch()

  const {
    suppliers,
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useSelector((state) => state.supplier)

  const {
    productsBySupplierUserId,
    loadingBySupplierUserId,
    errorBySupplierUserId,
  } = useSelector((state) => state.product)

  // Fetch suppliers on mount
  useEffect(() => {
    dispatch(listSuppliers())
  }, [dispatch])

  // After suppliers load, fetch products for each supplier (by supplier.user.id)
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

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Suppliers and Products</h1>

      {suppliersLoading && <div style={styles.info}>Loading suppliers…</div>}
      {suppliersError && (
        <div style={styles.error}>
          {suppliersError.detail || 'Failed to load suppliers'}
        </div>
      )}

      <div style={styles.supplierGrid}>
        {suppliers?.map((supplier) => {
          const supplierUserId = supplier?.user?.id
          const products = supplierUserId ? productsBySupplierUserId[supplierUserId] : []
          const loading = supplierUserId ? !!loadingBySupplierUserId[supplierUserId] : false
          const error = supplierUserId ? errorBySupplierUserId[supplierUserId] : null

          return (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              products={products}
              loading={loading}
              error={error}
            />
          )
        })}
      </div>
    </div>
  )
}

const SupplierCard = ({ supplier, products, loading, error }) => {
  return (
    <div style={styles.supplierCard}>
      <div style={styles.supplierHeader}>
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

      {loading && <div style={styles.info}>Loading products…</div>}
      {error && <div style={styles.error}>{error.detail || 'Failed to load products'}</div>}

      {!loading && !error && (
        <>
          {Array.isArray(products) && products.length > 0 ? (
            <div style={styles.productsGrid}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
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

const ProductCard = ({ product }) => {
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
          </div>
          <div style={styles.price}>
            {product.price} / {product.unit}
          </div>
        </div>
        {product.description && (
          <div style={styles.productDesc}>{product.description}</div>
        )}
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
        <Link to={`/products/${product.id}`} style={styles.viewLink}>
          View details →
        </Link>
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '24px' },
  title: { fontSize: 28, marginBottom: 16 },
  info: { padding: '8px 12px', background: '#f1f5f9', borderRadius: 8, display: 'inline-block' },
  error: { padding: '8px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, display: 'inline-block' },
  muted: { color: '#6b7280', fontStyle: 'italic' },

  supplierGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: 16 },
  supplierCard: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' },
  supplierHeader: { display: 'flex', alignItems: 'center', marginBottom: 8 },
  supplierInfo: { display: 'flex', flexDirection: 'column' },
  supplierName: { margin: 0 },
  meta: { color: '#6b7280', fontSize: 14 },

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
  imageWrap: { width: '100%', height: 140, overflow: 'hidden', background: '#f8fafc' },
  productImg: { width: '100%', height: '100%', objectFit: 'cover' },
  productBody: { padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  productTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontWeight: 600 },
  productCategory: { fontSize: 12, color: '#6b7280' },
  price: { fontWeight: 700 },
  productDesc: { fontSize: 13, color: '#4b5563' },
  productFooter: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' },
  viewLink: { marginTop: 8, color: '#2563eb', textDecoration: 'none', fontWeight: 600 },
}

export default SupplierProductsPage