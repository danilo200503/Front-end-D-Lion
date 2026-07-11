import { Component, Input } from '@angular/core';

@Component({
  selector: 'dl-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  @Input() label = 'Carregando...';
}
