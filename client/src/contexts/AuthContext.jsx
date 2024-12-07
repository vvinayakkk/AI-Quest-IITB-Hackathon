import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AuthContext = createContext();

// Axios interceptor with more comprehensive error handling
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Automatically logout on 401 (Unauthorized) or 403 (Forbidden) errors
    if (error.response && [401, 403].includes(error.response.status)) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Force redirect
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isloggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Enhanced token validation
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      // Add buffer time (e.g., 5 minutes) before actual expiration
      return decoded.exp * 1000 > Date.now() + 5 * 60 * 1000;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && isTokenValid(token)) {
          const response = await axios.get(`${SERVER_URL}/user/profile`);
          setUser(response.data);
          setIsLoggedIn(true);
          setError(null);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setError(error.response?.data?.message || 'Authentication failed');
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const authResponse = await axios.post(`${SERVER_URL}/auth/login`, credentials);
      const { token } = authResponse.data;
      localStorage.setItem('token', token);

      const profileResponse = await axios.get(`${SERVER_URL}/user/profile`);
      const userData = profileResponse.data;
      setUser(userData);
      setIsLoggedIn(true);
      navigate('/dashboard'); // Optional: redirect after login
      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const registerResponse = await axios.post(`${SERVER_URL}/auth/signup`, userData);
      const { token } = registerResponse.data;
      localStorage.setItem('token', token);

      const profileResponse = await axios.get(`${SERVER_URL}/user/profile`);
      const newUser = profileResponse.data;
      setUser(newUser);
      setIsLoggedIn(true);
      navigate('/onboarding'); // Optional: redirect to onboarding
      return newUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // New method to update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${SERVER_URL}/user/profile`, profileData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Optional: Call backend logout endpoint if needed
    try {
      axios.post(`${SERVER_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout backend call failed', error);
    }

    setUser(null);
    setError(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isloggedIn,
        error,
        login,
        logout,
        register,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};