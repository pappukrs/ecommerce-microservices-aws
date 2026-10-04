import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../CartContext';
import { BagIcon, PackageIcon } from './Icons';
import './Navbar.css';

function Navbar({ signOut, user, onSignInClick }) {
  const displayName = user?.signInDetails?.loginId || user?.username || 'User';
  const { cartCount } = useCart();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark"><BagIcon size={18} /></span>
          <span className="brand-name">eCommerce Store</span>
        </Link>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Shop</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </nav>
        <div className="nav-actions">
          <NavLink to="/orders" className="icon-btn nav-orders" aria-label="Orders">
            <PackageIcon />
          </NavLink>
          <NavLink to="/cart" className="icon-btn nav-cart" aria-label={`Cart, ${cartCount} items`}>
            <BagIcon />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>
          {user ? (
            <div className="user-info">
              <span className="avatar" title={displayName}>{displayName.charAt(0).toUpperCase()}</span>
              <span className="user-name">{displayName}</span>
              <button onClick={signOut} className="btn btn-secondary btn-sm">Sign out</button>
            </div>
          ) : (
            <button onClick={onSignInClick} className="btn btn-primary btn-sm">Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
