import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService } from '../../../core/services/accessibility.service';

@Component({
  selector: 'dl-acessibilidade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acessibilidade.component.html',
  styleUrl: './acessibilidade.component.scss',
})
export class AcessibilidadeComponent {
  readonly a11y = inject(AccessibilityService);
  readonly painelAberto = signal(false);

  alternarPainel(): void {
    this.painelAberto.set(!this.painelAberto());
  }

  fecharPainel(): void {
    this.painelAberto.set(false);
  }
}
