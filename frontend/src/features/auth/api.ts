import { API_BASE_URL } from "@/shared/constants/site";
import type { User } from "@/shared/types";
import type { Session } from "./types";

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

interface RefreshResponse {
  accessToken: string;
  expiresAt: string;
}

interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request(path: string, method: "GET" | "POST", body?: object) {
  try {
    return await fetch(`${API_BASE_URL.replace(/\/+$/, "")}${path}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the API. Check your connection and try again.",
    );
  }
}

async function getApiError(response: Response): Promise<ApiError> {
  let message: string | undefined;
  let status = response.status;

  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.statusCode === "number") {
      status = body.statusCode;
    }
    if (typeof body.message === "string") {
      message = body.message;
    } else if (Array.isArray(body.message)) {
      message = body.message.filter((item) => typeof item === "string").join(", ");
    }
  } catch {
    message = undefined;
  }

  return new ApiError(
    status,
    message || `The API request failed with status ${status}.`,
  );
}

async function requestJson<T>(
  path: string,
  method: "GET" | "POST",
  body?: object,
): Promise<T> {
  const response = await request(path, method, body);
  if (!response.ok) {
    throw await getApiError(response);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(response.status, "The API returned an invalid response.");
  }
}

export function signin(input: SigninInput): Promise<AuthResponse> {
  return requestJson("/auth/signin", "POST", input);
}

export function signup(input: SignupInput): Promise<AuthResponse> {
  return requestJson("/auth/signup", "POST", input);
}

export async function logout(): Promise<void> {
  const response = await request("/auth/logout", "POST");
  if (!response.ok) {
    throw await getApiError(response);
  }
}

export function refreshSession(): Promise<RefreshResponse> {
  return requestJson("/auth/refresh", "POST");
}

export function getMe(): Promise<User> {
  return requestJson("/users/me", "GET");
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    return { user: await getMe() };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
  }

  try {
    await refreshSession();
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      return null;
    }
    throw error;
  }

  try {
    return { user: await getMe() };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}
