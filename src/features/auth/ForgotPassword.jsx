import { useState, useEffect } from "react";
import FloatingInput from "../../components/common/FloatingInput";
import { useRequestResetPasswordMutation } from "./authApi";
import { toast } from "sonner";
import Divider from "../../components/common/Divider";
const ForgotPassword = () => {
  const [inputValue, setInputValue] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [requestReset, { isLoading: requesting }] =
    useRequestResetPasswordMutation();
  useEffect(() => {
    if (retryAfter <= 0) return;
    const interval = setInterval(() => {
      setRetryAfter((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfter]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestReset(inputValue).unwrap();
      toast.success("Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.");
    } catch (err) {
      const apiMsg = err?.data?.message || "Gửi liên kết thất bại";
      toast.error(apiMsg);
      setRetryAfter(err?.data?.retryAfter || 0);
    }
  };

  return (
    <div className=" p-10 w-[350px] text-center">
      {/* Icon khóa */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 11h14v10H5z"
            />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-lg font-semibold mb-2">
        Bạn gặp sự cố khi đăng nhập?
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Nhập email, số điện thoại hoặc tên người dùng của bạn và chúng tôi sẽ
        gửi cho bạn một liên kết để truy cập lại vào tài khoản.
      </p>

      {/* Form input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <FloatingInput
          type="email"
          id="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          label="Email"
          required
        />
        <button
          type="submit"
          disabled={requesting || !inputValue || retryAfter > 0}
          className="w-full bg-[#4A5DF9] text-white mt-3 font-semibold py-1 rounded-md 
        hover:bg-[#3C4CE0] transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {requesting
            ? "Đang gửi OTP..."
            : retryAfter > 0
            ? `Vui lòng thử lại (${retryAfter}s)`
            : "Gửi link đặt lại mật khẩu"}
        </button>
      </form>

      {/* Divider */}
      <Divider text="HOẶC" />

      {/* Create account */}
      <div className="mb-4">
        <a href="/register" className="text-gray-500 hover:underline text-sm">
          Tạo tài khoản mới
        </a>
      </div>

      {/* Back to login */}
      <div>
        <a
          href="/login"
          className="block  rounded py-2 hover:bg-gray-100 font-normal text-sm"
        >
          &larr;  Quay lại đăng nhập
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;
