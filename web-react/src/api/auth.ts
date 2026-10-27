import client from "./client";

const URL = "auth";

export interface LoginPayload {
  email: string;
  password: string;
  /** `web` restringe o acesso a administradores da curadoria. */
  origin?: string;
}

export interface LoginResponse {
  token?: string;
  [key: string]: unknown;
}

export interface VerifyOtpPayload {
  token: string;
  otp: string;
}

export interface SetPasswordPayload {
  token: string;
  password: string;
  fullname: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = (await client.post(`${URL}/login`, payload)) as LoginResponse;
  return response;
}

export async function generateUserToken(
  userEmail: string,
  isFromForget: boolean,
): Promise<unknown> {
  const response = (await client.get(
    `${URL}/generate-user-token/${userEmail}/${isFromForget}`,
  )) as unknown;
  return response;
}

export async function verifyOtp(token: string, otp: string): Promise<unknown> {
  const response = (await client.post(`${URL}/verify-otp`, {
    token,
    otp,
  })) as unknown;
  return response;
}

export async function validateToken(token: string): Promise<unknown> {
  const response = (await client.post(`${URL}/validate-token`, null, {
    headers: {
      "X-Access-Token": `Bearer ${token}`,
    },
  })) as unknown;
  return response;
}

export async function setPassword(
  token: string,
  password: string,
  fullname: string,
): Promise<unknown> {
  const response = (await client.post(`${URL}/set-password`, {
    token,
    password,
    fullname,
  })) as unknown;
  return response;
}

export const authApi = {
  login,
  generateUserToken,
  verifyOtp,
  validateToken,
  setPassword,
};

export default authApi;