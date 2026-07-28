export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';

export interface Apuracao {
  id: string;
  competencia: string;
  regimeTributario: RegimeTributario;
  receitaBrutaPeriodo?: number;
  totalDebitos: number;
  totalCreditos: number;
  valorApurado: number;
  detalhamento?: {
    anexo?: string;
    receitaBrutaUltimos12Meses?: number;
    aliquotaEfetivaPercentual?: number;
    faixaUtilizada?: number;
    metodologia?: string;
  };
  explicacaoIA?: string;
  status: string;
  createdAt: string;
}

export interface ApuracaoPayload {
  competencia: string;
  regimeTributario: RegimeTributario;
  anexoSimples?: 'I' | 'III';
  receitaBrutaPeriodo: number;
  receitaBrutaUltimos12Meses?: number;
  totalDebitos?: number;
  totalCreditos?: number;
}
