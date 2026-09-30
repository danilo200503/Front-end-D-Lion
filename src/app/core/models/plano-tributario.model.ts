export interface PlanoTributario {
  id: string;
  clienteId: string;
  cliente?: { id: string; nome: string; empresa?: string } | null;
  conteudo: string;
  resumoDados?: {
    quantidadeApuracoes: number;
    regimesUsados: string[];
    valorMedioApurado: number;
    receitaMediaPeriodo?: number;
    quantidadeLancamentos: number;
    totalEntradas: number;
    totalSaidas: number;
    scoreMedioDocumentosFiscais?: number;
    ultimasApuracoes: { competencia: string; regime: string; valorApurado: number }[];
  };
  createdAt: string;
}
