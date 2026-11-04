import { Order, Expense, CatalogItem, AppSettings } from '../types/index.ts';

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'Ateliê Festa com alegria',
  instagramHandle: '@festa_com_alegria',
  monthlyTarget: 15000,
  notificationDaysBefore: 2,
  notificationTitle: 'Lembrete de Decoração',
  notificationsEnabled: true,
  notificationSoundPreset: 'chime',
  hasSeenOnboarding: false,
};

// Initial realistic party orders matching @festa_com_alegria (used for sample restore)
export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-01',
    clientName: 'Larissa Moura (Mãe da Maria Aylla)',
    clientPhone: '(11) 98452-3310',
    partyDate: '2026-11-14',
    partyTime: '15:00',
    theme: 'Decoração 1 Aninho: Jardim das Borboletas',
    location: 'Buffet Splash Kids - Salão Principal',
    value: 2350,
    materialCost: 580,
    status: 'confirmado',
    notes: 'Painel curvo lavanda e rosa, borboleta 3D, número 1 gigante e cilindros canelados.',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'ord-02',
    clientName: 'Carla Dias (Mãe do Theo)',
    clientPhone: '(11) 97120-4499',
    partyDate: '2026-11-21',
    partyTime: '14:00',
    theme: 'Bluey Aventura 2 Anos',
    location: 'Espaço Festa & Alegria - Granja Viana',
    value: 2600,
    materialCost: 680,
    status: 'em_preparacao',
    notes: 'Personagem Bluey, número 2 iluminado, balões candy blue e peach.',
    createdAt: '2026-11-02T14:30:00Z',
  },
  {
    id: 'ord-03',
    clientName: 'Renata & Marcelo',
    clientPhone: '(11) 99341-8822',
    partyDate: '2026-11-28',
    partyTime: '11:00',
    theme: 'Kit Pegue e Monte - Cilindros Dourados',
    location: 'Retirada no Ateliê (Cliente monta)',
    value: 950,
    materialCost: 180,
    status: 'confirmado',
    notes: 'Trio cilindros dourados, 2 arcos de ferro e capas personalizadas.',
    createdAt: '2026-11-03T09:15:00Z',
  },
  {
    id: 'ord-04',
    clientName: 'Dra. Maya Alcantara',
    clientPhone: '(11) 98877-1234',
    partyDate: '2026-12-05',
    partyTime: '19:30',
    theme: 'Celebração 30 Anos Chic & Rosé Gold',
    location: 'Restaurante & Lounge Varanda',
    value: 3200,
    materialCost: 850,
    status: 'orcamento',
    notes: 'Painel duplo curvo, arranjos de flores nobres e mesa de doces finos.',
    createdAt: '2026-11-03T16:00:00Z',
  },
  {
    id: 'ord-05',
    clientName: 'Patrícia Nogueira',
    clientPhone: '(11) 96543-2109',
    partyDate: '2026-10-31',
    partyTime: '16:00',
    theme: 'Mundo Safari dos Pequenos',
    location: 'Buffet Villa Encantada',
    value: 2800,
    materialCost: 720,
    status: 'concluido',
    notes: 'Entregue com sucesso! Cliente elogiou muito o arco de balões.',
    createdAt: '2026-10-15T11:00:00Z',
  },
];

// Initial realistic expenses with materials
export const SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp-01',
    description: 'Kit Balões Sempertex & Cromados (Rosa, Pêssego e Ouro)',
    amount: 380,
    category: 'baloes',
    date: '2026-11-02',
    orderId: 'ord-01',
  },
  {
    id: 'exp-02',
    description: 'Locação Trio Cilindros Canelados & Arco Romano',
    amount: 220,
    category: 'estruturas_paineis',
    date: '2026-11-03',
    orderId: 'ord-01',
  },
  {
    id: 'exp-03',
    description: 'Arranjos Florais Permanentes & Folhagens Eucalipto',
    amount: 190,
    category: 'flores_folhagens',
    date: '2026-11-03',
    orderId: 'ord-02',
  },
  {
    id: 'exp-04',
    description: 'Balões Tons Candy Blue e Laranja Suave (Bluey)',
    amount: 350,
    category: 'baloes',
    date: '2026-11-03',
    orderId: 'ord-02',
  },
  {
    id: 'exp-05',
    description: 'Frete e Transporte Utilitário Van (Entregas Fim de Semana)',
    amount: 280,
    category: 'deslocamento_frete',
    date: '2026-11-04',
  },
  {
    id: 'exp-06',
    description: 'Locação Letreiro LED Número 2 Iluminado',
    amount: 160,
    category: 'mobiliario',
    date: '2026-11-04',
    orderId: 'ord-02',
  },
];

// Sample catalog items
export const SAMPLE_CATALOG: CatalogItem[] = [
  {
    id: 'cat-01',
    title: 'Decoração 1 Aninho: Jardim das Borboletas',
    category: 'infantil',
    imageUrl: '/src/assets/images/decor_enchanted_garden_1793795029379.jpg',
    estimatedPrice: 2400,
    description: 'Como visto em nosso Instagram: portal de flores em cascata, drapeado fluido em tons lavanda e rosa, pedestais canelados, borboleta 3D e número 1.',
    highlights: ['Borboleta 3D Dourada', 'Número 1 Iluminado', 'Arco Orgânico Desconstruído'],
  },
  {
    id: 'cat-02',
    title: 'Aventura Bluey 2 Aninhos',
    category: 'infantil',
    imageUrl: '/src/assets/images/decor_balloon_arch_1793795028335.jpg',
    estimatedPrice: 2600,
    description: 'Cenário encantador com pelúcia Bluey gigante, número 2 com luz de LED, cilindros temáticos com doces personalizados e arco de balões candy.',
    highlights: ['Totem Bluey Oficial', 'Número 2 Neon/LED', 'Cilindros Personalizados'],
  },
  {
    id: 'cat-03',
    title: 'Kit Pegue e Monte: Cilindros Dourados',
    category: 'pegue_e_monte',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    estimatedPrice: 950,
    description: 'Pacote prático Pegue & Monte! Você retira em nosso ateliê o trio de cilindros dourados com arcos de ferro e monta com facilidade.',
    highlights: ['Econômico', 'Fácil de Transportar', 'Trio de Cilindros Rústicos'],
  },
  {
    id: 'cat-04',
    title: 'Mundo Safari dos Pequenos',
    category: 'infantil',
    imageUrl: '/src/assets/images/decor_kids_safari_1793795029122.jpg',
    estimatedPrice: 2800,
    description: 'Decoração rústica completa com painel ripado de madeira, número 3 luminoso gigante, pelúcias realistas de animais da savana e folhagens tropicais.',
    highlights: ['Letreiro Iluminado', 'Pelúcias Gigantes', 'Pratos Temáticos Inclusos'],
  },
  {
    id: 'cat-05',
    title: 'Mesa Doce Luxo & Flores Finas',
    category: 'mesas_tematicas',
    imageUrl: '/src/assets/images/decor_luxury_cake_table_1793795029704.jpg',
    estimatedPrice: 3200,
    description: 'Composição com painel curvo duplo, arranjos de rosas naturais com capim dos pampas, bandejas douradas e velas aromáticas.',
    highlights: ['Arranjos Florais Nobres', 'Bandejas Douradas', 'Iluminação Cênica'],
  },
  {
    id: 'cat-06',
    title: 'Chá Revelação Baby Ursinho',
    category: 'batizado_cha',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
    estimatedPrice: 1950,
    description: 'Sensação acolhedora com tons pastéis suaves, mini-arcos orgânicos, urso de pelúcia gigante e suportes delicados para docinhos.',
    highlights: ['Balões Candy Colors', 'Cenário Foto Perfeita', 'Montagem Completa'],
  },
];

const STORAGE_KEYS = {
  ORDERS: 'festa_alegria_orders_v3',
  EXPENSES: 'festa_alegria_expenses_v3',
  CATALOG: 'festa_alegria_catalog_v3',
  SETTINGS: 'festa_alegria_settings_v3',
  INITIALIZED: 'festa_alegria_db_initialized_v3',
};

// Check if app has been initialized before
export function isAppInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
}

export function markAppInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      if (!isAppInitialized()) {
        // First ever launch: seed sample data so the app has context, but user can clear with 1 click
        saveOrders(SAMPLE_ORDERS);
        markAppInitialized();
        return SAMPLE_ORDERS;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders to localStorage', err);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      if (!isAppInitialized()) {
        saveExpenses(SAMPLE_EXPENSES);
        return SAMPLE_EXPENSES;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('Error saving expenses to localStorage', err);
  }
}

export function loadCatalog(): CatalogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (!raw) {
      if (!isAppInitialized()) {
        saveCatalog(SAMPLE_CATALOG);
        return SAMPLE_CATALOG;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCatalog(items: CatalogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving catalog to localStorage', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage', err);
  }
}

// Reset everything to ZERO (empty database)
export function resetDatabaseToZero(): {
  orders: Order[];
  expenses: Expense[];
  catalog: CatalogItem[];
} {
  saveOrders([]);
  saveExpenses([]);
  saveCatalog([]);
  markAppInitialized();
  return { orders: [], expenses: [], catalog: [] };
}

// Restore sample data
export function restoreSampleData(): {
  orders: Order[];
  expenses: Expense[];
  catalog: CatalogItem[];
} {
  saveOrders(SAMPLE_ORDERS);
  saveExpenses(SAMPLE_EXPENSES);
  saveCatalog(SAMPLE_CATALOG);
  markAppInitialized();
  return { orders: SAMPLE_ORDERS, expenses: SAMPLE_EXPENSES, catalog: SAMPLE_CATALOG };
}
