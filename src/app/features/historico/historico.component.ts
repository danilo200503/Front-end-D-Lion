import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FiscalService } from '../../core/services/fiscal.service';
import { FiscalAnalysisHistorico } from '../../core/models/fiscal-document.model';

type PeriodoFiltro = 'TODOS' | '7' | '30' | '90';

@Component({
  selector: 'dl-historico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
  ],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.scss',
})
export class HistoricoComponent implements OnInit {
  private readonly fiscalService = inject(FiscalService);
  private readonly router = inject(Router);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly historico = signal<FiscalAnalysisHistorico[]>([]);

  readonly termoBusca = signal('');
  readonly periodo = signal<PeriodoFiltro>('TODOS');
  readonly scoreMinimo = signal<number | null>(null);

  readonly paginaAtual = signal(0);
  readonly tamanhoPagina = signal(10);

  readonly colunas = ['empresa', 'cnpj', 'nota', 'data', 'score', 'erros', 'status', 'acoes'];

  readonly historicoFiltrado = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const periodo = this.periodo();
    const scoreMin = this.scoreMinimo();
    const agora = Date.now();

    return this.historico().filter((registro) => {
      const doc = registro.document;

      if (termo) {
        const alvo = `${doc.empresa ?? ''} ${doc.cnpj ?? ''} ${doc.numeroNota ?? ''}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }

      if (periodo !== 'TODOS') {
        const dias = Number(periodo);
        const limite = agora - dias * 24 * 60 * 60 * 1000;
        if (new Date(registro.createdAt).getTime() < limite) return false;
      }

      if (scoreMin !== null && registro.scoreFiscal < scoreMin) return false;

      return true;
    });
  });

  readonly historicoPaginado = computed(() => {
    const inicio = this.paginaAtual() * this.tamanhoPagina();
    return this.historicoFiltrado().slice(inicio, inicio + this.tamanhoPagina());
  });

  ngOnInit(): void {
    this.fiscalService.buscarHistoricoAnalises().subscribe({
      next: (lista) => {
        this.historico.set(lista);
        this.carregando.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  aoMudarPagina(evento: PageEvent): void {
    this.paginaAtual.set(evento.pageIndex);
    this.tamanhoPagina.set(evento.pageSize);
  }

  visualizarNovamente(registro: FiscalAnalysisHistorico): void {
    this.router.navigate(['/analises'], { queryParams: { documentoId: registro.documentId } });
  }

  corClassificacao(classificacao: string): string {
    switch (classificacao) {
      case 'Excelente':
      case 'Boa':
        return 'chip-boa';
      case 'Regular':
        return 'chip-regular';
      default:
        return 'chip-ruim';
    }
  }
}
