import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

// Redux Auth Slice
import {
  logout,
  updateUser,
  setCredentials,
  selectIsAuthenticated,
  selectCurrentUser,
} from "../features/auth/authSlice";
import { useGetMeQuery } from "../features/auth/authApi";

// Route protection
import ProtectedRoute from "../features/auth/ProtectedRoute";

// Route groups
import PublicRoutes from "./PublicRoutes";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";

// Layouts
import Layout from "../components/layouts/Layout";
import AdminLayout from "../components/layouts/AdminLayout";

// Optional 404
// import NotFound from "../components/common/NotFound";

const AppRoutes = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  const { data: userData, error, isLoading } = useGetMeQuery();

  console.log("🔑 Authenticated:", isAuthenticated, "| Role:", currentUser?.role);

  // 🔄 Sync user info on app load
  useEffect(() => {
    if (userData && !isLoading) {
      if (userData.accessToken && userData.accessToken !== currentUser?.accessToken) {
        dispatch(setCredentials({
          user: userData,
          accessToken: userData.accessToken
        }));
      } else if (!userData.accessToken && userData.id !== currentUser?.id) {
        dispatch(updateUser(userData));
      }
    } else if (error) {
      console.log("⚠️ Invalid session, logging out...");
      dispatch(logout());
    }
  }, [userData, error, dispatch, isLoading, currentUser]);

  return (
    <BrowserRouter>
      <Routes>

        {/* 🌐 Public routes (không cần đăng nhập) */}
        <Route path="/*" element={<PublicRoutes />} />

        {/* 👤 User routes (yêu cầu đăng nhập và role 'user') */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute requiredRole="user">
              <Layout>
                <UserRoutes />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 🛠️ Admin routes (yêu cầu role 'admin') */}
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

        {/*  404 fallback */}
        {/* <Route path="*" element={<NotFound />} /> */}

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
