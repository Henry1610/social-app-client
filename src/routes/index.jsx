import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef } from "react";

import {
  updateUser,
  selectCurrentUser,
  selectAccessToken,
  setSessionInitialized,
} from "../features/auth/authSlice";
import { useGetMeQuery } from "../features/auth/api/authApi";

import ProtectedRoute from "../features/auth/ProtectedRoute";
import PublicRoutes from "./PublicRoutes";
import UserRoutes from "./UserRoutes";

import Layout from "../components/layouts/Layout";
import AuthLayout from "../components/layouts/AuthLayout";
import FloatingDirectMessage from "../components/common/FloatingDirectMessage";
import { ChatProvider } from "../contexts/ChatContext";

const AppRoutes = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);
  const hasInitialized = useRef(false);

  const { data: userData, isLoading } = useGetMeQuery(undefined, {
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
      <ChatProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            {PublicRoutes.map((route, index) => {
              const Page = route.component;
              return <Route key={index} path={route.path} element={<Page />} />;
            })}
          </Route>

          <Route
            element={
              <ProtectedRoute requiredRole="user">
                <Layout />
              </ProtectedRoute>
            }
          >
            {UserRoutes.map((route, index) => {
              const Page = route.component;
              return <Route key={index} path={route.path} element={<Page />} />;
            })}
          </Route>

          <Route
            element={
              <ProtectedRoute requiredRole="user">
                <Layout />
              </ProtectedRoute>
            }
          >
            {UserRoutes.map((route, index) => {
              const Page = route.component;
              return (
                <Route key={index} path={route.path} element={<Page />}>
                  {route.children?.map((child, i) => {
                    const ChildPage = child.component;
                    return (
                      <Route key={i} path={child.path} element={<ChildPage />} />
                    );
                  })}
                </Route>
              );
            })}
          </Route>
        </Routes>
        
        {/* Render FloatingDirectMessage bên trong Router để có thể dùng useLocation */}
        {currentUser && (
          <FloatingDirectMessage 
            avatarUrl={currentUser.avatarUrl } 
          />
        )}
      </ChatProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
