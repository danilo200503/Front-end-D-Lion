import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { DashboardService } from './services/dashboard.service';
import { DashboardSummary } from './models/dashboard-summary.model';
import { BillingService } from '../../core/services/billing.service';
import { FiscalService } from '../../core/services/fiscal.service';
import { ResumoCobrancas, Cobranca } from '../../core/models/cobranca.model';
import { FiscalDocument } from '../../core/models/fiscal-document.model';

@Component({
  selector: 'dl-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, ChartComponent, HeroCarouselComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly billingService = inject(BillingService);
  private readonly fiscalService = inject(FiscalService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly erro = signal<string | null>(null);

  
  
  readonly resumoCobrancas = signal<ResumoCobrancas | null>(null);
  readonly carregandoCobrancas = signal(true);

  
  readonly ultimosDocumentos = signal<FiscalDocument[]>([]);
  readonly ultimasCobrancas = signal<Cobranca[]>([]);
  readonly carregandoAtividade = signal(true);

  readonly labelsErrosPorTipo = computed(() => this.summary()?.errosPorTipo.map((p) => p.label) ?? []);
  readonly dadosErrosPorTipo = computed(() => this.summary()?.errosPorTipo.map((p) => p.quantidade) ?? []);
  readonly labelsUploadsPorMes = computed(() => this.summary()?.uploadsPorMes.map((p) => p.label) ?? []);
  readonly dadosUploadsPorMes = computed(() => this.summary()?.uploadsPorMes.map((p) => p.quantidade) ?? []);

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (s) => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.loading.set(false);
      },
    });

    this.billingService.resumo().subscribe({
      next: (r) => {
        this.resumoCobrancas.set(r);
        this.carregandoCobrancas.set(false);
      },
      error: () => this.carregandoCobrancas.set(false),
    });

    this.fiscalService.buscarDocumentos().subscribe({
      next: (lista) => this.ultimosDocumentos.set(lista.slice(0, 5)),
      error: () => undefined,
    });

    this.billingService.listar().subscribe({
      next: (lista) => {
        this.ultimasCobrancas.set(
          [...lista].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()).slice(0, 5)
        );
        this.carregandoAtividade.set(false);
      },
      error: () => this.carregandoAtividade.set(false),
    });
  }

  formatarValor(valor?: number | null): string {
    if (valor == null) return 'A combinar';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
