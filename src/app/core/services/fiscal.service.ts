import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, tap } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';
import { FiscalDocument, FiscalAnalysisHistorico } from '../models/fiscal-document.model';

@Injectable({ providedIn: 'root' })
export class FiscalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/fiscal`;

    readonly documentos = signal<FiscalDocument[]>([]);

    enviarXml(file: File): Observable<FiscalDocument> {
    const formData = new FormData();
    formData.append('arquivo', file, file.name);

    return this.http.post<ApiResponse<FiscalDocument>>(`${this.baseUrl}/upload-xml`, formData).pipe(
      map((res) => res.data),
      tap((documento) => this.documentos.update((lista) => [documento, ...lista])),
      catchError((erro) => this.tratarErro(erro))
    );
  }

    buscarDocumentos(): Observable<FiscalDocument[]> {
    return this.http.get<ApiResponse<FiscalDocument[]>>(this.baseUrl).pipe(
      map((res) => res.data),
      tap((lista) => this.documentos.set(lista)),
      catchError((erro) => this.tratarErro(erro))
    );
  }

    buscarDocumentoPorId(id: string): Observable<FiscalDocument> {
    return this.http.get<ApiResponse<FiscalDocument>>(`${this.baseUrl}/${id}`).pipe(
      map((res) => res.data),
      catchError((erro) => this.tratarErro(erro))
    );
  }

    buscarHistoricoAnalises(): Observable<FiscalAnalysisHistorico[]> {
    return this.http.get<ApiResponse<FiscalAnalysisHistorico[]>>(`${this.baseUrl}/historico/analises`).pipe(
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
