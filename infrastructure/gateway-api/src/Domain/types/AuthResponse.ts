export type AuthResponseType = {
    success: boolean;
    otp_required: boolean;
    session?: {
        session_id: string;
        user_id: number;
        iat: number; // issued at (timestamp)
        exp: number; // expiration (timestamp)
    };
    message: string;
}