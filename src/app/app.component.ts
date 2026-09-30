import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AcessibilidadeComponent } from './shared/components/acessibilidade/acessibilidade.component';

@Component({
  selector: 'dl-root',
  standalone: true,
  imports: [RouterOutlet, AcessibilidadeComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
