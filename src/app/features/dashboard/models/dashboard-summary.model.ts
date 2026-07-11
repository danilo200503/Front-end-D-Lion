export interface PontoGrafico {
  label: string;
  quantidade: number;
}

export interface DashboardSummary {
  documentosEnviados: number;
  documentosAnalisados: number;
  errosEncontrados: number;
  economiaDeTempoHoras: number;
  empresas: number;
  scoreMedio: number | null;
  ultimaAnalise: string | null;
  errosPorTipo: PontoGrafico[];
  uploadsPorMes: PontoGrafico[];
}
