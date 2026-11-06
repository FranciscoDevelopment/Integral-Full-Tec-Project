// The access token cookie name (AUTH_COOKIE_NAME) lives in common/constants/auth.constants.ts
export const REFRESH_COOKIE_NAME = 'refresh_token' ;

// The refresh cookie only travels to the auth endpoints, never to the rest of the API
export const REFRESH_COOKIE_PATH = '/auth' ;
