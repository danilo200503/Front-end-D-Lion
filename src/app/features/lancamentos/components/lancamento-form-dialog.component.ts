import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { LancamentoFiscalPayload } from '../../../core/models/lancamento.model';
import { FiscalDocument } from '../../../core/models/fiscal-document.model';
import { FiscalService } from '../../../core/services/fiscal.service';

@Component({
  selector: 'dl-lancamento-form-dialog',
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
  templateUrl: './lancamento-form-dialog.component.html',
})
export class LancamentoFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<LancamentoFormDialogComponent>);
  private readonly fiscalService = inject(FiscalService);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true });

  readonly documentosDisponiveis = signal<FiscalDocument[]>([]);

  readonly form = this.fb.nonNullable.group({
    tipo: ['NOTA', [Validators.required]],
    naturezaOperacao: ['SAIDA', [Validators.required]],
    dataCompetencia: [new Date().toISOString().slice(0, 10), [Validators.required]],
    descricao: ['', [Validators.required, Validators.minLength(3)]],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    observacoes: [''],
    documentoFiscalId: [''],
  });

  ngOnInit(): void {
    this.fiscalService.buscarDocumentos().subscribe({
      next: (lista) => this.documentosDisponiveis.set(lista.filter((d) => d.status === 'CONCLUIDO')),
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const payload: LancamentoFiscalPayload = {
      tipo: valores.tipo as LancamentoFiscalPayload['tipo'],
      naturezaOperacao: valores.naturezaOperacao as LancamentoFiscalPayload['naturezaOperacao'],
      dataCompetencia: valores.dataCompetencia,
      descricao: valores.descricao,
      valor: Number(valores.valor),
      observacoes: valores.observacoes || undefined,
      documentoFiscalId: valores.documentoFiscalId || undefined,
    };

    this.dialogRef.close(payload);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
