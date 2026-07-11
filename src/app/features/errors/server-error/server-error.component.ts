import { Component } from '@angular/core';
import { ErrorPageComponent } from '../../../shared/components/error-page/error-page.component';

@Component({
  selector: 'dl-server-error',
  standalone: true,
  imports: [ErrorPageComponent],
  template: `
    <dl-error-page
      codigo="500"
      icone="dns"
      titulo="Erro interno do servidor"
      descricao="Algo deu errado do nosso lado. Tente novamente em alguns instantes; se o problema persistir, contate o suporte."
      rotaBotao="/dashboard"
      textoBotao="Voltar ao Dashboard"
    ></dl-error-page>
  `,
})
export class ServerErrorComponent {}
