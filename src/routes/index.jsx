import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef } from "react";

import {
  updateUser,
  selectCurrentUser,
  selectAccessToken,
  setSessionInitialized,
} from "../features/auth/authSlice";
import { useGetMeQuery } from "../features/auth/authApi";

import ProtectedRoute from "../features/auth/ProtectedRoute";
import PublicRoutes from "./PublicRoutes";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";

import Layout from "../components/layouts/Layout";
import AdminLayout from "../components/layouts/AdminLayout";
import AuthLayout from "../components/layouts/AuthLayout";

const AppRoutes = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);
  const hasInitialized = useRef(false);

  const { 
    data: userData, 
    isLoading,
  } = useGetMeQuery(undefined, {
    skip: !accessToken, // Chỉ gọi khi có accessToken
  });

  // Initialize session chỉ một lần
  useEffect(() => {
    if (hasInitialized.current) return; 
    
    if (isLoading) return; // Chờ /me xong

    //  /me xong (dù success hay fail)
    if (userData) {
      // Cập nhật user info nếu khác
      if (!currentUser || userData.id !== currentUser.id) {
        dispatch(updateUser(userData));
      }
    }
    
    //  Mark as initialized (chỉ chạy 1 lần)
    hasInitialized.current = true;
    dispatch(setSessionInitialized());
  }, [userData, isLoading, currentUser, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          {PublicRoutes.map((route, index) => {
            const Page = route.component;
            return <Route key={index} path={route.path} element={<Page />} />;
          })}
        </Route>

        <Route element={<ProtectedRoute requiredRole="user"><Layout /></ProtectedRoute>}>
          {UserRoutes.map((route, index) => {
            const Page = route.component;
            return <Route key={index} path={route.path} element={<Page />} />;
          })}
        </Route>

        <Route 
          path="/admin/*" 
          element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}
        >
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