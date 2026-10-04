import React, { useMemo, useState } from 'react';
import { api } from '../api';
import { useCart } from '../CartContext';
import { useProducts } from '../ProductsContext';
import { useToast } from '../ToastContext';
import { formatPrice } from '../format';
import EmptyState from './EmptyState';
import ProductModal from './ProductModal';
import { AlertIcon, CheckIcon, PlusIcon, SearchIcon } from './Icons';
import './Products.css';

const LOW_STOCK = 10;

const SORTS = {
  featured: { label: 'Featured', compare: null },
  priceAsc: { label: 'Price: low to high', compare: (a, b) => a.price - b.price },
  priceDesc: { label: 'Price: high to low', compare: (a, b) => b.price - a.price },
  name: { label: 'Name: A to Z', compare: (a, b) => a.name.localeCompare(b.name) },
};

function Products({ user, onSignInClick }) {
  const { products, loading, error, loadProducts } = useProducts();
  const { items, refreshCartCount } = useCart();
  const showToast = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [selected, setSelected] = useState(null);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map(product => product.category))).sort()],
    [products]
  );

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = products.filter(product =>
      (category === 'All' || product.category === category) &&
      (!term || `${product.name} ${product.description}`.toLowerCase().includes(term))
    );
    const { compare } = SORTS[sort];
    return compare ? [...filtered].sort(compare) : filtered;
  }, [products, query, category, sort]);

  // One product from each category for the hero, largest categories first
  const featured = useMemo(() => {
    const byCategory = {};
    products.forEach(product => {
      (byCategory[product.category] = byCategory[product.category] || []).push(product);
    });
    return Object.values(byCategory)
      .sort((a, b) => b.length - a.length)
      .slice(0, 3)
      .map(group => group[0]);
  }, [products]);

  const lowestPrice = products.length ? Math.min(...products.map(product => product.price)) : 0;

  const quantityInCart = (productId) =>
    items.find(item => item.product_id === productId)?.quantity || 0;

  // Resolves to true when the item was added
  const handleAddToCart = async (product, quantity = 1) => {
    if (!user) {
      setSelected(null);
      onSignInClick();
      return false;
    }
    setAddingId(product.product_id);
    try {
      await api.addToCart(product.product_id, quantity, product.price);
      await refreshCartCount(); // Update cart badge
      setAddedId(product.product_id);
      setTimeout(() => setAddedId(current => (current === product.product_id ? null : current)), 1600);
      showToast(quantity > 1 ? `Added ${quantity} × ${product.name} to cart` : `Added ${product.name} to cart`);
      return true;
    } catch (err) {
      showToast('Could not add to cart. Please try again.', 'error');
      return false;
    } finally {
      setAddingId(null);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
  };

  return (
    <div className="products">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Workspace store</p>
            <h1>Tech and essentials for a better workspace.</h1>
            <p className="hero-sub">Browse electronics, accessories and furniture, then check out in a couple of clicks.</p>
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
            </label>
            {!loading && !error && products.length > 0 && (
              <dl className="hero-stats">
                <div>
                  <dt>Products</dt>
                  <dd>{products.length}</dd>
                </div>
                <div>
                  <dt>Categories</dt>
                  <dd>{categories.length - 1}</dd>
                </div>
                <div>
                  <dt>Prices from</dt>
                  <dd>{formatPrice(lowestPrice)}</dd>
                </div>
              </dl>
            )}
          </div>
          <div className="hero-collage" aria-hidden={loading || !featured.length}>
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="skeleton collage-tile" />)
            ) : (
              featured.map(product => (
                <button key={product.product_id} className="collage-tile" onClick={() => setSelected(product)}>
                  <img src={product.image_url} alt={product.name} />
                  <span className="collage-caption">
                    <span>{product.name}</span>
                    <strong>{formatPrice(product.price)}</strong>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="container catalog">
        {loading ? (
          <div className="product-grid" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="product-card product-skeleton">
                <div className="skeleton product-media" />
                <div className="product-body">
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line medium" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<AlertIcon size={28} />}
            title="We couldn't load the products"
            text="Check your connection and try again."
          >
            <button className="btn btn-primary" onClick={() => loadProducts()}>Try again</button>
          </EmptyState>
        ) : (
          <>
            <div className="toolbar">
              <div className="chips" role="group" aria-label="Filter by category">
                {categories.map(name => (
                  <button
                    key={name}
                    className={`chip ${category === name ? 'chip-active' : ''}`}
                    onClick={() => setCategory(name)}
                    aria-pressed={category === name}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="toolbar-right">
                <span className="result-count">
                  {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
                </span>
                <select
                  className="select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort products"
                >
                  {Object.entries(SORTS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {!visibleProducts.length ? (
              <EmptyState
                icon={<SearchIcon size={28} />}
                title="No products found"
                text="Try a different search term or category."
              >
                <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
              </EmptyState>
            ) : (
              <div className="product-grid">
                {visibleProducts.map(product => {
                  const inCart = quantityInCart(product.product_id);
                  const soldOut = product.stock <= 0;
                  const adding = addingId === product.product_id;
                  const added = addedId === product.product_id;
                  return (
                    <article key={product.product_id} className="product-card">
                      <div className="product-media">
                        <button
                          className="product-media-btn"
                          onClick={() => setSelected(product)}
                          aria-label={`View ${product.name}`}
                        >
                          <img src={product.image_url} alt={product.name} loading="lazy" />
                          <span className="quick-view-hint">Quick view</span>
                        </button>
                        {soldOut ? (
                          <span className="pill pill-neutral media-badge">Sold out</span>
                        ) : product.stock <= LOW_STOCK && (
                          <span className="pill pill-warning media-badge">Only {product.stock} left</span>
                        )}
                        {inCart > 0 && <span className="pill pill-accent media-badge media-badge-right">{inCart} in cart</span>}
                      </div>
                      <div className="product-body">
                        <span className="product-category">{product.category}</span>
                        <h3>
                          <button className="product-title-btn" onClick={() => setSelected(product)}>
                            {product.name}
                          </button>
                        </h3>
                        <p>{product.description}</p>
                        <div className="product-footer">
                          <span className="price">{formatPrice(product.price)}</span>
                          <button
                            className={`btn btn-sm ${added ? 'btn-success' : 'btn-primary'}`}
                            onClick={() => handleAddToCart(product)}
                            disabled={soldOut || adding}
                          >
                            {added ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
                            {soldOut ? 'Sold out' : added ? 'Added' : adding ? 'Adding…' : 'Add to cart'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {selected && (
        <ProductModal
          product={selected}
          inCart={quantityInCart(selected.product_id)}
          lowStock={LOW_STOCK}
          onAdd={handleAddToCart}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default Products;
