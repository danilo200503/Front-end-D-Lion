import { Component, Input } from '@angular/core';

@Component({
  selector: 'dl-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  @Input() size = 32;
  @Input() showWordmark = true;
}

