import { Routes, Route } from "react-router-dom";
import AuthCallback from "../features/auth/AuthCallback";

// Auth pages
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";
import AuthLayout from "../components/layouts/AuthLayout";
import ResetPassword from '../features/auth/ResetPassword';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="auth/callback" element={<AuthCallback />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
};

export default PublicRoutes;
