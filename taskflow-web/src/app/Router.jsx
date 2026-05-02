// src/app/Router.jsx - COMPLETE WITH ACTIVITY ROUTE

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import TaskListPage from '../pages/TaskListPage';
import ProjectsPage from '../pages/ProjectsPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ActivityLogPage from '../pages/ActivityLogPage';
import Spinner from '../shared/ui/Spinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><RegisterPage /></PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute><ForgotPasswordPage /></PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute><ResetPasswordPage /></PublicRoute>
        } />
        
        {/* Private routes */}
        <Route path="/dashboard" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />
        <Route path="/tasks" element={
          <PrivateRoute><TaskListPage /></PrivateRoute>
        } />
        <Route path="/projects" element={
          <PrivateRoute><ProjectsPage /></PrivateRoute>
        } />
        <Route path="/activity" element={
          <PrivateRoute><ActivityLogPage /></PrivateRoute>
        } />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;