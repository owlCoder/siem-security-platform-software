import { AuthTokenClaims } from "../types/AuthTokenClaims";
import { VerifyResult } from "../types/VerifyResult";

export interface IValidationService {
    normalizeAuthHeader(header?: string): string | null;
    verifyToken(token: string): Promise<VerifyResult>;
    isSysAdminPayload(payload?: AuthTokenClaims, sysAdminRoleId?: number): boolean;
}