import React, { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import OtpForm from "../components/auth/OtpForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthHook";
import { AuthPageProps } from "../types/props/pages/AuthPageProps";

export const AuthPage: React.FC<AuthPageProps> = ({ authAPI }) => {
  const [otpRequired, setOtpRequired] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (session: { session_id: string; user_id: number }) => {
    setSessionId(session.session_id);
    setUserId(session.user_id);
    setOtpRequired(true);
  };

  const handleOtpSuccess = (token: string) => {
    // save token, mark user as authenticated, redirect, etc.
    login(token);
    navigate("/mainLayout")
    console.log("User authenticated, token:", token);
  };

  return (
    <div className="overlay-blur-none" style={{ position: "fixed" }}>
      <div className="window" style={{ width: "500px", maxWidth: "90%" }}>
        <div className="titlebar flex justify-center items-center">
          <span className="titlebar-title">Authentication</span>
        </div>

        <div className="window-content" style={{ padding: 0 }}>
          <div style={{ padding: "24px" }}>
            {!otpRequired && (
              <LoginForm
                authAPI={authAPI}
                handleLoginSuccess={handleLoginSuccess}
                handleOtpSuccess={handleOtpSuccess}//if otp (mailing) microservice is down, they just send the token
              />
            )}

            {otpRequired && sessionId && userId && (
              <OtpForm
                authAPI={authAPI}
                sessionId={sessionId}
                setSessionId={setSessionId}
                userId={userId}
                onSuccess={handleOtpSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
