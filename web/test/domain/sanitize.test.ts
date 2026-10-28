import { describe, it, expect } from 'vitest';
import {
  sanitizeYearFoundation,
  sanitizeCity,
  sanitizeLanguage,
  normalizeCensusTaker,
} from '../../src/domain/sanitize';

describe('sanitizeYearFoundation', () => {
  it('returns null for 0', () => expect(sanitizeYearFoundation(0)).toBeNull());
  it('returns null for 20', () => expect(sanitizeYearFoundation(20)).toBeNull());
  it('returns value otherwise', () => expect(sanitizeYearFoundation(1990)).toBe(1990));
  it('returns null for null/undefined', () => {
    expect(sanitizeYearFoundation(null)).toBeNull();
    expect(sanitizeYearFoundation(undefined)).toBeNull();
  });
});

describe('sanitizeCity', () => {
  it('returns null for Brazil', () => expect(sanitizeCity('Brazil')).toBeNull());
  it('returns null for brazil (case-insensitive)', () => expect(sanitizeCity('brazil')).toBeNull());
  it('trims and keeps valid city', () => expect(sanitizeCity('  Salvador  ')).toBe('Salvador'));
  it('returns null for empty', () => expect(sanitizeCity('')).toBeNull());
});

describe('sanitizeLanguage', () => {
  it('returns null for outros', () => expect(sanitizeLanguage('outros')).toBeNull());
  it('keeps valid language', () => expect(sanitizeLanguage('yoruba')).toBe('yoruba'));
});

describe('normalizeCensusTaker', () => {
  it('returns null for null/undefined', () => {
    expect(normalizeCensusTaker(null)).toBeNull();
    expect(normalizeCensusTaker(undefined)).toBeNull();
  });
  it('returns string as-is', () => expect(normalizeCensusTaker('Maria')).toBe('Maria'));
  it('extracts fullname from object', () => {
    expect(normalizeCensusTaker({ fullname: 'João' })).toBe('João');
  });
  it('extracts name from object', () => {
    expect(normalizeCensusTaker({ name: 'Ana' })).toBe('Ana');
  });
  it('returns null for empty string', () => expect(normalizeCensusTaker('')).toBeNull());
});