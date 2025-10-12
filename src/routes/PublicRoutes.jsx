import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';
import AuthCallback from "../features/auth/AuthCallback";

// Auth pages
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import ForgotPassword from '../features/auth/ForgotPassword';
// import ResetPassword from '../features/auth/ResetPassword';

const PublicRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  // Nếu đã đăng nhập -> redirect về trang phù hợp với role
  if (isAuthenticated) {
    const redirectPath = currentUser?.role === 'admin' ? '/admin' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
    </Routes>
  );
};

export default PublicRoutes;
