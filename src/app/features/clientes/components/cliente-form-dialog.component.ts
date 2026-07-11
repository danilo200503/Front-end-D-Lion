import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Cliente, ClientePayload } from '../../../core/models/cliente.model';

export interface ClienteFormDialogData {
  cliente?: Cliente;
}

@Component({
  selector: 'dl-cliente-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './cliente-form-dialog.component.html',
})
export class ClienteFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ClienteFormDialogComponent>);
  readonly data = inject<ClienteFormDialogData>(MAT_DIALOG_DATA);

  readonly modoEdicao = !!this.data?.cliente;

  readonly form = this.fb.nonNullable.group({
    nome: [this.data?.cliente?.nome ?? '', [Validators.required, Validators.minLength(2)]],
    empresa: [this.data?.cliente?.empresa ?? ''],
    cpfCnpj: [this.data?.cliente?.cpfCnpj ?? ''],
    email: [this.data?.cliente?.email ?? '', [Validators.email]],
    telefone: [this.data?.cliente?.telefone ?? ''],
  });

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const payload: ClientePayload = {
      nome: valores.nome,
      empresa: valores.empresa || undefined,
      cpfCnpj: valores.cpfCnpj || undefined,
      email: valores.email || undefined,
      telefone: valores.telefone || undefined,
    };

    this.dialogRef.close(payload);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
