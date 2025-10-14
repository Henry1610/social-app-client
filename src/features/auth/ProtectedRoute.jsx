import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated, selectCurrentUser } from "./authSlice";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  const currentPath = location.pathname;

  // ✅ Nếu chưa đăng nhập và đang không ở trang login/register/... -> redirect về login
  if (
    !isAuthenticated &&
    !["/login", "/register", "/forgot-password", "/auth/callback"].includes(
      currentPath
    )
  ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Nếu có requiredRole nhưng không khớp, điều hướng về đúng khu vực
  if (requiredRole && currentUser?.role !== requiredRole) {
    if (currentUser?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
