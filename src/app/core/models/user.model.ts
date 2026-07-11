export type UserRole = 'ADMIN' | 'CONTADOR' | 'CLIENTE';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  escritorioId?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: User;
  expiraEm: number; 
}

export interface ForgotPasswordRequest {
  email: string;
}
