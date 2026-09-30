import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { StorageService } from './storage.service';
import { LoginRequest, LoginResponse, User, ForgotPasswordRequest } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

interface AuthApiResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    company: { id: string; name: string; cnpj: string };
    permissoes: string[];
  };
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  nomeEmpresa?: string;
}

export interface RegisterResponse {
  email: string;
  emailVerificado: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  private readonly currentUserSignal = signal<User | null>(this.storage.getUser<User>());
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<AuthApiResponse>>(`${this.baseUrl}/login`, payload).pipe(
      map((res) => this.mapAuthResponse(res.data)),
      tap((res) => this.persistSession(res)),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  register(payload: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<AuthApiResponse>>(`${this.baseUrl}/register`, payload).pipe(
      map((res) => this.mapAuthResponse(res.data)),
      tap((res) => this.persistSession(res)),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  verificarEmail(token: string): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<AuthApiResponse>>(`${this.baseUrl}/verificar-email`, { token })
      .pipe(
        map((res) => this.mapAuthResponse(res.data)),
        tap((res) => this.persistSession(res)),
        catchError((erro) => this.tratarErro(erro))
      );
  }

  reenviarVerificacao(email: string): Observable<null> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/reenviar-verificacao`, { email })
      .pipe(
        map((res) => res.data),
        catchError((erro) => this.tratarErro(erro))
      );
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<null> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/esqueci-senha`, payload)
      .pipe(
        map((res) => res.data),
        catchError((erro) => this.tratarErro(erro))
      );
  }

  redefinirSenha(token: string, novaSenha: string): Observable<null> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/redefinir-senha`, { token, novaSenha })
      .pipe(
        map((res) => res.data),
        catchError((erro) => this.tratarErro(erro))
      );
  }

  carregarUsuarioAtual(): Observable<User> {
    return this.http.post<ApiResponse<{ id: string; nome: string; email: string; permissoes: string[] }>>(
      `${this.baseUrl}/me`,
      {}
    ).pipe(
      map((res) => {
        const usuario: User = {
          id: res.data.id,
          nome: res.data.nome,
          email: res.data.email,
          role: (res.data.permissoes?.[0] as User['role']) ?? 'CLIENTE',
        };
        this.storage.setUser(usuario);
        this.currentUserSignal.set(usuario);
        return usuario;
      }),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  definirSessao(accessToken: string, refreshToken: string): void {
    this.storage.setToken(accessToken);
    this.storage.setRefreshToken(refreshToken);
  }

  logout(): void {
    this.storage.clear();
    this.currentUserSignal.set(null);
  }

  private mapAuthResponse(res: AuthApiResponse): LoginResponse {
    return {
      token: res.accessToken,
      refreshToken: res.refreshToken,
      usuario: {
        id: res.usuario.id,
        nome: res.usuario.nome,
        email: res.usuario.email,
        role: (res.usuario.permissoes?.[0] as User['role']) ?? 'CLIENTE',
      },
      expiraEm: Date.now() + 1000 * 60 * 55,
    };
  }

  private tratarErro(erro: unknown) {
    const mensagem =
      (erro as { error?: ApiResponse<unknown> & { message?: string } })?.error?.message ??
      'Não foi possível concluir a operação. Tente novamente.';
    return throwError(() => new Error(mensagem));
  }

  private persistSession(res: LoginResponse): void {
    this.storage.setToken(res.token);
    this.storage.setRefreshToken(res.refreshToken);
    this.storage.setUser(res.usuario);
    this.currentUserSignal.set(res.usuario);
  }
}
