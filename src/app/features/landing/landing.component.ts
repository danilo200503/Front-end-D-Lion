import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'dl-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  readonly menuAberto = signal(false);
  readonly anoAtual = new Date().getFullYear();

  alternarMenu(): void {
    this.menuAberto.set(!this.menuAberto());
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }

  entrarComGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }
}
