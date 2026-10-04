import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const ProductsContext = createContext();

export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // silent: refresh in the background without showing the loading skeleton
  const loadProducts = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError(false);
    } catch (err) {
      if (!silent) setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const productMap = useMemo(
    () => Object.fromEntries(products.map(product => [product.product_id, product])),
    [products]
  );

  return (
    <ProductsContext.Provider value={{ products, productMap, loading, error, loadProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};
