import { Component } from '@angular/core';
import { ErrorPageComponent } from '../../../shared/components/error-page/error-page.component';

@Component({
  selector: 'dl-session-expired',
  standalone: true,
  imports: [ErrorPageComponent],
  template: `
    <dl-error-page
      icone="schedule"
      titulo="Sua sessão expirou"
      descricao="Por segurança, você precisa entrar novamente para continuar usando o D-LION."
      rotaBotao="/login"
      textoBotao="Entrar novamente"
    ></dl-error-page>
  `,
})
export class SessionExpiredComponent {}
