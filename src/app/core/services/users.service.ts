import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { ChangePasswordPayload, UpdateProfilePayload, UserProfile } from '../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  meuPerfil(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/me`).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  atualizarPerfil(payload: UpdateProfilePayload): Observable<UserProfile> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.baseUrl}/me`, payload).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  trocarSenha(payload: ChangePasswordPayload): Observable<void> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/change-password`, payload).pipe(
      map(() => undefined),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  private tratarErro(erro: unknown) {
    const mensagem =
      (erro as { error?: ApiResponse<unknown> & { message?: string } })?.error?.message ??
      'Não foi possível se comunicar com o servidor. Tente novamente em instantes.';
    return throwError(() => new Error(mensagem));
  }
}
