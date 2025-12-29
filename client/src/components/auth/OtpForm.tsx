import React, { useState } from "react";
import { IAuthAPI } from "../../api/auth/IAuthAPI";

type OtpFormProps = {
    authAPI: IAuthAPI;
    sessionId: string;
    userId: number;
    onSuccess: (token: string) => void;
};

export const OtpForm: React.FC<OtpFormProps> = ({ authAPI, sessionId, userId, onSuccess }) => {
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label htmlFor="otp">OTP Code</label>
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

            <button type="submit" disabled={isLoading} className="btn btn-accent">
                {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
        </form>
    );
};
