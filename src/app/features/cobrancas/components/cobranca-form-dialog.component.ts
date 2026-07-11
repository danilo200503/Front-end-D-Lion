import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ClientesService } from '../../../core/services/clientes.service';
import { Cliente } from '../../../core/models/cliente.model';
import { Cobranca, CobrancaPayload, StatusCobranca } from '../../../core/models/cobranca.model';

export interface CobrancaFormDialogData {
  cobranca?: Cobranca;
}

@Component({
  selector: 'dl-cobranca-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './cobranca-form-dialog.component.html',
})
export class CobrancaFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CobrancaFormDialogComponent>);
  private readonly clientesService = inject(ClientesService);
  readonly data = inject<CobrancaFormDialogData>(MAT_DIALOG_DATA);

  readonly modoEdicao = !!this.data?.cobranca;
  readonly clientes = signal<Cliente[]>([]);

  readonly statusOpcoes: StatusCobranca[] = ['PENDENTE', 'ENVIADA', 'PAGA', 'ATRASADA'];

  readonly form = this.fb.nonNullable.group({
    clienteId: [this.data?.cobranca?.clienteId ?? '', Validators.required],
    descricao: [this.data?.cobranca?.descricao ?? '', [Validators.required, Validators.minLength(3)]],
    valor: [this.data?.cobranca?.valor ?? null, [Validators.min(0.01)]],
    vencimento: [
      this.data?.cobranca?.vencimento ? new Date(this.data.cobranca.vencimento) : new Date(),
      Validators.required,
    ],
    status: [(this.data?.cobranca?.status ?? 'PENDENTE') as StatusCobranca],
  });

  ngOnInit(): void {
    this.clientesService.listar().subscribe((lista) => this.clientes.set(lista));
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const payload: CobrancaPayload = {
      clienteId: valores.clienteId,
      descricao: valores.descricao,
      valor: valores.valor != null && valores.valor !== ('' as never) ? Number(valores.valor) : undefined,
      vencimento: new Date(valores.vencimento).toISOString(),
      status: valores.status,
    };

    this.dialogRef.close(payload);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
