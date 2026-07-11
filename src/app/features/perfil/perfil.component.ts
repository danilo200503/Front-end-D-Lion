import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsersService } from '../../core/services/users.service';
import { UserProfile } from '../../core/models/user-profile.model';

@Component({
  selector: 'dl-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly perfil = signal<UserProfile | null>(null);

  readonly salvandoPerfil = signal(false);
  readonly salvandoSenha = signal(false);

  readonly formPerfil = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    cargo: [''],
    telefone: [''],
  });

  readonly formSenha = this.fb.nonNullable.group({
    senhaAtual: ['', Validators.required],
    novaSenha: ['', [Validators.required, Validators.minLength(8)]],
    confirmarSenha: ['', Validators.required],
  });

  ngOnInit(): void {
    this.usersService.meuPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.formPerfil.patchValue({
          nome: perfil.nome,
          cargo: perfil.cargo ?? '',
          telefone: perfil.telefone ?? '',
        });
        this.carregando.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  salvarPerfil(): void {
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }

    this.salvandoPerfil.set(true);
    this.usersService.atualizarPerfil(this.formPerfil.getRawValue()).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.salvandoPerfil.set(false);
        this.snackBar.open('Perfil atualizado com sucesso.', 'Fechar', { duration: 3000 });
      },
      error: (e: Error) => {
        this.salvandoPerfil.set(false);
        this.snackBar.open(`Erro ao atualizar perfil: ${e.message}`, 'Fechar', { duration: 4000 });
      },
    });
  }

  trocarSenha(): void {
    if (this.formSenha.invalid) {
      this.formSenha.markAllAsTouched();
      return;
    }

    const valores = this.formSenha.getRawValue();
    if (valores.novaSenha !== valores.confirmarSenha) {
      this.snackBar.open('A confirmação de senha não coincide com a nova senha.', 'Fechar', { duration: 4000 });
      return;
    }

    this.salvandoSenha.set(true);
    this.usersService
      .trocarSenha({ senhaAtual: valores.senhaAtual, novaSenha: valores.novaSenha })
      .subscribe({
        next: () => {
          this.salvandoSenha.set(false);
          this.formSenha.reset();
          this.snackBar.open('Senha alterada com sucesso.', 'Fechar', { duration: 3000 });
        },
        error: (e: Error) => {
          this.salvandoSenha.set(false);
          this.snackBar.open(`Erro ao trocar senha: ${e.message}`, 'Fechar', { duration: 4000 });
        },
      });
  }
}
