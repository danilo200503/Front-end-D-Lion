export interface CompanyProfile {
  id: string;
  name: string;
  cnpj: string;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  company: CompanyProfile;
  cargo?: string;
  telefone?: string;
  avatar?: string;
  ativo: boolean;
  ultimoLogin?: string;
  permissoes: string[];
  createdAt: string;
}

export interface UpdateProfilePayload {
  nome?: string;
  cargo?: string;
  telefone?: string;
}

export interface ChangePasswordPayload {
  senhaAtual: string;
  novaSenha: string;
}
