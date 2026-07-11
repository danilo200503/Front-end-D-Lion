import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'dl-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);
  readonly showTermos = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    aceitaTermos: [false, [Validators.requiredTrue]],
  });

  abrirTermos(event: Event): void {
    event.preventDefault();
    this.showTermos.set(true);
  }

  fecharTermos(): void {
    this.showTermos.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, senha, aceitaTermos } = this.form.getRawValue();

    if (!aceitaTermos) {
      this.errorMessage.set('Você precisa aceitar os Termos de Uso para continuar.');
      this.loading.set(false);
      return;
    }

    this.auth.login({ email: email!, senha: senha! }).subscribe({
      next: () => {
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
        this.router.navigateByUrl(redirectTo ?? '/dashboard');
      },
      error: () => {
        this.errorMessage.set('E-mail ou senha inválidos. Tente novamente.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
