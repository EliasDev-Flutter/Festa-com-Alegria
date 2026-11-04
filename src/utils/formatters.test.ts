import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrencyInput,
  formatDateInput,
  formatTimeInput,
  formatPhoneInput,
  toIsoDate,
  toBrazilianDate,
} from './formatters.ts';

test('formatCurrencyInput formats digits to currency display and numeric value', () => {
  const result1 = formatCurrencyInput('250000');
  assert.equal(result1.numericValue, 2500);
  assert.match(result1.display, /2\.500,00/);

  const result2 = formatCurrencyInput(1850);
  assert.equal(result2.numericValue, 1850);
  assert.match(result2.display, /1\.850,00/);
});

test('formatDateInput formats digits into DD/MM/AAAA', () => {
  assert.equal(formatDateInput('14112026'), '14/11/2026');
  assert.equal(formatDateInput('1411'), '14/11');
  assert.equal(formatDateInput('14'), '14');
});

test('toIsoDate and toBrazilianDate convert dates accurately', () => {
  assert.equal(toIsoDate('14/11/2026'), '2026-11-14');
  assert.equal(toBrazilianDate('2026-11-14'), '14/11/2026');
});

test('formatTimeInput formats digits into HH:MM and caps out-of-range values', () => {
  assert.equal(formatTimeInput('1500'), '15:00');
  assert.equal(formatTimeInput('15'), '15');
  assert.equal(formatTimeInput('2590'), '23:59');
});

test('formatPhoneInput formats digits into Brazilian phone format', () => {
  assert.equal(formatPhoneInput('11987654321'), '(11) 98765-4321');
  assert.equal(formatPhoneInput('1134567890'), '(11) 3456-7890');
});
