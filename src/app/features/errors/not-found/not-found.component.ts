import { Component } from '@angular/core';
import { ErrorPageComponent } from '../../../shared/components/error-page/error-page.component';

@Component({
  selector: 'dl-not-found',
  standalone: true,
  imports: [ErrorPageComponent],
  template: `
    <dl-error-page
      codigo="404"
      icone="search_off"
      titulo="Página não encontrada"
      descricao="O endereço que você tentou acessar não existe ou foi movido."
      rotaBotao="/dashboard"
      textoBotao="Voltar ao Dashboard"
    ></dl-error-page>
  `,
})
export class NotFoundComponent {}
