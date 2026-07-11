import { Cliente } from './cliente.model';

export type StatusCobranca = 'PENDENTE' | 'ENVIADA' | 'PAGA' | 'ATRASADA';

export interface Cobranca {
  id: string;
  clienteId: string;
  descricao: string;
  valor?: number;
  vencimento: string;
  status: StatusCobranca;
  dataEnvio?: string;
  criadoEm: string;
  cliente?: Cliente;
}

export interface CobrancaPayload {
  clienteId: string;
  descricao: string;
  valor?: number;
  vencimento: string;
  status?: StatusCobranca;
}

export interface ResumoCobrancas {
  total: number;
  pendentes: number;
  pagas: number;
  atrasadas: number;
}

export type TipoEnvioCobranca = 'EMAIL' | 'WHATSAPP';

export interface BillingHistoryItem {
  id: string;
  cobrancaId: string;
  tipoEnvio: TipoEnvioCobranca;
  dataEnvio: string;
  cobranca: Cobranca;
}

export interface LinkWhatsappResultado {
  link: string;
  mensagem: string;
}
