import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { PlanoTributario } from '../models/plano-tributario.model';

@Injectable({ providedIn: 'root' })
export class PlanoTributarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/plano-tributario`;

  gerar(clienteId: string): Observable<PlanoTributario> {
    return this.http.post<ApiResponse<PlanoTributario>>(this.baseUrl, { clienteId }).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  listar(clienteId?: string): Observable<PlanoTributario[]> {
    const params: Record<string, string> = {};
    if (clienteId) params['clienteId'] = clienteId;

    return this.http.get<ApiResponse<PlanoTributario[]>>(this.baseUrl, { params }).pipe(
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
