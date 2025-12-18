import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --------------------
// Request Interceptor
// --------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Response Interceptor
// --------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --------------------
// Helper to clean params
// --------------------
const cleanParams = (params = {}) => {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'all'
    ) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

// --------------------
// Dashboard
// --------------------
export const getDashboard = (params) =>
  api.get('/dashboard', { params: cleanParams(params) });

// --------------------
// Transactions
// --------------------
export const getTransactions = (params) =>
  api.get('/transactions', { params: cleanParams(params) });

export const getTransaction = (id) =>
  api.get(`/transactions/${id}`);

export const createTransaction = (data) =>
  api.post('/transactions', data);

export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`);

// --------------------
// Categories
// --------------------
export const getCategories = (params) =>
  api.get('/categories', { params: cleanParams(params) });

export const getCategory = (id) =>
  api.get(`/categories/${id}`);

export const createCategory = (data) =>
  api.post('/categories', data);

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`);

// --------------------
// Budgets
// --------------------
export const getBudgets = (params) =>
  api.get('/budgets', { params: cleanParams(params) });

export const getBudget = (id) =>
  api.get(`/budgets/${id}`);

export const createBudget = (data) =>
  api.post('/budgets', data);

export const updateBudget = (id, data) =>
  api.put(`/budgets/${id}`, data);

export const deleteBudget = (id) =>
  api.delete(`/budgets/${id}`);

export const getBudgetHistory = (categoryId) =>
  api.get(`/budgets/history/${categoryId}`);

// --------------------
// Recurring
// --------------------
export const getRecurringTransactions = () =>
  api.get('/recurring');

export const getRecurringTransaction = (id) =>
  api.get(`/recurring/${id}`);

export const createRecurringTransaction = (data) =>
  api.post('/recurring', data);

export const updateRecurringTransaction = (id, data) =>
  api.put(`/recurring/${id}`, data);

export const deleteRecurringTransaction = (id) =>
  api.delete(`/recurring/${id}`);

export const generateRecurringTransactions = () =>
  api.post('/recurring/generate');

// --------------------
// Analytics
// --------------------
export const getIncomeExpenseAnalytics = (params) =>
  api.get('/analytics/income-expense', { params: cleanParams(params) });

export const getCategoryBreakdown = (params) =>
  api.get('/analytics/category-breakdown', { params: cleanParams(params) });

export const getDailyTrends = (params) =>
  api.get('/analytics/daily-trends', { params: cleanParams(params) });

// --------------------
// Reports
// --------------------
export const exportCSV = (params) =>
  api.get('/reports/csv', {
    params: cleanParams(params),
    responseType: 'blob',
  });

export const exportPDF = (params) =>
  api.get('/reports/pdf', {
    params: cleanParams(params),
    responseType: 'blob',
  });

// --------------------
// User
// --------------------
export const getProfile = () =>
  api.get('/users/profile');

export const updateProfile = (data) =>
  api.put('/users/profile', data);

export const deleteAccount = () =>
  api.delete('/users/profile');

export default api;
