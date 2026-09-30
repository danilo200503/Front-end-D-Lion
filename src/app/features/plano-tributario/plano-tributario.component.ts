import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlanoTributarioService } from '../../core/services/plano-tributario.service';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente } from '../../core/models/cliente.model';
import { PlanoTributario } from '../../core/models/plano-tributario.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'dl-plano-tributario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './plano-tributario.component.html',
  styleUrl: './plano-tributario.component.scss',
})
export class PlanoTributarioComponent implements OnInit {
  private readonly planoTributarioService = inject(PlanoTributarioService);
  private readonly clientesService = inject(ClientesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly clientes = signal<Cliente[]>([]);
  readonly clienteSelecionadoId = signal<string>('');
  readonly gerando = signal(false);
  readonly erroGeracao = signal<string | null>(null);

  readonly carregandoHistorico = signal(true);
  readonly historico = signal<PlanoTributario[]>([]);
  readonly planoAberto = signal<PlanoTributario | null>(null);

  ngOnInit(): void {
    this.clientesService.listar().subscribe({ next: (lista) => this.clientes.set(lista) });
    this.carregarHistorico();
  }

  private carregarHistorico(): void {
    this.carregandoHistorico.set(true);
    this.planoTributarioService.listar().subscribe({
      next: (lista) => {
        this.historico.set(lista);
        this.carregandoHistorico.set(false);
      },
      error: () => this.carregandoHistorico.set(false),
    });
  }

  gerarPlano(): void {
    const clienteId = this.clienteSelecionadoId();
    if (!clienteId) {
      this.erroGeracao.set('Selecione um cliente antes de gerar o plano.');
      return;
    }

    this.gerando.set(true);
    this.erroGeracao.set(null);
    this.planoAberto.set(null);

    this.planoTributarioService.gerar(clienteId).subscribe({
      next: (plano) => {
        this.gerando.set(false);
        this.planoAberto.set(plano);
        this.carregarHistorico();
        this.snackBar.open('Plano tributário gerado com sucesso.', 'Fechar', { duration: 3000 });
      },
      error: (e: Error) => {
        this.gerando.set(false);
        this.erroGeracao.set(e.message);
      },
    });
  }

  abrirPlano(plano: PlanoTributario): void {
    this.planoAberto.set(plano);
  }

  fecharPlano(): void {
    this.planoAberto.set(null);
  }

  excluirPlano(plano: PlanoTributario, evento: Event): void {
    evento.stopPropagation();

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir plano tributário',
        mensagem: `Excluir o plano gerado para "${plano.cliente?.nome ?? 'cliente'}"? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
        destrutivo: true,
      },
    });

    ref.afterClosed().subscribe((confirmado: boolean | undefined) => {
      if (!confirmado) return;

      this.planoTributarioService.excluir(plano.id).subscribe({
        next: () => {
          if (this.planoAberto()?.id === plano.id) this.planoAberto.set(null);
          this.snackBar.open('Plano excluído com sucesso.', 'Fechar', { duration: 3000 });
          this.carregarHistorico();
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
