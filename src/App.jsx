import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
      
      <Route 
        path="/teacher/*" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'teacher' ? <Navigate to="/teacher" /> : <Navigate to="/student" />
          ) : (
            <Navigate to="/login" />
          )
        } 
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
