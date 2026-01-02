import { JwtPayload } from "jsonwebtoken";
import { AuthTokenClaims } from "../Domain/types/AuthTokenClaims";

export function normalizeClaims(
  decoded: JwtPayload | string | undefined
): AuthTokenClaims | null {
  if (!decoded || typeof decoded === "string") {
    return null;
  }

  const payload = decoded as JwtPayload;

  const user_id = payload.user_id;
  const username = payload.username;
  const role = payload.role;

  if (user_id === undefined || username === undefined || role === undefined) {
    // fali podataka
    return null;
  }

  if (typeof user_id != "number") {
    // id nije number
    return null;
  }

  if (typeof username != "string") {
    // username nije string
    return null;
  }

  if (typeof role != "number") {
    // role nije number (sysAdmin je br. 1)
    return null;
  }

  return { user_id: user_id, username: username, role: role };
}
