import React from "react";

export default function FacebookLoginButton() {
  const handleFacebookLogin = () => {
    const serverUrl =
      process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
    window.location.href = `${serverUrl}/api/auth/facebook`;
  };

  return (
    <button
      onClick={handleFacebookLogin}
      className="flex items-center justify-center w-full text-[#1877F2] font-semibold hover:opacity-80 transition text-sm"
    >
      {/* Facebook icon tròn */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-5 h-5 mr-2"
      >
        <path
          fill="#1877F2"
          d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256c0 127.9 93.3 233.9 215 252v-178h-65v-74h65v-56.6c0-64.3 38.3-100 97-100 28.1 0 57.5 5 57.5 5v63h-32.4c-31.9 0-41.8 19.8-41.8 40v48.6h71l-11.3 74h-59.7v178C418.7 489.9 512 383.9 512 256z"
        />
        <path
          fill="#fff"
          d="M355.7 330l11.3-74h-71v-48.6c0-20.2 9.9-40 41.8-40h32.4v-63s-29.4-5-57.5-5c-58.7 0-97 35.7-97 100V256h-65v74h65v178a258.7 258.7 0 0078 0V330h59.7z"
        />
      </svg>
      Đăng nhập bằng Facebook
    </button>
  );
}
