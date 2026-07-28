import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LancamentosService } from '../../core/services/lancamentos.service';
import { LancamentoFiscal, LancamentoFiscalPayload } from '../../core/models/lancamento.model';
import { LancamentoFormDialogComponent } from './components/lancamento-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'dl-lancamentos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './lancamentos.component.html',
  styleUrl: './lancamentos.component.scss',
})
export class LancamentosComponent implements OnInit {
  private readonly lancamentosService = inject(LancamentosService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly lancamentos = signal<LancamentoFiscal[]>([]);
  readonly explicandoId = signal<string | null>(null);
  readonly explicacaoAberta = signal<string | null>(null);

  readonly colunas = ['tipo', 'naturezaOperacao', 'dataCompetencia', 'descricao', 'valor', 'acoes'];

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.lancamentosService.listar().subscribe({
      next: (lista) => {
        this.lancamentos.set(lista);
        this.carregando.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  abrirNovoLancamento(): void {
    const ref = this.dialog.open(LancamentoFormDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((payload: LancamentoFiscalPayload | undefined) => {
      if (!payload) return;

      this.lancamentosService.criar(payload).subscribe({
        next: () => {
          this.snackBar.open('Lançamento registrado com sucesso.', 'Fechar', { duration: 3000 });
          this.carregar();
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  excluirLancamento(lancamento: LancamentoFiscal): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir lançamento',
        mensagem: `Excluir o lançamento "${lancamento.descricao}"? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
        destrutivo: true,
      },
    });

    ref.afterClosed().subscribe((confirmado: boolean | undefined) => {
      if (!confirmado) return;

      this.lancamentosService.excluir(lancamento.id).subscribe({
        next: () => {
          this.snackBar.open('Lançamento excluído com sucesso.', 'Fechar', { duration: 3000 });
          this.carregar();
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  explicarComIA(lancamento: LancamentoFiscal): void {
    this.explicandoId.set(lancamento.id);
    this.explicacaoAberta.set(null);

    this.lancamentosService.explicarComIA(lancamento.id).subscribe({
      next: (explicacao) => {
        this.explicandoId.set(null);
        this.explicacaoAberta.set(lancamento.id);
        lancamento.explicacaoIA = explicacao;
      },
      error: (e: Error) => {
        this.explicandoId.set(null);
        this.snackBar.open(`Erro ao explicar: ${e.message}`, 'Fechar', { duration: 4000 });
      },
    });
  }

  rotuloTipo(tipo: string): string {
    return { NOTA: 'Nota', CUPOM: 'Cupom', DANFE: 'DANFE', OUTRO: 'Outro' }[tipo] ?? tipo;
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
