import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from './api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, user }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refreshCartCount = useCallback(async () => {
    if (!user) {
      setCart(null);
      setError(false);
      return;
    }
    try {
      setCart(await api.getCart());
      setError(false);
    } catch (err) {
      setError(true);
    }
  }, [user]);

  useEffect(() => {
    setLoading(!!user);
    refreshCartCount().finally(() => setLoading(false));
  }, [user, refreshCartCount]);

  const items = cart?.items || [];
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, cartCount, loading, error, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
