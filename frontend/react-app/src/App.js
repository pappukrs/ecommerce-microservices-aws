import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Products from './components/Products';
import Cart from './components/Cart';
import Orders from './components/Orders';
import { CloseIcon } from './components/Icons';
import { api } from './api';
import { CartProvider } from './CartContext';
import { ProductsProvider } from './ProductsContext';
import { ToastProvider } from './ToastContext';
import './App.css';

function AppContent({ showLogin, setShowLogin }) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const openLogin = () => setShowLogin(true);

  useEffect(() => {
    if (user) {
      setShowLogin(false);
      const email = user.signInDetails?.loginId || user.username;
      const name = user.username;
      api.getProfile().catch(() => {
        api.createProfile(email, name)
          .catch((err) => console.error('Failed to create profile:', err));
      });
    }
  }, [user, setShowLogin]);

  useEffect(() => {
    if (!showLogin) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowLogin(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showLogin, setShowLogin]);

  return (
    <ToastProvider>
      <ProductsProvider>
        <CartProvider user={user}>
          <Router>
            <div className="App">
              <Navbar signOut={signOut} user={user} onSignInClick={openLogin} />
              {showLogin && !user && (
                <div className="login-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}>
                  <div className="login-modal" role="dialog" aria-modal="true" aria-label="Sign in">
                    <button className="icon-btn login-close" onClick={() => setShowLogin(false)} aria-label="Close">
                      <CloseIcon />
                    </button>
                    <div className="login-heading">
                      <h2>Welcome</h2>
                      <p>Sign in or create an account to use your cart and place orders.</p>
                    </div>
                    <Authenticator signUpAttributes={['email', 'name']} />
                  </div>
                </div>
              )}
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Products user={user} onSignInClick={openLogin} />} />
                  <Route path="/cart" element={<Cart user={user} onSignInClick={openLogin} />} />
                  <Route path="/orders" element={<Orders user={user} onSignInClick={openLogin} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </ProductsProvider>
    </ToastProvider>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <Authenticator.Provider>
      <AppContent showLogin={showLogin} setShowLogin={setShowLogin} />
    </Authenticator.Provider>
  );
}

export default App;
