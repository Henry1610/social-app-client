import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';

// Admin pages
// import AdminDashboard from '../pages/admin/Dashboard';
// import UserManagement from '../pages/admin/UserManagement';
// import PostManagement from '../pages/admin/PostManagement';
// import ReportManagement from '../pages/admin/ReportManagement';
// import AnalyticsPage from '../pages/admin/AnalyticsPage';
// import SettingsPage from '../pages/admin/SettingsPage';


const AdminRoutes = () => {
  return (
    <Routes>
      {/* <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/posts" element={<AdminRoute><PostManagement /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><ReportManagement /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} /> */}
      
      {/* Redirect /admin to dashboard */}
      {/* <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} /> */}
      
      {/* Catch all admin routes */}
      {/* <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} /> */}
    </Routes>
  );
};

export default AdminRoutes;