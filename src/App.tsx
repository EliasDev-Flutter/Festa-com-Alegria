import React, { useState, useEffect } from 'react';
import {
  TabType,
  PeriodFilter,
  Order,
  Expense,
  OrderStatus,
  CatalogItem,
  AppSettings,
} from './types/index.ts';
import {
  loadOrders,
  saveOrders,
  loadExpenses,
  saveExpenses,
  loadCatalog,
  saveCatalog,
  loadSettings,
  saveSettings,
  resetDatabaseToZero,
  restoreSampleData,
} from './utils/storage.ts';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { OnboardingHelper } from './components/OnboardingHelper.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { FinanceView } from './components/FinanceView.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { CatalogView } from './components/CatalogView.tsx';
import { StickerGeneratorView } from './components/StickerGeneratorView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { LoginView } from './components/LoginView.tsx';
import { AuthSession } from './utils/auth.ts';
import { supabase, isInviteOrRecoveryRedirect } from './utils/supabase.ts';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [period, setPeriod] = useState<PeriodFilter>('mensal');

  // Supabase Auth Session
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  // True if user accessed via an invite or recovery link and must set their password
  const [isPendingPasswordSetup, setIsPendingPasswordSetup] = useState<boolean>(() => isInviteOrRecoveryRedirect());

  // App Settings backed by LocalStorage
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Core Data State backed by LocalStorage
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => loadCatalog());

  // Listen and persist Supabase Auth session across launches
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session: supaSession } }) => {
        if (supaSession?.user) {
          setSession({
            isAuthenticated: true,
            userEmail: supaSession.user.email || '',
            userId: supaSession.user.id,
            loggedAt: new Date().toISOString(),
          });
        }
        setAuthChecked(true);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, supaSession) => {
          if (event === 'PASSWORD_RECOVERY') {
            setIsPendingPasswordSetup(true);
          }

          if (supaSession?.user) {
            setSession({
              isAuthenticated: true,
              userEmail: supaSession.user.email || '',
              userId: supaSession.user.id,
              loggedAt: new Date().toISOString(),
            });
          } else {
            setSession(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setAuthChecked(true);
    }
  }, []);

  // Check onboarding on initial launch
  useEffect(() => {
    if (!settings.hasSeenOnboarding) {
      // Trigger onboarding helper after splash finishes
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [settings.hasSeenOnboarding]);

  // Synchronize to localStorage when state updates
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveCatalog(catalog);
  }, [catalog]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Actions: Add Order
  const handleAddOrder = (newOrderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...newOrderData,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Actions: Update Order Status
  const handleUpdateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  // Actions: Delete Order
  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Actions: Add Expense
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  // Actions: Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Actions: Add Catalog Item from iPhone Photo Gallery or Manual Entry
  const handleAddCatalogItem = (newItemData: Omit<CatalogItem, 'id'>) => {
    const newItem: CatalogItem = {
      ...newItemData,
      id: `cat-${Date.now()}`,
    };
    setCatalog((prev) => [newItem, ...prev]);
  };

  const handleDeleteCatalogItem = (id: string) => {
    setCatalog((prev) => prev.filter((c) => c.id !== id));
  };

  // Actions: Reset Database to Zero
  const handleResetDatabaseToZero = () => {
    const empty = resetDatabaseToZero();
    setOrders(empty.orders);
    setExpenses(empty.expenses);
    setCatalog(empty.catalog);
  };

  // Actions: Restore Sample Data
  const handleRestoreSampleData = () => {
    const sample = restoreSampleData();
    setOrders(sample.orders);
    setExpenses(sample.expenses);
    setCatalog(sample.catalog);
  };

  // Actions: Finish Onboarding
  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
    setSettings((prev) => ({ ...prev, hasSeenOnboarding: true }));
  };

  // Count active / upcoming parties
  const activeOrdersCount = orders.filter((o) => o.status !== 'concluido').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'orcamento').length;

  // State for navigating directly to a specific finance detail balloon
  const [financeDetailTarget, setFinanceDetailTarget] = useState<'receita' | 'gastos' | 'lucro' | null>(null);

  return (
    <div className="min-h-screen bg-slate-200/60 flex justify-center items-start text-slate-800 antialiased selection:bg-rose-100">
      {/* Splash Screen on Launch */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Interactive Spotlight Presentation Tour (Only for authenticated user not in setup) */}
      {showOnboarding && session?.isAuthenticated && !isPendingPasswordSetup && (
        <OnboardingHelper
          onComplete={handleFinishOnboarding}
          onNavigateTab={setCurrentTab}
        />
      )}

      {/* Supabase Auth Gate: Requires authorized credentials or password creation on invite/recovery */}
      {!showSplash && authChecked && (!session || !session.isAuthenticated || isPendingPasswordSetup) && (
        <LoginView
          forcePasswordSetup={isPendingPasswordSetup}
          onLoginSuccess={(newSession) => {
            setIsPendingPasswordSetup(false);
            setSession(newSession);
          }}
        />
      )}

      {/* iPhone viewport frame */}
      <div className="w-full max-w-md min-h-screen bg-[#FFFDF8] flex flex-col relative shadow-2xl border-x border-slate-200/80 overflow-x-hidden">
        {/* iOS Top Bar with Clean Spacing & Settings Access */}
        <Header
          activeOrdersCount={activeOrdersCount}
          onNewOrderClick={() => setCurrentTab('pedidos')}
          onOpenSettings={() => setCurrentTab('configuracoes')}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto overflow-x-hidden">
          {currentTab === 'home' && (
            <DashboardView
              orders={orders}
              expenses={expenses}
              period={period}
              settings={settings}
              onPeriodChange={setPeriod}
              onNavigateTab={setCurrentTab}
              onNewOrder={() => setCurrentTab('pedidos')}
              onNewExpense={() => setCurrentTab('financas')}
              onOpenFinanceDetail={(detail) => setFinanceDetailTarget(detail)}
            />
          )}

          {currentTab === 'financas' && (
            <FinanceView
              orders={orders}
              expenses={expenses}
              period={period}
              onPeriodChange={setPeriod}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              initialKpiDetail={financeDetailTarget}
              onClearInitialKpiDetail={() => setFinanceDetailTarget(null)}
            />
          )}

          {currentTab === 'pedidos' && (
            <OrdersView
              orders={orders}
              onAddOrder={handleAddOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {currentTab === 'catalogo' && (
            <CatalogView
              catalog={catalog}
              onAddCatalogItem={handleAddCatalogItem}
              onDeleteCatalogItem={handleDeleteCatalogItem}
            />
          )}

          {currentTab === 'figurinhas' && (
            <StickerGeneratorView />
          )}

          {currentTab === 'configuracoes' && (
            <SettingsView
              settings={settings}
              userEmail={session?.userEmail}
              onUpdateSettings={setSettings}
              onResetDatabaseToZero={handleResetDatabaseToZero}
              onRestoreSampleData={handleRestoreSampleData}
              onTriggerOnboarding={() => setShowOnboarding(true)}
              onClose={() => setCurrentTab('home')}
              onLogout={() => {
                setSession(null);
                setCurrentTab('home');
              }}
            />
          )}
        </main>

        {/* Fixed iOS Bottom Tab Bar (Without underline obstruction) */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          pendingOrdersCount={pendingOrdersCount}
        />
      </div>
    </div>
  );
}
