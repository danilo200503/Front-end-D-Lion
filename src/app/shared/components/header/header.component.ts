import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'dl-header',
  standalone: true,
  imports: [LogoComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly sidebarState = inject(SidebarStateService);

  constructor(private auth: AuthService, private router: Router) {}

  get usuario() {
    return this.auth.currentUser();
  }

  abrirMenu(): void {
    this.sidebarState.toggle();
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
