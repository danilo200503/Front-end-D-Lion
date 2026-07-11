import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { FiscalService } from '../../../core/services/fiscal.service';
import { DashboardSummary, PontoGrafico } from '../models/dashboard-summary.model';

const HORAS_ECONOMIZADAS_POR_DOCUMENTO = 0.25;

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly fiscalService = inject(FiscalService);

  getSummary(): Observable<DashboardSummary> {
    return forkJoin({
      documentos: this.fiscalService.buscarDocumentos(),
      historico: this.fiscalService.buscarHistoricoAnalises(),
    }).pipe(
      map(({ documentos, historico }) => {
        const documentosEnviados = documentos.length;
        const documentosAnalisados = documentos.filter((d) => d.status === 'CONCLUIDO').length;
        const errosEncontrados = historico.reduce((total, h) => total + h.totalErros, 0);
        const economiaDeTempoHoras =
          Math.round(documentosAnalisados * HORAS_ECONOMIZADAS_POR_DOCUMENTO * 10) / 10;

        const empresasUnicas = new Set(documentos.map((d) => d.empresa).filter(Boolean));
        const empresas = empresasUnicas.size;

        const scoreMedio =
          historico.length > 0
            ? Math.round(historico.reduce((total, h) => total + h.scoreFiscal, 0) / historico.length)
            : null;

        const ultimaAnalise = historico[0]?.createdAt ?? null;

        const contagemPorTipo = new Map<string, number>();
        historico.forEach((h) =>
          h.erros.forEach((erro) => {
            contagemPorTipo.set(erro.tipo, (contagemPorTipo.get(erro.tipo) ?? 0) + 1);
          })
        );
        const errosPorTipo: PontoGrafico[] = Array.from(contagemPorTipo.entries()).map(
          ([label, quantidade]) => ({ label, quantidade })
        );

        const contagemPorMes = new Map<string, number>();
        documentos.forEach((d) => {
          const data = new Date(d.createdAt);
          const chave = `${MESES[data.getMonth()]}/${data.getFullYear()}`;
          contagemPorMes.set(chave, (contagemPorMes.get(chave) ?? 0) + 1);
        });
        const uploadsPorMes: PontoGrafico[] = Array.from(contagemPorMes.entries())
          .map(([label, quantidade]) => ({ label, quantidade }))
          .slice(-6);

        return {
          documentosEnviados,
          documentosAnalisados,
          errosEncontrados,
          economiaDeTempoHoras,
          empresas,
          scoreMedio,
          ultimaAnalise,
          errosPorTipo,
          uploadsPorMes,
        };
      })
    );
  }
}
