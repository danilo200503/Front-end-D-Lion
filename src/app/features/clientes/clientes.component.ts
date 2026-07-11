import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente, ClientePayload } from '../../core/models/cliente.model';
import { ClienteFormDialogComponent } from './components/cliente-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'dl-clientes',
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
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly buscaSubject = new Subject<string>();

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly clientes = signal<Cliente[]>([]);
  readonly termoBusca = signal('');

  readonly colunas = ['nome', 'empresa', 'cpfCnpj', 'email', 'telefone', 'acoes'];

  constructor() {
    this.buscaSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe((termo) => {
      this.carregarClientes(termo);
    });
  }

  ngOnInit(): void {
    this.carregarClientes();
  }

  aoDigitarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.buscaSubject.next(termo);
  }

  private carregarClientes(busca?: string): void {
    this.carregando.set(true);
    this.clientesService.listar(busca).subscribe({
      next: (lista) => {
        this.clientes.set(lista);
        this.carregando.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  abrirNovoCliente(): void {
    const ref = this.dialog.open(ClienteFormDialogComponent, { data: {} });
    ref.afterClosed().subscribe((payload: ClientePayload | undefined) => {
      if (!payload) return;

      this.clientesService.criar(payload).subscribe({
        next: () => {
          this.snackBar.open('Cliente cadastrado com sucesso.', 'Fechar', { duration: 3000 });
          this.carregarClientes(this.termoBusca());
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  editarCliente(cliente: Cliente): void {
    const ref = this.dialog.open(ClienteFormDialogComponent, { data: { cliente } });
    ref.afterClosed().subscribe((payload: ClientePayload | undefined) => {
      if (!payload) return;

      this.clientesService.atualizar(cliente.id, payload).subscribe({
        next: () => {
          this.snackBar.open('Cliente atualizado com sucesso.', 'Fechar', { duration: 3000 });
          this.carregarClientes(this.termoBusca());
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }

  excluirCliente(cliente: Cliente): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir cliente',
        mensagem: `Excluir o cliente "${cliente.nome}"? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
        destrutivo: true,
      },
    });

    ref.afterClosed().subscribe((confirmado: boolean | undefined) => {
      if (!confirmado) return;

      this.clientesService.excluir(cliente.id).subscribe({
        next: () => {
          this.snackBar.open('Cliente excluído com sucesso.', 'Fechar', { duration: 3000 });
          this.carregarClientes(this.termoBusca());
        },
        error: (e: Error) => this.snackBar.open(`Erro: ${e.message}`, 'Fechar', { duration: 4000 }),
      });
    });
  }
}
