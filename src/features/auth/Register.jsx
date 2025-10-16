import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSendOtpMutation, useVerifyOtpAndRegisterMutation } from "./authApi";
import { setCredentials } from "./authSlice";
import FloatingInput from "../../components/common/FloatingInput";
import SpriteCropped from "../../components/common/SpriteCropped";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    otp: "",
  });
  const [retryAfter, setRetryAfter] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [verifyAndRegister, { isLoading: registering }] =
    useVerifyOtpAndRegisterMutation();

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };
  useEffect(() => {
    if (retryAfter <= 0) return;
    const interval = setInterval(() => {
      setRetryAfter((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfter]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await sendOtp(formData.email).unwrap();
      setStep(2);
    } catch (err) {
      const apiMsg =
        err?.data?.message || err?.data?.code || "Gửi OTP thất bại";
      alert(apiMsg);

      setRetryAfter(err?.data?.retryAfter || 0);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        otp: formData.otp,
      };
      const result = await verifyAndRegister(payload).unwrap();
      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result?.tokens?.accessToken,
        })
      );
      navigate("/");
    } catch (err) {
      const apiMsg =
        err?.data?.message || err?.data?.code || "Đăng ký thất bại";
      alert(apiMsg);
    }
  };

  const canSendOtp = formData.email.length > 0;
  const canRegister =
    formData.email &&
    formData.password.length >= 6 &&
    formData.username &&
    formData.fullName &&
    formData.otp;

  return (
    <div className=" p-10 w-[350px] text-center">
      <div className="flex justify-center mb-6">
        <SpriteCropped
          spriteUrl="https://static.cdninstagram.com/rsrc.php/v4/yz/r/H_-3Vh0lHeK.png"
          bgPosition="0 -2959"
          width={175}
          height={51}
          alt="Instagram Logo"
        />
      </div>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-1">
          <FloatingInput
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            label="Email"
            required
          />
          <button
            type="submit"
            disabled={sendingOtp || !canSendOtp || retryAfter > 0} // disable khi đang đếm ngược
            className="bg-[#4A5DF9] text-white mt-3 font-semibold py-1 rounded-md 
      hover:bg-[#3C4CE0] transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {sendingOtp
              ? "Đang gửi OTP..."
              : retryAfter > 0
              ? `Vui lòng thử lại (${retryAfter}s)`
              : "Gửi OTP để đăng ký"}
          </button>
          <div className="text-xs text-gray-500 mt-4 leading-snug">
            <p>
              Những người dùng dịch vụ của chúng tôi có thể đã tải thông tin
              liên hệ của bạn lên Instagram.{" "}
              <a href="/learn-more" className="text-blue-500 hover:underline">
                Tìm hiểu thêm
              </a>
            </p>
            <p className="mt-1">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <a href="/terms" className="text-blue-500 hover:underline">
                Điều khoản
              </a>
              ,{" "}
              <a href="/privacy" className="text-blue-500 hover:underline">
                Chính sách quyền riêng tư
              </a>{" "}
              và{" "}
              <a href="/cookies" className="text-blue-500 hover:underline">
                Chính sách cookie
              </a>{" "}
              của chúng tôi.
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-1">
          <FloatingInput
            type="text"
            id="username"
            value={formData.username}
            onChange={handleInputChange("username")}
            label="Tên người dùng"
            required
          />
          <FloatingInput
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={handleInputChange("fullName")}
            label="Tên đầy đủ"
            required
          />
          <FloatingInput
            type="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            label="Mật khẩu"
            required
            showToggle
          />
          <FloatingInput
            type="text"
            id="otp"
            value={formData.otp}
            onChange={handleInputChange("otp")}
            label="Mã OTP"
            required
          />
          <button
            type="submit"
            disabled={registering || !canRegister}
            className="bg-[#4A5DF9] text-white mt-3 font-semibold py-1 rounded-md 
                hover:bg-[#3C4CE0] transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {registering ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-2 text-xs text-[#00376b] hover:underline"
          >
            Chỉnh sửa email
          </button>
        </form>
      )}

      <div className=" p-6 text-center mt-4">
        <p className="text-sm">
          Bạn đã có tài khoản ư?{" "}
          <Link
            to="/login"
            className="text-[#4A5DF9] font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
