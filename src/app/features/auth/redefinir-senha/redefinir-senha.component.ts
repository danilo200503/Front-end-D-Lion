import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'dl-redefinir-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './redefinir-senha.component.html',
  styleUrl: './redefinir-senha.component.scss',
})
export class RedefinirSenhaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly token = signal<string | null>(null);
  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly concluido = signal(false);

  readonly form = this.fb.group({
    novaSenha: ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit(): void {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    if (!this.token()) {
      this.mensagemErro.set('Link de redefinição inválido ou incompleto.');
    }
  }

  enviar(): void {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.auth.redefinirSenha(this.token()!, this.form.getRawValue().novaSenha!).subscribe({
      next: () => {
        this.concluido.set(true);
        setTimeout(() => this.router.navigateByUrl('/login'), 2000);
      },
      error: (erro) => this.mensagemErro.set(erro.message ?? 'Não foi possível redefinir sua senha.'),
      complete: () => this.carregando.set(false),
    });
  }
}
