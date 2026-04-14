import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@NormaBrasil:token');
    const storedUser = localStorage.getItem('@NormaBrasil:user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token } = response.data;

    localStorage.setItem('@NormaBrasil:token', token);
    localStorage.setItem('@NormaBrasil:user', JSON.stringify(userData));
    
    setUser(userData);
    api.defaults.headers.Authorization = `Bearer ${token}`;
    
    return userData;
  };

  const register = async (name, email, phone, password) => {
    const response = await api.post('/auth/register', { name, email, phone, password });
    const { user: userData, token } = response.data;

    localStorage.setItem('@NormaBrasil:token', token);
    localStorage.setItem('@NormaBrasil:user', JSON.stringify(userData));
    
    setUser(userData);
    api.defaults.headers.Authorization = `Bearer ${token}`;
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('@NormaBrasil:token');
    localStorage.removeItem('@NormaBrasil:user');
    setUser(null);
    api.defaults.headers.Authorization = '';
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('@NormaBrasil:user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
