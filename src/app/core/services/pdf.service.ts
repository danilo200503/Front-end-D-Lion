import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ErroFiscal, FiscalDocument } from '../models/fiscal-document.model';

const DOURADO: [number, number, number] = [184, 145, 44];
const CINZA: [number, number, number] = [75, 81, 96];

@Injectable({ providedIn: 'root' })
export class PdfService {
  gerarRelatorioAnalise(documento: FiscalDocument): void {
    const doc = new jsPDF();
    const erros = (documento.erros ?? []) as ErroFiscal[];

    this.desenharCabecalho(doc);
    let y = 38;

    doc.setFontSize(14);
    doc.setTextColor(...CINZA);
    doc.text('Relatório de Análise Fiscal', 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const linhasDados: Array<[string, string]> = [
      ['Documento', documento.nomeArquivo],
      ['Empresa', documento.empresa ?? '—'],
      ['CNPJ', documento.cnpj ?? '—'],
      ['Número / Série', `${documento.numeroNota ?? '—'}${documento.serie ? ' / ' + documento.serie : ''}`],
      ['Valor Total', this.formatarValor(documento.valorTotal)],
      ['Score Fiscal', documento.scoreFiscal !== undefined ? String(documento.scoreFiscal) : '—'],
      ['Classificação', documento.classificacao ?? '—'],
      ['Data de Emissão', documento.dataEmissao ? new Date(documento.dataEmissao).toLocaleDateString('pt-BR') : '—'],
    ];

    linhasDados.forEach(([label, valor]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(valor, 60, y);
      y += 6;
    });

    y += 4;
    doc.setFontSize(12);
    doc.setTextColor(...CINZA);
    doc.text('Inconsistências Identificadas', 14, y);
    y += 4;

    if (erros.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Nenhuma inconsistência encontrada neste documento.', 14, y + 6);
    } else {
      autoTable(doc, {
        startY: y + 4,
        head: [['Tipo', 'Descrição', 'Explicação', 'Como corrigir']],
        body: erros.map((e) => [e.tipo, e.descricao, e.explicacao, e.correcao]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: DOURADO, textColor: [255, 255, 255] },
        columnStyles: {
          1: { cellWidth: 45 },
          2: { cellWidth: 60 },
          3: { cellWidth: 55 },
        },
        margin: { left: 14, right: 14 },
      });
    }

    this.desenharRodape(doc);
    doc.save(`analise-fiscal-${documento.numeroNota ?? documento.nomeArquivo}.pdf`);
  }

  private desenharCabecalho(doc: jsPDF): void {
    doc.setFillColor(...DOURADO);
    doc.rect(0, 0, 210, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('D-LION', 14, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema Contábil/Fiscal com Inteligência Artificial', 45, 14);
  }

  private desenharRodape(doc: jsPDF): void {
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      const altura = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Gerado por D-LION em ${new Date().toLocaleString('pt-BR')} — Página ${i} de ${totalPaginas}`,
        14,
        altura - 10
      );
    }
  }

  private formatarValor(valor?: number): string {
    if (valor === undefined) return '—';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
