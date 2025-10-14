import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "./authApi";
import { setCredentials } from "./authSlice";
import FacebookLoginButton from "../../components/common/FacebookLoginButton";
import FloatingInput from "../../components/common/FloatingInput";
import Divider from "../../components/common/Divider";
import SpriteCropped from "../../components/common/SpriteCropped";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData).unwrap();
      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.accessToken,
        })
      );
      navigate("/");
    } catch (err) {
      alert(err.data?.message || "Đăng nhập thất bại");
    }
  };

  const isFormValid =
    formData.email.length > 0 && formData.password.length >= 6;

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <FloatingInput
          type="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          label="Tên người dùng hoặc email"
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

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="bg-[#4A5DF9] text-white mt-3 font-semibold py-1 rounded-md 
                hover:bg-[#3C4CE0] transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <Divider text="HOẶC" />

      <FacebookLoginButton />

      <Link
        to="/forgot-password"
        className="text-xs text-[#00376b] mt-2 block hover:underline"
      >
        Quên mật khẩu?
      </Link>

      <div className=" p-6 text-center mt-4">
        <p className="text-sm">
          Bạn chưa có tài khoản ư?{" "}
          <Link
            to="/register"
            className="text-[#4A5DF9] font-medium hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
