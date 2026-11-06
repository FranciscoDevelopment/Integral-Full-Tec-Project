// The JwtPayload type (sub, email, role) lives in jwt-payload.type.ts
export type tokensT = {
  accessToken : string;
  refreshToken : string;
  accessExpiresAt : Date; // the session cookies expire together with their token
  refreshExpiresAt : Date;
}
