import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useProducts } from '../ProductsContext';
import { formatDate, formatPrice } from '../format';
import EmptyState from './EmptyState';
import { AlertIcon, PackageIcon, UserIcon } from './Icons';
import './Orders.css';

const STATUS_PILLS = {
  pending: 'pill-warning',
  confirmed: 'pill-success',
  completed: 'pill-success',
  delivered: 'pill-success',
  cancelled: 'pill-danger',
};

function Orders({ user, onSignInClick }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { productMap } = useProducts();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      const list = Array.isArray(data) ? data : [];
      setOrders([...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setError(false);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadOrders();
    else setLoading(false);
  }, [user, loadOrders]);

  if (!user) {
    return (
      <div className="container page">
        <EmptyState
          icon={<UserIcon size={28} />}
          title="Sign in to view your orders"
          text="Your order history is saved to your account."
        >
          <button className="btn btn-primary" onClick={onSignInClick}>Sign in</button>
        </EmptyState>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container page" aria-busy="true" aria-label="Loading orders">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-row tall" />
        <div className="skeleton skeleton-row tall" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <EmptyState
          icon={<AlertIcon size={28} />}
          title="We couldn't load your orders"
          text="Check your connection and try again."
        >
          <button className="btn btn-primary" onClick={loadOrders}>Try again</button>
        </EmptyState>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="container page">
        <EmptyState
          icon={<PackageIcon size={28} />}
          title="No orders yet"
          text="When you place an order it will appear here."
        >
          <Link to="/" className="btn btn-primary">Browse products</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page orders">
      <div className="page-header">
        <h1>Your orders</h1>
        <span className="page-meta">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <article key={order.id} className="order-card">
            <header className="order-header">
              <div>
                <h3>Order #{order.id}</h3>
                <p className="order-date">Placed {formatDate(order.created_at)}</p>
              </div>
              <span className={`pill ${STATUS_PILLS[order.status?.toLowerCase()] || 'pill-neutral'}`}>
                {order.status}
              </span>
            </header>
            <ul className="order-items">
              {order.items.map((item, idx) => {
                const product = productMap[item.product_id];
                return (
                  <li key={idx} className="order-item">
                    <div className="thumb thumb-sm">
                      {product?.image_url && <img src={product.image_url} alt="" />}
                    </div>
                    <span className="order-item-name">{product?.name || item.product_id}</span>
                    <span className="order-item-qty">{item.quantity} × {formatPrice(item.price)}</span>
                    <span className="order-item-total">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                );
              })}
            </ul>
            <footer className="order-total">
              <span>Total</span>
              <strong>{formatPrice(order.total_amount)}</strong>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Orders;
