import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectIsSessionInitialized,
} from "./authSlice";
import InstagramSpinner from "../../components/common/InstagramSpinner";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const isSessionInitialized = useSelector(selectIsSessionInitialized);
  const location = useLocation();

  const currentPath = location.pathname;

  //  Nếu chưa initialize session → hiển thị loading (chờ /me response)
  if (!isSessionInitialized) {
    return <div ><InstagramSpinner /></div>;
  }

  //  Nếu chưa đăng nhập và đang không ở trang login/register/... -> redirect về login
  if (
    !isAuthenticated &&
    !["/login", "/register", "/forgot-password", "/auth/callback"].includes(
      currentPath
    )
  ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔐 Chỉ thực hiện khi đã biết role (tránh redirect sớm trước khi /me trả về)
  if (requiredRole && currentUser?.role) {
    if (currentUser.role !== requiredRole) {
      if (currentUser.role === "admin") {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
