import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { ResultadoAnaliseFiscal } from '../models/fiscal-document.model';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ai`;

    analisarDocumento(documentoId: string): Observable<ResultadoAnaliseFiscal> {
    return this.http
      .post<ApiResponse<ResultadoAnaliseFiscal>>(`${this.baseUrl}/analisar`, { xmlId: documentoId })
      .pipe(
        map((res) => res.data),
        catchError((erro) => this.tratarErro(erro))
      );
  }

  explicarComIA(documentoId: string): Observable<string> {
    return this.http
      .post<ApiResponse<{ explicacao: string }>>(`${this.baseUrl}/explicar`, { documentoId })
      .pipe(
        map((res) => res.data.explicacao),
        catchError((erro) => this.tratarErro(erro))
      );
  }

  private tratarErro(erro: unknown) {
    const mensagem =
      (erro as { error?: ApiResponse<unknown> & { message?: string } })?.error?.message ??
      'Não foi possível concluir a análise fiscal. Tente novamente em instantes.';
    return throwError(() => new Error(mensagem));
  }
}
