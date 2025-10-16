import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const AuthLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex justify-center items-center w-full px-4 lg:px-0">
        {/* Left side: Image */}
        <div className="hidden lg:block mr-8">
          <img
            src="/images/landing-2x.png"
            alt="Instagram"
            className="max-w-[520px] object-contain"
          />
        </div>
        {/* Right side: Form */}
        <Outlet />
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AuthLayout;
