export type OrderStatus = 'orcamento' | 'confirmado' | 'em_preparacao' | 'concluido';

export interface Order {
  id: string;
  clientName: string;
  clientPhone?: string;
  partyDate: string; // YYYY-MM-DD
  partyTime?: string; // HH:mm, e.g. "14:00"
  theme: string;
  location: string;
  value: number; // Valor Total
  materialCost: number; // Custo estimado com materiais
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'baloes'
  | 'estruturas_paineis'
  | 'flores_folhagens'
  | 'mobiliario'
  | 'deslocamento_frete'
  | 'outros';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  orderId?: string;
}

export type CatalogCategory =
  | 'todos'
  | 'infantil'
  | 'pegue_e_monte'
  | 'arcos_baloes'
  | 'mesas_tematicas'
  | 'batizado_cha';

export interface CatalogItem {
  id: string;
  title: string;
  category: CatalogCategory;
  imageUrl: string;
  estimatedPrice: number;
  description: string;
  highlights: string[];
  isCustomUpload?: boolean;
}

export type PeriodFilter = 'semanal' | 'mensal' | 'trimestral' | 'semestral';

export type TabType = 'home' | 'financas' | 'pedidos' | 'catalogo' | 'figurinhas' | 'configuracoes';

export interface AppSettings {
  companyName: string;
  instagramHandle: string;
  monthlyTarget: number;
  notificationDaysBefore: number;
  notificationTitle: string;
  notificationsEnabled: boolean;
  notificationSoundPreset: 'chime' | 'fanfare' | 'ding' | 'custom';
  customNotificationSoundUrl?: string;
  hasSeenOnboarding: boolean;
}

export interface ParsedWhatsAppOrder {
  clientName: string;
  partyDate: string;
  partyTime: string;
  theme: string;
  location: string;
  value: number;
  clientPhone: string;
  notes: string;
  confidence: number;
}
