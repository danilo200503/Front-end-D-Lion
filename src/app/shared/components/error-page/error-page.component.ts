import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dl-error-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})
export class ErrorPageComponent {
  @Input() codigo = '';
  @Input() icone = 'error_outline';
  @Input() titulo = '';
  @Input() descricao = '';
  @Input() rotaBotao = '/dashboard';
  @Input() textoBotao = 'Voltar ao início';
}
