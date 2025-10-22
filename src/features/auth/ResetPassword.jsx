import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import FloatingInput from "../../components/common/FloatingInput";
import { useResetPasswordMutation } from "./authApi";
import { toast } from "sonner";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Liên kết không hợp lệ hoặc thiếu token.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp.");
      return;
    }
    try {
      await resetPassword({ token, newPassword }).unwrap();
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <div className=" p-10 w-[350px] text-center">
      <h2 className="text-lg font-semibold mb-4">Đặt lại mật khẩu</h2>
      {!token && (
        <p className="text-sm text-red-600 mb-4">Thiếu token. Vui lòng dùng lại liên kết trong email.</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <FloatingInput
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          label="Mật khẩu mới"
          required
          showToggle
        />
        <FloatingInput
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Xác nhận mật khẩu mới"
          required
          showToggle
        />
        <button
          type="submit"
          disabled={isLoading || !token}
          className="bg-[#4A5DF9] text-white mt-3 font-semibold py-1 rounded-md 
                hover:bg-[#3C4CE0] transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </button>
      </form>

      <div className=" p-6 text-center mt-4">
        <p className="text-sm">
          Nhớ mật khẩu? {""}
          <Link to="/login" className="text-[#4A5DF9] font-medium hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;


