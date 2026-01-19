import React, { useEffect, useState } from "react";
import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { useNavigate } from "react-router-dom";
import { LoginFormProps } from "../../types/props/auth/LoginFormProps";


export default function LoginForm({ authAPI, handleLoginSuccess, handleOtpSuccess }:LoginFormProps){
  const [formData, setFormData] = useState<LoginUserDTO>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.success && response.otp_required && response.session && !response["siem-token"]) {
        handleLoginSuccess({ session_id: response.session?.session_id, user_id: response.session?.user_id });

      } else if (response["siem-token"] && response.success) {
        handleOtpSuccess(response["siem-token"]);//if otp (mailing) microservice is down, they just send the token
      } else {
        //console.log(response);
        //console.log(response.success, response.otp_required, response.session?.session_id, response.session?.user_id);
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    /*if (isAuthenticated)
      navigate("/dashboard");*/
  })

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="username" className="block mb-2! text-sm font-semibold">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block mb-2! text-sm font-semibold">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(196, 43, 28, 0.15)",
            borderColor: "var(--win11-close-hover)",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--win11-close-hover)">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
            </svg>
            <span style={{ fontSize: "13px", color: "var(--win11-text-primary)" }}>{error}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="px-6! py-2! rounded-[10px]! bg-[#007a55]! hover:bg-[#9ca3af]! text-white text-[13px] font-semibold cursor-pointer"
        disabled={isLoading}
        style={{ marginTop: "8px" }}
      >

        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
            <span>Logging in...</span>
          </div>
        ) : (
          "Login"
        )}
      </button>

      {/* Placeholder button until auth is implemented */}

      <button onClick={() => navigate('/mainLayout')}>Skip Login</button>



    </form>
  );
};