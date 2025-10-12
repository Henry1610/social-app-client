import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  logout,
  updateUser,
  setCredentials,
  selectIsAuthenticated,
  selectCurrentUser,
} from "../features/auth/authSlice";
import { useGetMeQuery } from "../features/auth/authApi";
import ProtectedRoute from "../features/auth/ProtectedRoute";

// Import route groups
import PublicRoutes from "./PublicRoutes";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
// Layout components
import Layout from "../components/layouts/Layout";
import AdminLayout from "../components/layouts/AdminLayout";

const AppRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const isAdmin = currentUser?.role === "admin";
  const dispatch = useDispatch();
  
  // Auto-fetch user info khi app khởi động
  const { data: userData, error, isLoading } = useGetMeQuery();

  console.log("🔑 isAuthenticated:", isAuthenticated, " | isAdmin:", isAdmin);

  useEffect(() => {
    if (userData) {
      if (userData.accessToken) {
        dispatch(setCredentials({
          user: userData,
          accessToken: userData.accessToken
        }));
      } else {
        // Chỉ có user info -> chỉ cập nhật user
        dispatch(updateUser(userData));
      }
    } else if (error) {
      console.log("⚠️ No valid session");
      dispatch(logout());
    }
  }, [userData, error, dispatch]);
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Không cần login */}
        <Route path="*" element={<PublicRoutes />} />
       

        {/* User Routes - Cần login với role user */}
        <Route
          path="/*"
          element={
            <ProtectedRoute requiredRole="user">
              <Layout>
                <UserRoutes />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Cần login với role admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminRoutes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
