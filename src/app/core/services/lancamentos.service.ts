import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { LancamentoFiscal, LancamentoFiscalPayload } from '../models/lancamento.model';

@Injectable({ providedIn: 'root' })
export class LancamentosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/lancamentos`;

  listar(filtros?: { tipo?: string; naturezaOperacao?: string }): Observable<LancamentoFiscal[]> {
    const params: Record<string, string> = {};
    if (filtros?.tipo) params['tipo'] = filtros.tipo;
    if (filtros?.naturezaOperacao) params['naturezaOperacao'] = filtros.naturezaOperacao;

    return this.http.get<ApiResponse<LancamentoFiscal[]>>(this.baseUrl, { params }).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  criar(payload: LancamentoFiscalPayload): Observable<LancamentoFiscal> {
    return this.http.post<ApiResponse<LancamentoFiscal>>(this.baseUrl, payload).pipe(
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
