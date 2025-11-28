export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatCompact = (amount) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
};

export const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit', second:'2-digit' });
};

