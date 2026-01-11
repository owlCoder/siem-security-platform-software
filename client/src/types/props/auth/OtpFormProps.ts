import { IAuthAPI } from "../../../api/auth/IAuthAPI";

export interface OtpFormProps{
    authAPI: IAuthAPI;
    sessionId: string;
    setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
    userId: number;
    onSuccess: (token: string) => void;
};