import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';

// Import route groups
import PublicRoutes from './PublicRoutes';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';

// Layout components
import Layout from '../components/layouts/Layout';
import AdminLayout from '../components/layouts/AdminLayout';

const AppRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  
  const isAdmin = currentUser?.role === 'admin';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Không cần login */}
        <Route path="/*" element={<PublicRoutes />} />
        
        {/* User Routes - Cần login */}
        {isAuthenticated && !isAdmin && (
          <Route path="/*" element={
            <Layout>
              <UserRoutes />
            </Layout>
          } />
        )}
        
        {/* Admin Routes - Cần login + role admin */}
        {isAuthenticated && isAdmin && (
          <Route path="/admin/*" element={
            <AdminLayout>
              <AdminRoutes />
            </AdminLayout>
          } />
        )}
        
        {/* Redirect based on role */}
        <Route path="/" element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/home" replace />
          )
        } />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;