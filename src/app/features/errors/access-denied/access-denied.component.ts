import { Component } from '@angular/core';
import { ErrorPageComponent } from '../../../shared/components/error-page/error-page.component';

@Component({
  selector: 'dl-access-denied',
  standalone: true,
  imports: [ErrorPageComponent],
  template: `
    <dl-error-page
      codigo="403"
      icone="lock"
      titulo="Acesso negado"
      descricao="Você não tem permissão para acessar esta página. Se acredita que isso é um erro, contate o administrador da sua empresa."
      rotaBotao="/dashboard"
      textoBotao="Voltar ao Dashboard"
    ></dl-error-page>
  `,
})
export class AccessDeniedComponent {}
