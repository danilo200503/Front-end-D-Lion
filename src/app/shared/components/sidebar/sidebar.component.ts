import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'dl-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly sidebarState = inject(SidebarStateService);

  readonly isOpenMobile = this.sidebarState.isOpenMobile;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', route: '/dashboard' },
    { label: 'Documentos Fiscais', icon: 'cloud_upload', route: '/documentos' },
    { label: 'Análises', icon: 'fact_check', route: '/analises' },
    { label: 'Histórico', icon: 'history', route: '/historico' },
    { label: 'Planilhas', icon: 'grid_on', route: '/planilhas' },
    { label: 'IA Fiscal', icon: 'psychology', route: '/ia-fiscal' },
    { label: 'Clientes', icon: 'group', route: '/clientes' },
    { label: 'Cobranças', icon: 'request_quote', route: '/cobrancas' },
    { label: 'Configurações', icon: 'settings', route: '/configuracoes' },
  ];

  fecharMenuMobile(): void {
    this.sidebarState.close();
  }
}
