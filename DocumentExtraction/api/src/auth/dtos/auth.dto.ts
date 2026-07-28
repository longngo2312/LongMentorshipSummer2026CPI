export interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  success: true;
  message: string;
  token: string;
  user: AuthUser;
}
