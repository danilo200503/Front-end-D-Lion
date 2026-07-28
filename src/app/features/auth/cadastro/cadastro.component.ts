import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'dl-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly carregando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly ocultarSenha = signal(true);
  readonly cadastroConcluido = signal(false);
  readonly emailCadastrado = signal('');
  readonly reenviando = signal(false);
  readonly reenviado = signal(false);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    nomeEmpresa: [''],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]],
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set(null);

    const { nome, nomeEmpresa, email, senha } = this.form.getRawValue();

    this.auth
      .register({
        nome: nome!,
        email: email!,
        senha: senha!,
        nomeEmpresa: nomeEmpresa || undefined,
      })
      .subscribe({
        next: (res) => {
          this.emailCadastrado.set(res.email);
          this.cadastroConcluido.set(true);
        },
        error: (erro) => {
          this.mensagemErro.set(erro.message ?? 'Não foi possível concluir o cadastro.');
          this.carregando.set(false);
        },
        complete: () => this.carregando.set(false),
      });
  }

  reenviarEmail(): void {
    this.reenviando.set(true);
    this.auth.reenviarVerificacao(this.emailCadastrado()).subscribe({
      next: () => this.reenviado.set(true),
      complete: () => this.reenviando.set(false),
    });
  }
}
