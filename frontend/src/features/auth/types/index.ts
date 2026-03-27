export interface User {
  username: string;
  nickname: string;
  email?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse extends User {
  detail?: "ok";
}
