import awsConfig from './aws-config';

const API_BASE_URL = awsConfig.API.baseUrl || process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Get authentication headers
const getAuthHeaders = async () => {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (token) {
      const payload = session.tokens?.idToken?.payload;
      return {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': payload?.sub || '',
        'X-User-Email': payload?.email || '',
        'X-User-Name': payload?.name || payload?.username || ''
      };
    }
    return {};
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {};
  }
};

// Parse the JSON body and reject on HTTP errors so callers can show a real error state
const request = async (path, options) => {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Request failed (${res.status})`);
  }
  return data;
};

export const api = {
  // Products (public)
  getProducts: () => request('/products'),

  getProduct: (id) => request(`/products/${id}`),

  // Cart (authenticated)
  getCart: async () => {
    const headers = await getAuthHeaders();
    return request('/cart', { headers });
  },

  addToCart: async (productId, quantity, price) => {
    const headers = await getAuthHeaders();
    return request('/cart/items', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product_id: productId, quantity, price })
    });
  },

  updateCartItem: async (productId, quantity) => {
    const headers = await getAuthHeaders();
    return request(`/cart/items/${productId}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    });
  },

  removeFromCart: async (productId) => {
    const headers = await getAuthHeaders();
    return request(`/cart/items/${productId}`, {
      method: 'DELETE',
      headers
    });
  },

  // Orders (authenticated)
  createOrder: async () => {
    const headers = await getAuthHeaders();
    return request('/orders', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
  },

  getOrders: async () => {
    const headers = await getAuthHeaders();
    return request('/orders', { headers });
  },

  // User (authenticated)
  getProfile: async () => {
    const headers = await getAuthHeaders();
    return request('/users/profile', { headers });
  },

  // Create user profile after Cognito signup
  createProfile: async (email, name) => {
    const headers = await getAuthHeaders();
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    const userId = session.tokens?.idToken?.payload?.sub;

    return request('/users/profile', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cognito_sub: userId,
        email: email,
        name: name
      })
    });
  },
};
