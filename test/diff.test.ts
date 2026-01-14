import { describe, it, expect } from 'vitest';
import { getHumanDiff } from '../src/index';

describe('getHumanDiff', () => {
  it('should return empty array for identical objects', () => {
    const obj = { a: 1, b: 'text' };
    expect(getHumanDiff(obj, obj)).toEqual([]);
    expect(getHumanDiff({}, {})).toEqual([]);
  });

  it('should detect primitive changes', () => {
    const before = { val: 10, text: 'hello', flag: true };
    const after = { val: 20, text: 'world', flag: false };
    const diff = getHumanDiff(before, after);
    
    expect(diff).toContain("'val' changed from '10' to '20'");
    expect(diff).toContain("'text' changed from 'hello' to 'world'");
    expect(diff).toContain("'flag' changed from 'true' to 'false'");
  });

  it('should detect added and removed keys', () => {
    const before = { a: 1 };
    const after = { b: 2 };
    const diff = getHumanDiff(before, after);

    expect(diff).toContain("'a' removed (was '1')");
    expect(diff).toContain("'b' added with value '2'");
  });

  it('should handle nested objects', () => {
    const before = { user: { name: 'Alice', age: 25 } };
    const after = { user: { name: 'Bob', age: 25 } };
    const diff = getHumanDiff(before, after);

    expect(diff).toEqual(["'user.name' changed from 'Alice' to 'Bob'"]);
  });

  it('should handle arrays (primitives)', () => {
    const before = { tags: ['a', 'b'] };
    const after = { tags: ['b', 'c'] };
    const diff = getHumanDiff(before, after);

    expect(diff).toContain("'tags' removed item 'a'");
    expect(diff).toContain("'tags' added item 'c'");
  });

  it('should respect exclude option', () => {
    const before = { id: 1, name: 'Alice', meta: { created: 'yesterday' } };
    const after = { id: 2, name: 'Bob', meta: { created: 'today' } };
    const diff = getHumanDiff(before, after, { exclude: ['id', 'meta.created'] });

    expect(diff).toEqual(["'name' changed from 'Alice' to 'Bob'"]);
  });

  it('should support Korean localization', () => {
    const before = { price: 1000 };
    const after = { price: 2000 };
    const diff = getHumanDiff(before, after, { lang: 'ko' });

    expect(diff).toEqual(["'price' 값이 '1000'에서 '2000'(으)로 변경되었습니다"]);
  });

  it('should use custom formatters', () => {
    const before = { price: 1000 };
    const after = { price: 2000 };
    const diff = getHumanDiff(before, after, {
      formatters: {
        price: (val) => `$${val}`
      }
    });

    expect(diff).toEqual(["'price' changed from '$1000' to '$2000'"]);
  });

  it('should handle Date objects', () => {
    const d1 = new Date('2023-01-01T00:00:00.000Z');
    const d2 = new Date('2023-01-02T00:00:00.000Z');
    const diff = getHumanDiff({ date: d1 }, { date: d2 });

    expect(diff).toEqual([
      `'date' changed from '${d1.toISOString()}' to '${d2.toISOString()}'`
    ]);
  });
  
  it('should handle type mismatches (primitive to object)', () => {
      const before = { data: 'string' };
      const after = { data: { nested: true }};
      // Formatters fallback to JSON.stringify for objects
      const diff = getHumanDiff(before, after);
      expect(diff[0]).toContain("'data' changed from 'string' to '{\"nested\":true}'");
  });
});
