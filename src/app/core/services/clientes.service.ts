import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { Cliente, ClientePayload } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  listar(busca?: string): Observable<Cliente[]> {
    const params: Record<string, string> = busca ? { busca } : {};
    return this.http.get<ApiResponse<Cliente[]>>(this.baseUrl, { params }).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  buscarPorId(id: string): Observable<Cliente> {
    return this.http.get<ApiResponse<Cliente>>(`${this.baseUrl}/${id}`).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  criar(payload: ClientePayload): Observable<Cliente> {
    return this.http.post<ApiResponse<Cliente>>(this.baseUrl, payload).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  atualizar(id: string, payload: ClientePayload): Observable<Cliente> {
    return this.http.patch<ApiResponse<Cliente>>(`${this.baseUrl}/${id}`, payload).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`).pipe(
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
