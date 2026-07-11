export interface Cliente {
  id: string;
  nome: string;
  empresa?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  criadoEm: string;
}

export interface ClientePayload {
  nome: string;
  empresa?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
}
