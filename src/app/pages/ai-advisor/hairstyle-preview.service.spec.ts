import { describe, it, expect } from 'vitest';
import { hashStr } from './hairstyle-preview.service';

describe('hairstyle-preview helpers', () => {
  it('hashStr deterministic', () => {
    expect(hashStr('abc')).toBe(hashStr('abc'));
  });
  it('hash varies', () => {
    expect(hashStr('a')).not.toBe(hashStr('b'));
  });
  it('hash returns number', () => {
    expect(typeof hashStr('x')).toBe('number');
  });
});
