// Prices are stored in USD; the storefront shows whole rupees at a fixed rate
const USD_TO_INR = 85;

const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const toRupees = (usd) => Math.round((Number(usd) || 0) * USD_TO_INR);

export const formatRupees = (amount) => rupees.format(amount);

// Convert the unit price first so line totals and order totals always add up
export const formatPrice = (usd, quantity = 1) => formatRupees(toRupees(usd) * quantity);

export const itemsTotal = (items) =>
  items.reduce((sum, item) => sum + toRupees(item.price) * item.quantity, 0);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
