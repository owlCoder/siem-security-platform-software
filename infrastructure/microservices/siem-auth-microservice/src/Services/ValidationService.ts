import { IValidationService } from '../Domain/services/IValidationService';
import { AuthTokenClaims } from '../Domain/types/AuthTokenClaims';
import { VerifyResult } from '../Domain/types/VerifyResult';
import jwt, { JwtPayload } from 'jsonwebtoken';

export class ValidationService implements IValidationService {
    private secret: string;
    private sysAdminRoleId: number;

    constructor(secret: string, sysAdminRoleId?: number) {
        this.secret = secret;
        this.sysAdminRoleId = sysAdminRoleId ?? 1;
    }

    normalizeAuthHeader(header?: string): string | null {
        if(!header){
            return null;
        }

        const s = header.trim();
        if(!s){
            return null;
        }

        return s.toLowerCase().startsWith('bearer ') ? s.slice(7).trim() : s;
        // Bearer "token" ili samo "token"
    }
    
    async verifyToken(token: string): Promise<VerifyResult> {
        if(!token){
            return { valid: false, error: 'No token provided.' }
        }

        try{
            const decoded = jwt.verify(token, this.secret) as JwtPayload | string;

            const payload = this.normalizeClaims(decoded);
            if(payload === null){
                return {valid: false, error: 'Token missing requred claims.'};
            }

            const isSysAdmin = payload.role === this.sysAdminRoleId;
            
            return { valid: true, payload, isSysAdmin};
        } catch(error: any){
            return {valid: false, error: 'Invalid token!'};
        }
    } 

    isSysAdminPayload(payload?: AuthTokenClaims, sysAdminRoleId?: number): boolean {
       if(!payload){
        return false;
       }

       let sysId = this.sysAdminRoleId;
       if(sysAdminRoleId !== undefined && sysAdminRoleId !== null){
        const parsed = Number(sysAdminRoleId);

        if(!Number.isNaN(parsed)){
            sysId = parsed;
        }
       }

       return payload.role === sysId;
    }

    private normalizeClaims(decoded: JwtPayload | string): AuthTokenClaims | null {
        if(!decoded || typeof(decoded) === 'string'){
            return null;
        }

        const payload = decoded as JwtPayload;

        const user_id = payload.user_id;
        const username = payload.username;
        const role = payload.role;

        if(user_id === undefined || username === undefined || role === undefined){
            // fali podataka
            return null;
        }

        if(typeof(user_id) != 'number'){
            // id nije number
            return null;
        }
        
        if(typeof(username) != 'string'){
            // username nije string
            return null;
        }
        
        if(typeof(role) != 'number'){
            // role nije number (sysAdmin je br. 1)
            return null;
        }

        return {user_id: user_id, username: username, role: role};
    }

}