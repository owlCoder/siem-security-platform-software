import { IAuthAPI } from "../../../api/auth/IAuthAPI";

export interface LoginFormProps{
  authAPI: IAuthAPI;
  handleLoginSuccess: (session: { session_id: string; user_id: number }) => void;
  handleOtpSuccess: (token: string) => void;
};