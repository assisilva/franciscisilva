
export interface Client {
  id: string;
  name: string;
  phone: string;
  plan: 'Mensal' | 'Trimestral' | 'Anual';
  expirationDate: string;
  status: 'Ativo' | 'Vencendo' | 'Inativo';
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  type: 'renewal' | 'promotion' | 'support';
}

export type View = 'dashboard' | 'clients' | 'messages' | 'settings';
