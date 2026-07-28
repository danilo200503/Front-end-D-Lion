import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApuracaoService } from '../../core/services/apuracao.service';
import { Apuracao, ApuracaoPayload } from '../../core/models/apuracao.model';
import { ApuracaoFormDialogComponent } from './components/apuracao-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'dl-apuracao',
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
  templateUrl: './apuracao.component.html',
  styleUrl: './apuracao.component.scss',
})
export class ApuracaoComponent implements OnInit {
  private readonly apuracaoService = inject(ApuracaoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly apuracoes = signal<Apuracao[]>([]);
  readonly explicandoId = signal<string | null>(null);
  readonly explicacaoAberta = signal<string | null>(null);

  readonly colunas = ['competencia', 'regimeTributario', 'totalDebitos', 'totalCreditos', 'valorApurado', 'acoes'];

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.apuracaoService.listar().subscribe({
      next: (lista) => {
        this.apuracoes.set(lista);
        this.carregando.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  abrirNovaApuracao(): void {
    const ref = this.dialog.open(ApuracaoFormDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((payload: ApuracaoPayload | undefined) => {
      if (!payload) return;

      this.apuracaoService.criar(payload).subscribe({
        next: () => {
          this.snackBar.open('Apuração calculada com sucesso.', 'Fechar', { duration: 3000 });
          this.carregar();
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  excluirApuracao(apuracao: Apuracao): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir apuração',
        mensagem: `Excluir a apuração de ${apuracao.competencia}? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
        destrutivo: true,
      },
    });

    ref.afterClosed().subscribe((confirmado: boolean | undefined) => {
      if (!confirmado) return;

      this.apuracaoService.excluir(apuracao.id).subscribe({
        next: () => {
          this.snackBar.open('Apuração excluída com sucesso.', 'Fechar', { duration: 3000 });
          this.carregar();
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  explicarComIA(apuracao: Apuracao): void {
    this.explicandoId.set(apuracao.id);
    this.explicacaoAberta.set(null);

    this.apuracaoService.explicarComIA(apuracao.id).subscribe({
      next: (explicacao) => {
        this.explicandoId.set(null);
        this.explicacaoAberta.set(apuracao.id);
        apuracao.explicacaoIA = explicacao;
      },
      error: (e: Error) => {
        this.explicandoId.set(null);
        this.snackBar.open(`Erro ao explicar: ${e.message}`, 'Fechar', { duration: 4000 });
      },
    });
  }

  rotuloRegime(regime: string): string {
    return (
      { SIMPLES_NACIONAL: 'Simples Nacional', LUCRO_PRESUMIDO: 'Lucro Presumido', LUCRO_REAL: 'Lucro Real' }[
        regime
      ] ?? regime
    );
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
