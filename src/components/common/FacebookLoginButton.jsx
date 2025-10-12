import React from "react";

export default function FacebookLoginButton() {
  const handleFacebookLogin = () => {
    // Chỉ redirect trình duyệt đến backend
    const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
    window.location.href = `${serverUrl}/api/auth/facebook`;
  };

  return <button onClick={handleFacebookLogin}>Login with Facebook</button>;
}
