import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'dl-oauth-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './oauth-callback.component.html',
  styleUrl: './oauth-callback.component.scss',
})
export class OauthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly erro = signal(false);

  ngOnInit(): void {
    const accessToken = this.route.snapshot.queryParamMap.get('accessToken');
    const refreshToken = this.route.snapshot.queryParamMap.get('refreshToken');

    if (!accessToken || !refreshToken) {
      this.erro.set(true);
      return;
    }

    this.auth.definirSessao(accessToken, refreshToken);
    this.auth.carregarUsuarioAtual().subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => this.erro.set(true),
    });
  }
}
