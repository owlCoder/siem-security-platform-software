import { AuthTokenClaims } from "./AuthTokenClaims";

export type VerifyResult = {
    valid: boolean;
    payload?: AuthTokenClaims;
    isSysAdmin?: boolean;
    error?: string;
}