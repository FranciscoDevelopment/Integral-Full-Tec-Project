import { ApiError, apiGet, apiPost } from "@/shared/lib/api-client";
import type { User } from "@/shared/types";
import type { Session } from "./types";

// The login and register forms import ApiError from here: re-exported so they don't change
export { ApiError };

interface SigninInput {
  email: string;
  password: string;
}

interface SignupBaseInput extends SigninInput {
  name: string;
  logoUrl?: string;
  website?: string;
}

type SignupInput = SignupBaseInput &
  (
    | { role: "sponsor"; companyName: string }
    | { role?: "user"; companyName?: string }
  );

interface AuthResponse {
  user: User;
  accessToken: string;
  expiresAt: string;
}


export const signin = (input: SigninInput) => apiPost<AuthResponse>("/auth/signin", input);


export const signup = (input: SignupInput) => apiPost<AuthResponse>("/auth/signup", input);


export const logout = () => apiPost<void>("/auth/logout");


export const getMe = () => apiGet<User>("/users/me");


export async function getCurrentSession(): Promise<Session | null> {

  try {
    return { user: await getMe() };
  } 
  catch (error) {
    // The shared client already tried to refresh: a 401 here means there is no session
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }

}
