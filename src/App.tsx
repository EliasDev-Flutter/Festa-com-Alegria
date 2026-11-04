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
  DEFAULT_SETTINGS,
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
import { AuthSession, logoutUser } from './utils/auth.ts';
import { supabase, isInviteOrRecoveryRedirect } from './utils/supabase.ts';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [period, setPeriod] = useState<PeriodFilter>('mensal');

  // Supabase Auth Session (Luciara's login, invites & recovery)
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  // True if user accessed via an invite or recovery link and must set their password
  const [isPendingPasswordSetup, setIsPendingPasswordSetup] = useState<boolean>(() => isInviteOrRecoveryRedirect());

  // Core Data State backed directly by local storage
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => loadCatalog());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

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
    if (!settings.hasSeenOnboarding && session?.isAuthenticated) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [settings.hasSeenOnboarding, session?.isAuthenticated]);

  // Actions: Add Order
  const handleAddOrder = (newOrderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...newOrderData,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveOrders(updated);
  };

  // Actions: Update Order Status
  const handleUpdateOrderStatus = (id: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o));
    setOrders(updated);
    saveOrders(updated);
  };

  // Actions: Delete Order
  const handleDeleteOrder = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    saveOrders(updated);
  };

  // Actions: Add Expense
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  // Actions: Delete Expense
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  // Actions: Add Catalog Item
  const handleAddCatalogItem = (newItemData: Omit<CatalogItem, 'id'>) => {
    const newItem: CatalogItem = {
      ...newItemData,
      id: `cat-${Date.now()}`,
    };
    const updated = [newItem, ...catalog];
    setCatalog(updated);
    saveCatalog(updated);
  };

  const handleDeleteCatalogItem = (id: string) => {
    const updated = catalog.filter((c) => c.id !== id);
    setCatalog(updated);
    saveCatalog(updated);
  };

  // Actions: Update Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Actions: Reset Database to Zero
  const handleResetDatabaseToZero = () => {
    const result = resetDatabaseToZero();
    setOrders(result.orders);
    setExpenses(result.expenses);
    setCatalog(result.catalog);
  };

  // Actions: Restore Sample Data
  const handleRestoreSampleData = () => {
    const result = restoreSampleData();
    setOrders(result.orders);
    setExpenses(result.expenses);
    setCatalog(result.catalog);
  };

  // Actions: Finish Onboarding
  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
    const updated = { ...settings, hasSeenOnboarding: true };
    setSettings(updated);
    saveSettings(updated);
  };

  // Actions: Logout
  const handleLogout = async () => {
    await logoutUser();
    setSession(null);
    setCurrentTab('home');
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
              onUpdateSettings={handleUpdateSettings}
              onResetDatabaseToZero={handleResetDatabaseToZero}
              onRestoreSampleData={handleRestoreSampleData}
              onTriggerOnboarding={() => setShowOnboarding(true)}
              onClose={() => setCurrentTab('home')}
              onLogout={handleLogout}
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
