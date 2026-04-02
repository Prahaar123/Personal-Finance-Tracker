import { createContext, useState, useContext, useEffect } from 'react';
import api from '@/services/api';

// 🔥 Firebase imports
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // --------------------
  // Restore auth on reload
  // --------------------
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
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

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        currency: data.currency,
        avatar: data.avatar,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

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

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        currency: data.currency,
        avatar: data.avatar,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // --------------------
  // 🔥 GOOGLE LOGIN
  // --------------------
  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;

      const { data } = await api.post('/auth/google', {
        name: gUser.displayName,
        email: gUser.email,
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        currency: data.currency,
        avatar: data.avatar,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };

    } catch (error) {
      return {
        success: false,
        message: error.message,
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUser = (updates) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const nextUser = { ...currentUser, ...updates };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    updateUser,
    login,
    register,
    googleLogin, // 🔥 added here
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
