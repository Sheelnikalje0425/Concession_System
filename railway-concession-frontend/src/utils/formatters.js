export const formatters = {
  // Format date to readable string
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Date(date).toLocaleDateString('en-US', mergedOptions);
  },

  // Format date and time
  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Format application status with colors
  formatStatus: (status) => {
    const statusMap = {
      PENDING: { text: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      APPROVED: { text: 'Approved', color: 'text-green-600', bg: 'bg-green-100' },
      REJECTED: { text: 'Rejected', color: 'text-red-600', bg: 'bg-red-100' }
    };
    
    return statusMap[status] || { text: status, color: 'text-gray-600', bg: 'bg-gray-100' };
  },

  // Format category
  formatCategory: (category) => {
    const categoryMap = {
      GENERAL: 'General',
      SC: 'Scheduled Caste',
      ST: 'Scheduled Tribe',
      OBC: 'Other Backward Class',
      OTHER: 'Other'
    };
    
    return categoryMap[category] || category;
  },

  // Truncate text with ellipsis
  truncateText: (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format currency (if needed for payments)
  formatCurrency: (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
};