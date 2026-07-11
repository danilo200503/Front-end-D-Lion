import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FiscalService } from '../../core/services/fiscal.service';
import { ExcelService } from '../../core/services/excel.service';
import { FiscalDocument } from '../../core/models/fiscal-document.model';

@Component({
  selector: 'dl-reports',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private readonly fiscalService = inject(FiscalService);
  private readonly excelService = inject(ExcelService);
  private readonly snackBar = inject(MatSnackBar);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly documentos = signal<FiscalDocument[]>([]);
  readonly selecionados = signal<Set<string>>(new Set());
  readonly gerando = signal(false);

  readonly documentosAnalisados = computed(() =>
    this.documentos().filter((d) => d.status === 'CONCLUIDO')
  );

  readonly temSelecao = computed(() => this.selecionados().size > 0);

  ngOnInit(): void {
    this.fiscalService.buscarDocumentos().subscribe({
      next: (lista) => {
        this.documentos.set(lista);
        this.carregando.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  alternarSelecao(id: string): void {
    const atual = new Set(this.selecionados());
    if (atual.has(id)) atual.delete(id);
    else atual.add(id);
    this.selecionados.set(atual);
  }

  selecionarTodos(): void {
    this.selecionados.set(new Set(this.documentosAnalisados().map((d) => d.id)));
  }

  limparSelecao(): void {
    this.selecionados.set(new Set());
  }

  gerarPlanilha(): void {
    const escolhidos = this.documentosAnalisados().filter((d) => this.selecionados().has(d.id));
    const lista = escolhidos.length > 0 ? escolhidos : this.documentosAnalisados();

    if (lista.length === 0) return;

    this.gerando.set(true);
    try {
      this.excelService.gerarPlanilhaDocumentosFiscais(lista);
      this.snackBar.open('Exportação concluída.', 'Fechar', { duration: 3000 });
    } finally {
      this.gerando.set(false);
    }
  }
}
