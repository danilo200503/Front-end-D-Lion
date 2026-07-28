import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ApuracaoPayload } from '../../../core/models/apuracao.model';

@Component({
  selector: 'dl-apuracao-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './apuracao-form-dialog.component.html',
})
export class ApuracaoFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ApuracaoFormDialogComponent>);

  readonly form = this.fb.nonNullable.group({
    competencia: [new Date().toISOString().slice(0, 7), [Validators.required]],
    regimeTributario: ['SIMPLES_NACIONAL', [Validators.required]],
    anexoSimples: ['I'],
    receitaBrutaPeriodo: [0, [Validators.required, Validators.min(0.01)]],
    receitaBrutaUltimos12Meses: [0],
    totalDebitos: [0],
    totalCreditos: [0],
  });

  readonly ehSimplesNacional = computed(() => this.form.controls.regimeTributario.value === 'SIMPLES_NACIONAL');

  constructor() {
    this.form.controls.regimeTributario.valueChanges.subscribe(() => this.form.updateValueAndValidity());
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const regime = valores.regimeTributario as ApuracaoPayload['regimeTributario'];

    const payload: ApuracaoPayload = {
      competencia: valores.competencia,
      regimeTributario: regime,
      receitaBrutaPeriodo: Number(valores.receitaBrutaPeriodo),
      ...(regime === 'SIMPLES_NACIONAL'
        ? {
            anexoSimples: valores.anexoSimples as 'I' | 'III',
            receitaBrutaUltimos12Meses: Number(valores.receitaBrutaUltimos12Meses),
          }
        : {
            totalDebitos: Number(valores.totalDebitos),
            totalCreditos: Number(valores.totalCreditos),
          }),
    };

    this.dialogRef.close(payload);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
