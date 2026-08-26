import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Validate token and fetch user details on initial load
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.users.getMe();
          setUser(profile);
        } catch (error) {
          console.error('Failed to validate session token', error);
          // Token expired or invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.auth.login(email, password);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await api.auth.register(name, email, password);
      // Auto login after successful registration
      const loginResponse = await api.auth.login(email, password);
      localStorage.setItem('token', loginResponse.token);
      setToken(loginResponse.token);
      setUser(loginResponse.user);
      return loginResponse;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const updatedUser = await api.users.updateMe(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.users.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await api.users.deleteMe();
      logout();
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
