import { IValidationService } from '../Domain/services/IValidationService';
import { AuthTokenClaims } from '../Domain/types/AuthTokenClaims';
import { VerifyResult } from '../Domain/types/VerifyResult';

export class ValidationService implements IValidationService {

    normalizeAuthHeader(header?: string): string | null {
        if(!header){
            return null;
        }

        const s = header.trim();
        if(!s){
            return null;
        }

        return s.toLowerCase().startsWith('Bearer') ? s.slice(6).trim() : s;
        // Bearer "token" ili samo "token"
    }
    
    verifyToken(token: string): Promise<VerifyResult> {
        throw new Error('Method not implemented.');
    }
    isSysAdminPayload(payload?: AuthTokenClaims, sysAdminRoleId?: number): boolean {
        throw new Error('Method not implemented.');
    }

}