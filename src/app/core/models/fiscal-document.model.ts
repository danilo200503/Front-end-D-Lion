export type FiscalDocumentStatus = 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';

export type TipoDocumentoFiscal = 'NFE' | 'NFCE' | 'CTE' | 'MDFE' | 'NFSE';

export interface ImpostoFiscal {
  tipo: string;
  valor: number;
}

export interface ItemFiscal {
  cProd?: string;
  xProd?: string;
  ncm?: string;
  cfop?: string;
  cstIcms?: string;
  cstPis?: string;
  cstCofins?: string;
  vProd?: number;
  vICMS?: number;
  vIPI?: number;
  vPIS?: number;
  vCOFINS?: number;
}

export interface FiscalDocument {
  id: string;
  nomeArquivo: string;
  status: FiscalDocumentStatus;
  tipoDocumento?: TipoDocumentoFiscal;
  empresa?: string;
  cnpj?: string;
  numeroNota?: string;
  serie?: string;
  chaveAcesso?: string;
  dataEmissao?: string;
  destinatario?: string;
  destinatarioCnpj?: string;
  destinatarioUf?: string;
  municipio?: string;
  uf?: string;
  indicadorIE?: string;
  valorTotal?: number;
  impostos?: ImpostoFiscal[];
  itens?: ItemFiscal[];
  erros?: unknown[];
  alertas?: string[];
  recomendacoes?: string[];
  mensagemErro?: string;
  scoreFiscal?: number;
  classificacao?: ClassificacaoFiscal;
  createdAt: string;
}

export type ClassificacaoFiscal = 'Excelente' | 'Boa' | 'Regular' | 'Ruim';

export type SeveridadeErro = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface ErroFiscal {
  tipo: string;
  descricao: string;
  explicacao: string;
  correcao: string;
  severidade: SeveridadeErro;
  pontosPerdidos: number;
}

export interface ResultadoAnaliseFiscal {
  documentoId: string;
  score: number;
  classificacao: ClassificacaoFiscal;
  totalErros: number;
  erros: ErroFiscal[];
}

export interface FiscalAnalysisHistorico {
  id: string;
  documentId: string;
  scoreFiscal: number;
  classificacao: ClassificacaoFiscal;
  erros: ErroFiscal[];
  totalErros: number;
  createdAt: string;
  document: FiscalDocument;
}
