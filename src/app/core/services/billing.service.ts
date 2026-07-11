import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  BillingHistoryItem,
  Cobranca,
  CobrancaPayload,
  LinkWhatsappResultado,
  ResumoCobrancas,
} from '../models/cobranca.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/billing`;

  listar(filtros: { status?: string; clienteId?: string } = {}): Observable<Cobranca[]> {
    const params: Record<string, string> = {};
    if (filtros.status) params['status'] = filtros.status;
    if (filtros.clienteId) params['clienteId'] = filtros.clienteId;

    return this.http.get<ApiResponse<Cobranca[]>>(this.baseUrl, { params }).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  resumo(): Observable<ResumoCobrancas> {
    return this.http.get<ApiResponse<ResumoCobrancas>>(`${this.baseUrl}/resumo`).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  criar(payload: CobrancaPayload): Observable<Cobranca> {
    return this.http.post<ApiResponse<Cobranca>>(this.baseUrl, payload).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  atualizar(id: string, payload: CobrancaPayload): Observable<Cobranca> {
    return this.http.patch<ApiResponse<Cobranca>>(`${this.baseUrl}/${id}`, payload).pipe(
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

  enviarPorEmail(id: string): Observable<{ success: boolean }> {
    return this.http
      .post<{ success: boolean }>(`${this.baseUrl}/send-email/${id}`, {})
      .pipe(catchError((erro) => this.tratarErro(erro)));
  }

  gerarLinkWhatsapp(id: string): Observable<LinkWhatsappResultado> {
    return this.http.post<ApiResponse<LinkWhatsappResultado>>(`${this.baseUrl}/send-whatsapp/${id}`, {}).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

  listarHistorico(filtros: {
    clienteId?: string;
    tipoEnvio?: string;
    dataInicio?: string;
    dataFim?: string;
  } = {}): Observable<BillingHistoryItem[]> {
    const params: Record<string, string> = {};
    if (filtros.clienteId) params['clienteId'] = filtros.clienteId;
    if (filtros.tipoEnvio) params['tipoEnvio'] = filtros.tipoEnvio;
    if (filtros.dataInicio) params['dataInicio'] = filtros.dataInicio;
    if (filtros.dataFim) params['dataFim'] = filtros.dataFim;

    return this.http.get<ApiResponse<BillingHistoryItem[]>>(`${this.baseUrl}/historico`, { params }).pipe(
      map((res) => res.data),
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
