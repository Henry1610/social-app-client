import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLazyGetSessionAuthQuery } from "../../features/auth/authApi";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [getSessionAuth, { isLoading }] = useLazyGetSessionAuthQuery();
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (location.pathname !== "/auth/callback") return;
    if (hasCalledRef.current) return; // Ngăn multiple calls
    
    hasCalledRef.current = true;

    const fetchAuth = async () => {
      try {
     
        const result = await getSessionAuth().unwrap();

        if (result?.success && result.user && result.accessToken) {
          // Chỉ điều hướng - AppRoutes sẽ tự động khôi phục session
          const redirectPath = result.user.role === "admin" ? "/admin" : "/";
          navigate(redirectPath, { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Failed to fetch session auth:", err);
        navigate("/login", { replace: true });
      }
    };

    fetchAuth();
  }, [navigate, location.pathname, getSessionAuth]); 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang đăng nhập bằng Facebook...</p>
        </div>
      </div>
    );
  }

  return null;
}
