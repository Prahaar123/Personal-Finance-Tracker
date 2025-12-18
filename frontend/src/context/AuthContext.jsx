import { createContext, useState, useContext, useEffect } from 'react';
import api from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------
  // Restore auth on reload
  // --------------------
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // --------------------
  // Login
  // --------------------
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          currency: data.currency,
        })
      );

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        currency: data.currency,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // --------------------
  // Register
  // --------------------
  const register = async (name, email, password, currency) => {
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        currency,
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          currency: data.currency,
        })
      );

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        currency: data.currency,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // --------------------
  // Logout
  // --------------------
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // ignore
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
