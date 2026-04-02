export const getStoredCurrency = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.currency || 'USD';
  } catch {
    return 'USD';
  }
};

export const formatCurrency = (value, currencyCode = getStoredCurrency(), maximumFractionDigits = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    maximumFractionDigits,
  }).format(Number(value) || 0);
