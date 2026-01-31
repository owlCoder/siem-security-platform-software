import { Request, Response, NextFunction } from "express";
import { AuthTokenClaimsType } from "../../Domain/types/AuthTokenClaims";
import { IGatewayService } from "../../Domain/services/IGatewayService";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenClaimsType;
      isSysAdmin?: boolean;
    }
  }
}

export const createAuthMiddleware = (gatewayService: IGatewayService) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AuthMiddleware] 401 Token missing (no Authorization header)");
      res.status(401).json({ success: false, message: "Token is missing!" });
      return;
    }

    const token = authHeader.split(" ")[1];
    try {
      const result = await gatewayService.validateToken(token);

      if (!result.valid) {
        console.log("[AuthMiddleware] 401 Token validation failed:", result.error);
        res.status(401).json({ success: false, message: result.error });
        return;
      }

      req.user = result.payload;
      req.isSysAdmin = result.isSysAdmin;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  };
};
