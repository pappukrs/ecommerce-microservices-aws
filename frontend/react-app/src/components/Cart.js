import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../CartContext';
import { useProducts } from '../ProductsContext';
import { useToast } from '../ToastContext';
import { formatPrice } from '../format';
import EmptyState from './EmptyState';
import { AlertIcon, ArrowRightIcon, BagIcon, CheckIcon, MinusIcon, PlusIcon, TrashIcon, UserIcon } from './Icons';
import './Cart.css';

function Cart({ user, onSignInClick }) {
  const { items, cartCount, loading, error, refreshCartCount } = useCart();
  const { productMap, loadProducts } = useProducts();
  const showToast = useToast();
  const [busyId, setBusyId] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleQuantity = async (item, quantity) => {
    if (quantity < 1) return;
    setBusyId(item.product_id);
    try {
      await api.updateCartItem(item.product_id, quantity);
      await refreshCartCount(); // Update cart badge
    } catch (err) {
      showToast('Could not update the quantity', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      await api.removeFromCart(productId);
      await refreshCartCount(); // Update cart badge
      showToast('Item removed');
    } catch (err) {
      showToast('Could not remove the item', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckout = async () => {
    setPlacing(true);
    try {
      const order = await api.createOrder();
      setPlacedOrder(order);
      await refreshCartCount(); // Update cart badge
      loadProducts({ silent: true }); // Stock changed
    } catch (err) {
      showToast(err.message || 'Could not place the order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!user) {
    return (
      <div className="container page">
        <EmptyState
          icon={<UserIcon size={28} />}
          title="Sign in to view your cart"
          text="Your cart is saved to your account."
        >
          <button className="btn btn-primary" onClick={onSignInClick}>Sign in</button>
        </EmptyState>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="container page">
        <EmptyState
          icon={<CheckIcon size={28} />}
          title="Order placed"
          text={`Order #${placedOrder.id} for ${formatPrice(placedOrder.total_amount)} is confirmed.`}
        >
          <Link to="/orders" className="btn btn-primary">View orders</Link>
          <Link to="/" className="btn btn-secondary">Keep shopping</Link>
        </EmptyState>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container page" aria-busy="true" aria-label="Loading cart">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
      </div>
    );
  }

  if (error && !items.length) {
    return (
      <div className="container page">
        <EmptyState
          icon={<AlertIcon size={28} />}
          title="We couldn't load your cart"
          text="Check your connection and try again."
        >
          <button className="btn btn-primary" onClick={refreshCartCount}>Try again</button>
        </EmptyState>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container page">
        <EmptyState
          icon={<BagIcon size={28} />}
          title="Your cart is empty"
          text="Add a few products and they will show up here."
        >
          <Link to="/" className="btn btn-primary">Browse products</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page cart">
      <div className="page-header">
        <h1>Your cart</h1>
        <span className="page-meta">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="cart-layout">
        <ul className="cart-items">
          {items.map(item => {
            const product = productMap[item.product_id];
            const busy = busyId === item.product_id;
            return (
              <li key={item.product_id} className={`cart-item ${busy ? 'is-busy' : ''}`}>
                <div className="thumb">
                  {product?.image_url && <img src={product.image_url} alt="" />}
                </div>
                <div className="item-info">
                  <h3>{product?.name || item.product_id}</h3>
                  <p>{formatPrice(item.price)} each</p>
                </div>
                <div className="stepper" role="group" aria-label={`Quantity of ${product?.name || item.product_id}`}>
                  <button
                    onClick={() => handleQuantity(item, item.quantity - 1)}
                    disabled={busy || item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon size={16} />
                  </button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantity(item, item.quantity + 1)}
                    disabled={busy}
                    aria-label="Increase quantity"
                  >
                    <PlusIcon size={16} />
                  </button>
                </div>
                <p className="subtotal">{formatPrice(item.price * item.quantity)}</p>
                <button
                  className="icon-btn remove-btn"
                  onClick={() => handleRemove(item.product_id)}
                  disabled={busy}
                  aria-label={`Remove ${product?.name || item.product_id}`}
                >
                  <TrashIcon size={18} />
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <dl>
            <div>
              <dt>Items</dt>
              <dd>{cartCount}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <button className="btn btn-primary btn-block" onClick={handleCheckout} disabled={placing}>
            {placing ? 'Placing order…' : 'Place order'}
            {!placing && <ArrowRightIcon size={16} />}
          </button>
          <Link to="/" className="summary-link">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
