import test from 'node:test';
import assert from 'node:assert/strict';
import { parseWhatsAppMessage } from './orderParser.ts';

test('parseWhatsAppMessage extracts client name, date, time, theme and value from standard message', () => {
  const msg = `Oi boa tarde! Gostaria de fechar a decoração pro aniversário da Sophia no dia 18/11/2026 às 15:00 horas. O tema vai ser Jardim Encantado no buffet Splash Kids. Ficou R$ 1.850 com o arco de balões desconstruído né?`;
  const result = parseWhatsAppMessage(msg);

  assert.equal(result.clientName, 'Sophia (Mãe/Pai)');
  assert.equal(result.partyDate, '2026-11-18');
  assert.equal(result.partyTime, '15:00');
  assert.equal(result.theme, 'Jardim Encantado');
  assert.equal(result.value, 1850);
  assert.ok(result.location.toLowerCase().includes('splash kids'));
  assert.ok(result.notes.includes('arco de balões'));
  assert.ok(result.confidence >= 0.75);
});

test('parseWhatsAppMessage extracts details with explicit intro and currency format', () => {
  const msg = `Olá! Meu nome é Mariana Costa. Quero orçamento para o tema Safari no dia 25/11/2026 às 14h. Vai ser no salão do condomínio. Vi que o pacote de vocês sai por R$ 2.450,00. Meu whats é (11) 98765-4321.`;
  const result = parseWhatsAppMessage(msg);

  assert.equal(result.clientName, 'Mariana Costa');
  assert.equal(result.partyDate, '2026-11-25');
  assert.equal(result.partyTime, '14:00');
  assert.equal(result.theme, 'Safari');
  assert.equal(result.value, 2450);
  assert.ok(result.clientPhone.includes('98765-4321'));
  assert.ok(result.confidence >= 0.75);
});

test('parseWhatsAppMessage handles WhatsApp exported chat headers', () => {
  const msg = `[15:40, 08/11/2026] Juliana Ramos: Olá! Confirmando a decoração de Chá Revelação dia 12/12/2026 às 16:30 em casa, valor R$ 1.600 com painel`;
  const result = parseWhatsAppMessage(msg);

  assert.equal(result.clientName, 'Juliana Ramos');
  assert.equal(result.partyDate, '2026-12-12');
  assert.equal(result.partyTime, '16:30');
  assert.equal(result.value, 1600);
  assert.equal(result.location, 'Em Casa');
  assert.ok(result.notes.includes('painel'));
});

test('parseWhatsAppMessage handles partial message gracefully', () => {
  const msg = `Oi, quanto fica a decoração de astronauta?`;
  const result = parseWhatsAppMessage(msg);

  assert.equal(result.theme, 'astronauta');
  assert.equal(result.value, 0);
  assert.ok(result.confidence < 0.5);
});
