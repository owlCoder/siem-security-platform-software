import React, { useState } from "react";
import { OtpFormProps } from "../../types/props/auth/OtpFormProps";

export default function OtpForm({ authAPI, sessionId, setSessionId, userId, onSuccess }:OtpFormProps) {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await authAPI.verifyOtp({
                session_id: sessionId,
                user_id: userId,
                otp: otp
            });
            //should we check the token?
            if (response.success && response.token) {
                onSuccess(response.token);
                console.log(response.success, response.message, response.token);
            } else {
                setError(response.message || "Invalid OTP. Please try again.");
            }
        } catch (err: any) {
            setError(err?.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await authAPI.resendOtp({
                session_id: sessionId,
                user_id: userId
            });

            if (response.session?.session_id) {
                setSessionId(response.session?.session_id);
            } else {
                setError(response.message || "Resending OTP failure. Please try again.");
            }
        } catch (err: any) {
            setError(err?.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="otp" className="block mb-2! text-sm font-semibold"
                    >OTP Code</label>
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={otp}
                        onChange={handleChange}
                        placeholder="Enter OTP code"
                        required
                        disabled={isLoading}
                    />
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <button type="submit" disabled={isLoading} className="px-6! py-2! rounded-[10px]! bg-[#007a55]! hover:bg-[#9ca3af]! text-white text-[13px] font-semibold cursor-pointer">
                    {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

            </form>
            <a href="#" onClick={(e) => { e.preventDefault(); handleResendOtp(); }} className="block text-center text-blue-600 underline hover:text-blue-800 cursor-pointer mt-2!">Resend OTP</a>
        </div>
    );
};
