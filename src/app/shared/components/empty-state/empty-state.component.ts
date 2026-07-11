import { Component, Input } from '@angular/core';

@Component({
  selector: 'dl-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input({ required: true }) title!: string;
  @Input() description?: string;
}
