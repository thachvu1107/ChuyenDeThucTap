import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const GoogleLoginButton = () => {
  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Google user:", decoded);
    // Gửi token này về PHP backend để xác thực
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  return (
    <GoogleOAuthProvider clientId="355013579883-dig24c30a6c0c163jmd3bj7ev8oe080e.apps.googleusercontent.com">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
