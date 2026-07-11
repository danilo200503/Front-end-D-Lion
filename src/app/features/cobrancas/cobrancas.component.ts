import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BillingService } from '../../core/services/billing.service';
import { ClientesService } from '../../core/services/clientes.service';
import { Cobranca, CobrancaPayload, StatusCobranca } from '../../core/models/cobranca.model';
import { Cliente } from '../../core/models/cliente.model';
import { CobrancaFormDialogComponent } from './components/cobranca-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'dl-cobrancas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './cobrancas.component.html',
  styleUrl: './cobrancas.component.scss',
})
export class CobrancasComponent implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly clientesService = inject(ClientesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly cobrancas = signal<Cobranca[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly enviando = signal<string | null>(null);

  readonly filtroStatus = signal<StatusCobranca | 'TODOS'>('TODOS');
  readonly filtroClienteId = signal<string | 'TODOS'>('TODOS');

  readonly statusOpcoes: StatusCobranca[] = ['PENDENTE', 'ENVIADA', 'PAGA', 'ATRASADA'];
  readonly colunas = ['cliente', 'descricao', 'valor', 'vencimento', 'status', 'acoes'];

  ngOnInit(): void {
    this.clientesService.listar().subscribe((lista) => this.clientes.set(lista));
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    const status = this.filtroStatus() !== 'TODOS' ? this.filtroStatus() : undefined;
    const clienteId = this.filtroClienteId() !== 'TODOS' ? this.filtroClienteId() : undefined;

    this.billingService.listar({ status, clienteId }).subscribe({
      next: (lista) => {
        this.cobrancas.set(lista);
        this.carregando.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  aoMudarFiltroStatus(status: StatusCobranca | 'TODOS'): void {
    this.filtroStatus.set(status);
    this.carregar();
  }

  aoMudarFiltroCliente(clienteId: string | 'TODOS'): void {
    this.filtroClienteId.set(clienteId);
    this.carregar();
  }

  abrirNovaCobranca(): void {
    const ref = this.dialog.open(CobrancaFormDialogComponent, { data: {} });
    ref.afterClosed().subscribe((payload: CobrancaPayload | undefined) => {
      if (!payload) return;

      this.billingService.criar(payload).subscribe({
        next: () => {
          this.snackBar.open('Cobrança criada com sucesso.', 'Fechar', { duration: 3000 });
          this.carregar();
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  editarCobranca(cobranca: Cobranca): void {
    const ref = this.dialog.open(CobrancaFormDialogComponent, { data: { cobranca } });
    ref.afterClosed().subscribe((payload: CobrancaPayload | undefined) => {
      if (!payload) return;

      this.billingService.atualizar(cobranca.id, payload).subscribe({
        next: () => {
          this.snackBar.open('Cobrança atualizada com sucesso.', 'Fechar', { duration: 3000 });
          this.carregar();
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  excluirCobranca(cobranca: Cobranca): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir cobrança',
        mensagem: `Excluir a cobrança "${cobranca.descricao}"? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
        destrutivo: true,
      },
    });

    ref.afterClosed().subscribe((confirmado: boolean | undefined) => {
      if (!confirmado) return;

      this.billingService.excluir(cobranca.id).subscribe({
        next: () => {
          this.snackBar.open('Cobrança excluída com sucesso.', 'Fechar', { duration: 3000 });
          this.carregar();
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  enviarPorEmail(cobranca: Cobranca): void {
    this.enviando.set(cobranca.id);
    this.billingService.enviarPorEmail(cobranca.id).subscribe({
      next: () => {
        this.enviando.set(null);
        this.snackBar.open('Cobrança enviada por e-mail com sucesso.', 'Fechar', { duration: 3000 });
        this.carregar();
      },
      error: (e: Error) => {
        this.enviando.set(null);
        this.snackBar.open(`Erro ao enviar e-mail: ${e.message}`, 'Fechar', { duration: 4000 });
      },
    });
  }

  enviarPorWhatsapp(cobranca: Cobranca): void {
    this.enviando.set(cobranca.id);
    this.billingService.gerarLinkWhatsapp(cobranca.id).subscribe({
      next: (resultado) => {
        this.enviando.set(null);
        window.open(resultado.link, '_blank');
        this.snackBar.open('Link do WhatsApp gerado e registrado no histórico.', 'Fechar', { duration: 3000 });
        this.carregar();
      },
      error: (e: Error) => {
        this.enviando.set(null);
        this.snackBar.open(`Erro ao gerar link do WhatsApp: ${e.message}`, 'Fechar', { duration: 4000 });
      },
    });
  }

  formatarValor(valor?: number | null): string {
    if (valor == null) return 'A combinar';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  corStatus(status: StatusCobranca): string {
    switch (status) {
      case 'PAGA':
        return 'chip-paga';
      case 'ENVIADA':
        return 'chip-enviada';
      case 'ATRASADA':
        return 'chip-atrasada';
      default:
        return 'chip-pendente';
    }
  }
}
