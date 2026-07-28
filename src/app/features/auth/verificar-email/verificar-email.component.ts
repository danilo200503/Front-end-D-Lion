import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'dl-verificar-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verificar-email.component.html',
  styleUrl: './verificar-email.component.scss',
})
export class VerificarEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly estado = signal<'verificando' | 'sucesso' | 'erro'>('verificando');
  readonly mensagemErro = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.estado.set('erro');
      this.mensagemErro.set('Link de verificação inválido.');
      return;
    }

    this.auth.verificarEmail(token).subscribe({
      next: () => {
        this.estado.set('sucesso');
        setTimeout(() => this.router.navigateByUrl('/dashboard'), 1800);
      },
      error: (erro) => {
        this.estado.set('erro');
        this.mensagemErro.set(erro.message ?? 'Não foi possível verificar seu e-mail.');
      },
    });
  }
}
