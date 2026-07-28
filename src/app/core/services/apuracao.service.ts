import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { Apuracao, ApuracaoPayload } from '../models/apuracao.model';

@Injectable({ providedIn: 'root' })
export class ApuracaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/apuracao`;

  listar(): Observable<Apuracao[]> {
    return this.http.get<ApiResponse<Apuracao[]>>(this.baseUrl).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  criar(payload: ApuracaoPayload): Observable<Apuracao> {
    return this.http.post<ApiResponse<Apuracao>>(this.baseUrl, payload).pipe(
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

  explicarComIA(id: string): Observable<string> {
    return this.http.post<ApiResponse<{ explicacao: string }>>(`${this.baseUrl}/${id}/explicar`, {}).pipe(
      map((res) => res.data.explicacao),
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
