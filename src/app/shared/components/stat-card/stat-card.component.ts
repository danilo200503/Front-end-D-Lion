import { Component, Input } from '@angular/core';

@Component({
  selector: 'dl-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() delta?: string;
  @Input() trend: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() icon?: string;
}
