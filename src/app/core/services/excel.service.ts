import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ErroFiscal, FiscalDocument } from '../models/fiscal-document.model';

@Injectable({ providedIn: 'root' })
export class ExcelService {
    gerarPlanilhaDocumentosFiscais(documentos: FiscalDocument[], nomeArquivo = 'documentos-fiscais.xlsx'): void {
    const linhas = documentos.map((doc) => {
      const erros = (doc.erros ?? []) as ErroFiscal[];

      return {
        Documento: doc.nomeArquivo,
        Empresa: doc.empresa ?? '',
        CNPJ: doc.cnpj ?? '',
        Valor: doc.valorTotal ?? 0,
        Impostos: (doc.impostos ?? []).map((i) => `${i.tipo}: ${i.valor}`).join('; '),
        'Score Fiscal': doc.scoreFiscal ?? '',
        Classificação: doc.classificacao ?? '',
        'Erros encontrados': erros.length > 0 ? erros.map((e) => e.descricao).join('; ') : (doc.erros as unknown as string[] | undefined)?.join?.('; ') ?? '',
        'Sugestões de correção': erros.map((e) => e.correcao).join('; '),
        Observações: (doc.alertas ?? []).join('; '),
      };
    });

    const planilha = XLSX.utils.json_to_sheet(linhas);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, 'Documentos Fiscais');

    XLSX.writeFile(livro, nomeArquivo);
  }
}
