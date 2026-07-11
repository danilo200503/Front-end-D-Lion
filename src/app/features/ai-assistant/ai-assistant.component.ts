import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FiscalService } from '../../core/services/fiscal.service';
import { AiService } from '../../core/services/ai.service';
import { FiscalDocument, ResultadoAnaliseFiscal } from '../../core/models/fiscal-document.model';

@Component({
  selector: 'dl-ai-assistant',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss',
})
export class AiAssistantComponent implements OnInit {
  private readonly fiscalService = inject(FiscalService);
  private readonly aiService = inject(AiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly documentos = signal<FiscalDocument[]>([]);
  readonly documentoSelecionadoId = signal<string | null>(null);
  readonly analisando = signal(false);
  readonly resultado = signal<ResultadoAnaliseFiscal | null>(null);

  ngOnInit(): void {
    this.fiscalService.buscarDocumentos().subscribe((lista) => this.documentos.set(lista));
  }

  get documentoSelecionado(): FiscalDocument | undefined {
    return this.documentos().find((d) => d.id === this.documentoSelecionadoId());
  }

  selecionarDocumento(id: string): void {
    this.documentoSelecionadoId.set(id);
    this.resultado.set(null);
  }

  analisar(): void {
    const doc = this.documentoSelecionado;
    if (!doc) return;

    this.analisando.set(true);
    this.aiService.analisarDocumento(doc.id).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.analisando.set(false);
        this.snackBar.open('Análise concluída.', 'Fechar', { duration: 3000 });
      },
      error: (e: Error) => {
        this.analisando.set(false);
        this.snackBar.open(`Erro ao analisar: ${e.message}`, 'Fechar', { duration: 4000 });
      },
    });
  }

  corClassificacao(classificacao?: string): string {
    switch (classificacao) {
      case 'Excelente':
      case 'Boa':
        return 'chip-boa';
      case 'Regular':
        return 'chip-regular';
      default:
        return 'chip-ruim';
    }
  }
}
