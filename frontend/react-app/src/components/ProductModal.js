import React, { useEffect, useState } from 'react';
import { formatPrice } from '../format';
import { CloseIcon, MinusIcon, PlusIcon } from './Icons';

const MAX_PER_ADD = 10;

function ProductModal({ product, inCart, lowStock, onAdd, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const soldOut = product.stock <= 0;
  const max = Math.min(product.stock, MAX_PER_ADD);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const handleAdd = async () => {
    setAdding(true);
    const added = await onAdd(product, quantity);
    setAdding(false);
    if (added) onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="quick-view" role="dialog" aria-modal="true" aria-label={product.name}>
        <button className="icon-btn quick-view-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        <div className="quick-view-media">
          <img src={product.image_url} alt={product.name} />
        </div>
        <div className="quick-view-body">
          <span className="product-category">{product.category}</span>
          <h2>{product.name}</h2>
          <p className="quick-view-price">{formatPrice(product.price)}</p>
          <p className="quick-view-desc">{product.description}</p>
          <p className={`stock-line ${soldOut ? 'is-out' : product.stock <= lowStock ? 'is-low' : ''}`}>
            <span className="stock-dot" />
            {soldOut ? 'Sold out' : product.stock <= lowStock ? `Only ${product.stock} left` : 'In stock'}
            {inCart > 0 && <span className="stock-in-cart">· {inCart} in your cart</span>}
          </p>
          <div className="quick-view-actions">
            <div className="stepper" role="group" aria-label="Quantity">
              <button
                onClick={() => setQuantity(current => current - 1)}
                disabled={soldOut || quantity <= 1}
                aria-label="Decrease quantity"
              >
                <MinusIcon size={16} />
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                onClick={() => setQuantity(current => current + 1)}
                disabled={soldOut || quantity >= max}
                aria-label="Increase quantity"
              >
                <PlusIcon size={16} />
              </button>
            </div>
            <button className="btn btn-primary quick-view-add" onClick={handleAdd} disabled={soldOut || adding}>
              {soldOut ? 'Sold out' : adding ? 'Adding…' : `Add to cart · ${formatPrice(product.price, quantity)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
