export type TipoLancamento = 'NOTA' | 'CUPOM' | 'DANFE' | 'OUTRO';
export type NaturezaOperacao = 'ENTRADA' | 'SAIDA';

export interface LancamentoFiscal {
  id: string;
  tipo: TipoLancamento;
  naturezaOperacao: NaturezaOperacao;
  dataCompetencia: string;
  descricao: string;
  valor: number;
  observacoes?: string;
  documentoFiscalId?: string;
  documentoFiscal?: { id: string; nomeArquivo: string; tipoDocumento?: string } | null;
  explicacaoIA?: string;
  createdAt: string;
}

export interface LancamentoFiscalPayload {
  tipo: TipoLancamento;
  naturezaOperacao: NaturezaOperacao;
  dataCompetencia: string;
  descricao: string;
  valor: number;
  observacoes?: string;
  documentoFiscalId?: string;
}
