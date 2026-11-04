import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialSummary, formatBRL } from './finance.ts';
import { Order, Expense } from '../types/index.ts';

test('calculateFinancialSummary calculates profit and expenses accurately', () => {
  const refDate = new Date('2026-11-04T00:00:00');

  const orders: Order[] = [
    {
      id: '1',
      clientName: 'Sophia (Mãe/Pai)',
      partyDate: '2026-11-08',
      theme: 'Jardim Encantado',
      location: 'Buffet Splash Kids',
      value: 2000,
      materialCost: 500,
      status: 'confirmado',
      createdAt: '2026-11-01',
    },
    {
      id: '2',
      clientName: 'Mariana Costa',
      partyDate: '2026-11-10',
      theme: 'Safari Baby',
      location: 'Salão Privativo',
      value: 1500,
      materialCost: 400,
      status: 'orcamento', // Should not be in revenue
      createdAt: '2026-11-02',
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'e1',
      description: 'Balões Rosa e Dourado',
      amount: 350,
      category: 'baloes',
      date: '2026-11-05',
    },
    {
      id: 'e2',
      description: 'Locação de Painel Redondo',
      amount: 150,
      category: 'estruturas_paineis',
      date: '2026-11-06',
    },
  ];

  const summary = calculateFinancialSummary(orders, expenses, 'mensal', refDate);

  assert.equal(summary.revenue, 2000);
  assert.equal(summary.expenses, 500);
  assert.equal(summary.netProfit, 1500);
  assert.equal(summary.profitMargin, 75);
  assert.equal(summary.categoryExpenses.baloes, 350);
  assert.equal(summary.categoryExpenses.estruturas_paineis, 150);
});

test('formatBRL formats Brazilian Real correctly', () => {
  const formatted = formatBRL(1850.5);
  assert.ok(formatted.includes('1.850,50'));
  assert.ok(formatted.includes('R$'));
});
