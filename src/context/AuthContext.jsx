import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { io } from 'socket.io-client';

const AuthContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState(['Maths', 'Science', 'English', 'History', 'Art']);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const { data } = await client.get('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects', err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    const checkSession = async () => {
      if (storedUser && storedToken) {
        try {
          // Verify with server if this user still exists (after restart)
          const { data } = await client.get('/auth/me');
          setUser(data);
        } catch (err) {
          console.log('Session expired or server restarted. Logging out.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      fetchSubjects();
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await client.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Login failed', err);
      throw err;
    }
  };

  const signup = async (name, email, password, role, subject) => {
    try {
      const { data } = await client.post('/auth/signup', { name, email, password, role, subject });
      return data;
    } catch (err) {
      console.error('Signup failed', err);
      throw err;
    }
  };

  const addSubject = async (name) => {
    try {
      const { data } = await client.post('/subjects', { name });
      setSubjects(data);
      return data;
    } catch (err) {
      console.error('Error adding subject', err);
      throw err;
    }
  };

  const updateProfile = async (name, subject) => {
    try {
      const { data } = await client.put('/auth/profile', { name, subject });
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Update profile failed', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, updateProfile, 
      subjects, subjectsLoading, fetchSubjects, addSubject, 
      loading, socket 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
