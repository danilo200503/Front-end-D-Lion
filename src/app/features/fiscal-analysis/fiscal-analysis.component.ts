import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FiscalService } from '../../core/services/fiscal.service';
import { AiService } from '../../core/services/ai.service';
import { PdfService } from '../../core/services/pdf.service';
import { FiscalDocument, ResultadoAnaliseFiscal } from '../../core/models/fiscal-document.model';

@Component({
  selector: 'dl-fiscal-analysis',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSnackBarModule,
  ],
  templateUrl: './fiscal-analysis.component.html',
  styleUrl: './fiscal-analysis.component.scss',
})
export class FiscalAnalysisComponent implements OnInit {
  private readonly fiscalService = inject(FiscalService);
  private readonly aiService = inject(AiService);
  private readonly pdfService = inject(PdfService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly documentos = signal<FiscalDocument[]>([]);
  readonly selecionado = signal<FiscalDocument | null>(null);

  readonly analisando = signal(false);
  readonly resultado = signal<ResultadoAnaliseFiscal | null>(null);

  readonly explicandoComIA = signal(false);
  readonly explicacaoIA = signal<string | null>(null);
  readonly erroExplicacaoIA = signal<string | null>(null);

  readonly colunasErros = ['tipo', 'descricao', 'explicacao', 'correcao', 'severidade'];

  readonly documentosConcluidos = computed(() =>
    this.documentos().filter((d) => d.status === 'CONCLUIDO')
  );

  readonly quantidadeProdutos = computed(() => this.selecionado()?.itens?.length ?? 0);

  ngOnInit(): void {
    this.fiscalService.buscarDocumentos().subscribe({
      next: (lista) => {
        this.documentos.set(lista);
        this.carregando.set(false);

        const idNaRota = this.route.snapshot.queryParamMap.get('documentoId');
        const preSelecionado = idNaRota ? lista.find((d) => d.id === idNaRota) : undefined;
        const primeiro = preSelecionado ?? lista.find((d) => d.status === 'CONCLUIDO') ?? lista[0] ?? null;
        if (primeiro) this.selecionar(primeiro);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  selecionar(documento: FiscalDocument): void {
    this.selecionado.set(documento);
    this.resultado.set(null);
    this.explicacaoIA.set(null);
    this.erroExplicacaoIA.set(null);
  }

  analisarComIa(): void {
    const doc = this.selecionado();
    if (!doc) return;

    this.analisando.set(true);
    this.aiService.analisarDocumento(doc.id).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.analisando.set(false);
        
        
        this.selecionado.set({
          ...doc,
          scoreFiscal: res.score,
          classificacao: res.classificacao,
          erros: res.erros as unknown as unknown[],
        });
        this.snackBar.open('Análise concluída.', 'Fechar', { duration: 3000 });
      },
      error: (e: Error) => {
        this.analisando.set(false);
        this.snackBar.open(`Erro ao analisar: ${e.message}`, 'Fechar', { duration: 4000 });
      },
    });
  }

  gerarPdf(): void {
    const doc = this.selecionado();
    if (!doc) return;
    this.pdfService.gerarRelatorioAnalise(doc);
    this.snackBar.open('Exportação em PDF concluída.', 'Fechar', { duration: 3000 });
  }

  explicarComIA(): void {
    const doc = this.selecionado();
    if (!doc) return;

    this.explicandoComIA.set(true);
    this.erroExplicacaoIA.set(null);

    this.aiService.explicarComIA(doc.id).subscribe({
      next: (explicacao) => {
        this.explicacaoIA.set(explicacao);
        this.explicandoComIA.set(false);
      },
      error: (e: Error) => {
        this.erroExplicacaoIA.set(e.message);
        this.explicandoComIA.set(false);
      },
    });
  }

  readonly tiposDeErroConhecidos = ['CFOP', 'CST', 'ICMS', 'IPI', 'NCM', 'PIS', 'COFINS', 'CADASTRAL'];

  temErroDoTipo(erros: { tipo: string }[], tipo: string): boolean {
    return erros.some((e) => e.tipo === tipo);
  }

  formatarValor(valor?: number): string {
    if (valor === undefined) return '—';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  rotuloTipoDocumento(tipo?: string): string {
    switch (tipo) {
      case 'CTE': return 'CT-e';
      case 'NFCE': return 'NFC-e';
      case 'MDFE': return 'MDF-e';
      case 'NFSE': return 'NFS-e';
      default: return 'NF-e';
    }
  }

  corClassificacao(classificacao?: string): string {
    switch (classificacao) {
      case 'Excelente':
        return 'chip-excelente';
      case 'Boa':
        return 'chip-boa';
      case 'Regular':
        return 'chip-regular';
      case 'Ruim':
        return 'chip-ruim';
      default:
        return '';
    }
  }

  corSeveridade(severidade: string): string {
    switch (severidade) {
      case 'ALTA':
        return 'chip-ruim';
      case 'MEDIA':
        return 'chip-regular';
      default:
        return 'chip-boa';
    }
  }
}
