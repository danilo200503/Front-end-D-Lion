import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FiscalService } from '../../core/services/fiscal.service';
import { FiscalDocument, FiscalDocumentStatus } from '../../core/models/fiscal-document.model';

@Component({
  selector: 'dl-upload',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, MatSnackBarModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent implements OnInit {
  private readonly fiscalService = inject(FiscalService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isDragOver = signal(false);
  readonly enviando = signal(false);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal<string | null>(null);

  get historico(): FiscalDocument[] {
    return this.fiscalService.documentos();
  }

  ngOnInit(): void {
    this.carregarHistorico();
  }

  private carregarHistorico(): void {
    this.carregando.set(true);
    this.fiscalService.buscarDocumentos().subscribe({
      next: () => this.carregando.set(false),
      error: (erro: Error) => {
        this.erroCarregamento.set(erro.message);
        this.carregando.set(false);
      },
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.enviarArquivos(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.enviarArquivos(Array.from(input.files));
      input.value = '';
    }
  }

  private enviarArquivos(files: File[]): void {
    const arquivosXml = files.filter((f) => f.name.toLowerCase().endsWith('.xml'));

    if (arquivosXml.length === 0) {
      this.erroCarregamento.set('Apenas arquivos XML são aceitos para envio.');
      return;
    }

    this.erroCarregamento.set(null);
    this.enviando.set(true);

    arquivosXml.forEach((file) => {
      this.fiscalService.enviarXml(file).subscribe({
        next: (documentos) => {
          this.enviando.set(false);
          const mensagem =
            documentos.length > 1
              ? `${documentos.length} notas encontradas em "${file.name}" e processadas com sucesso.`
              : 'Upload realizado.';
          this.snackBar.open(mensagem, 'Fechar', { duration: 4000 });
        },
        error: (erro: Error) => {
          this.erroCarregamento.set(erro.message);
          this.enviando.set(false);
          this.snackBar.open(`Erro ao enviar: ${erro.message}`, 'Fechar', { duration: 4000 });
        },
      });
    });
  }

  statusLabel(status: FiscalDocumentStatus): string {
    return { PROCESSANDO: 'Processando', CONCLUIDO: 'Concluído', ERRO: 'Erro' }[status] ?? status;
  }
}
