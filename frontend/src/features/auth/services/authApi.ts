import { LoginCredentials, LoginResponse, User } from "../types";
import { dinoauth, getAuthUrlPath } from "../utils/auth_process";

export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const loginRes = await dinoauth.post<LoginResponse>(
    getAuthUrlPath("token"),
    credentials
  );

  return loginRes.data;
}

export async function logoutUser(): Promise<void> {
  await dinoauth.post(getAuthUrlPath("logout"));
}

export const getProfile = async (): Promise<User> => {
  const res = await dinoauth.get<User>(getAuthUrlPath("profile"));
  return res.data;
};
