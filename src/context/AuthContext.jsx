import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('newmarket_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem('newmarket_user');
      return;
    }

    let active = true;
    api.getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
          localStorage.setItem('newmarket_user', JSON.stringify(currentUser));
        }
      })
      .catch(() => {
        if (active) {
          setToken(null);
          localStorage.removeItem('newmarket_token');
          localStorage.removeItem('newmarket_user');
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const establishSession = ({ token: sessionToken, user: sessionUser }) => {
    setToken(sessionToken);
    setUser(sessionUser);
    localStorage.setItem('newmarket_token', sessionToken);
    localStorage.setItem('newmarket_user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const login = async (email, password) => establishSession(
    await api.login({ email, password })
  );

  const register = async ({ fullName, email, password, role, campus, hostel }) => establishSession(
    await api.register({ fullName, email, password, role, campus, hostel })
  );

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('newmarket_token');
    localStorage.removeItem('newmarket_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
