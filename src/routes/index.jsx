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
import AuthLayout from "../components/layouts/AuthLayout";

// Optional 404
// import NotFound from "../components/common/NotFound";

const AppRoutes = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  const { data: userData, error, isLoading } = useGetMeQuery();

  console.log(
    "🔑 Authenticated:",
    isAuthenticated,
    "| Role:",
    currentUser?.role
  );

  // 🔄 Sync user info on app load
  useEffect(() => {
    if (userData && !isLoading) {
      if (
        userData.accessToken &&
        userData.accessToken !== currentUser?.accessToken
      ) {
        dispatch(
          setCredentials({
            user: userData,
            accessToken: userData.accessToken,
          })
        );
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
        <Route element={<AuthLayout />}>
          {PublicRoutes.map((route, index) => {
            const Page = route.component;
            return <Route key={index} path={route.path} element={<Page />} />;
          })}
        </Route>
        <Route element={<ProtectedRoute requireRole="user"><Layout /></ProtectedRoute>}>
          {UserRoutes.map((route, index) => {
            const Page = route.component;
            return <Route key={index} path={route.path} element={<Page />} />;
          })}
        </Route>

        <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminLayout/></ProtectedRoute>} >
            {AdminRoutes.map((route, index) => {
            const Page = route.component;
            return <Route key={index} path={route.path} element={<Page />} />;
          })}
        </Route>
        </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;
