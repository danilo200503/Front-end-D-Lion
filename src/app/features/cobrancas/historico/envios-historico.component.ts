import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BillingService } from '../../../core/services/billing.service';
import { ClientesService } from '../../../core/services/clientes.service';
import { BillingHistoryItem, TipoEnvioCobranca } from '../../../core/models/cobranca.model';
import { Cliente } from '../../../core/models/cliente.model';

@Component({
  selector: 'dl-envios-historico',
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
    MatInputModule,
  ],
  templateUrl: './envios-historico.component.html',
  styleUrl: './envios-historico.component.scss',
})
export class EnviosHistoricoComponent implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly clientesService = inject(ClientesService);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly historico = signal<BillingHistoryItem[]>([]);
  readonly clientes = signal<Cliente[]>([]);

  readonly filtroClienteId = signal<string>('TODOS');
  readonly filtroTipo = signal<TipoEnvioCobranca | 'TODOS'>('TODOS');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');

  readonly colunas = ['cliente', 'descricao', 'tipoEnvio', 'dataEnvio'];

  readonly historicoOrdenado = computed(() =>
    [...this.historico()].sort((a, b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime())
  );

  ngOnInit(): void {
    this.clientesService.listar().subscribe((lista) => this.clientes.set(lista));
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.billingService
      .listarHistorico({
        clienteId: this.filtroClienteId() !== 'TODOS' ? this.filtroClienteId() : undefined,
        tipoEnvio: this.filtroTipo() !== 'TODOS' ? this.filtroTipo() : undefined,
        dataInicio: this.dataInicio() || undefined,
        dataFim: this.dataFim() || undefined,
      })
      .subscribe({
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

  aoMudarFiltro(): void {
    this.carregar();
  }
}
