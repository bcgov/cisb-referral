import { diffObjects, serializeValue } from './audit.utils';

describe('audit.utils', () => {
  describe('serializeValue', () => {
    it('should return null for null', () => {
      expect(serializeValue(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(serializeValue(undefined)).toBeNull();
    });

    it('should serialize strings as-is', () => {
      expect(serializeValue('hello')).toBe('hello');
    });

    it('should serialize numbers to string', () => {
      expect(serializeValue(42)).toBe('42');
    });

    it('should serialize booleans to string', () => {
      expect(serializeValue(true)).toBe('true');
      expect(serializeValue(false)).toBe('false');
    });

    it('should serialize dates to ISO string', () => {
      const date = new Date('2026-01-15T12:00:00.000Z');
      expect(serializeValue(date)).toBe('2026-01-15T12:00:00.000Z');
    });

    it('should serialize arrays to JSON', () => {
      expect(serializeValue(['a', 'b'])).toBe('["a","b"]');
    });
  });

  describe('diffObjects', () => {
    it('should detect changed fields', () => {
      const oldObj = { name: 'Old', email: 'old@test.com' };
      const newObj = { name: 'New' };

      const changes = diffObjects(oldObj, newObj, ['name', 'email']);

      expect(changes).toEqual([
        { field: 'name', oldValue: 'Old', newValue: 'New' },
      ]);
    });

    it('should skip fields not in newObj', () => {
      const oldObj = { name: 'Old', email: 'old@test.com' };
      const newObj = { name: 'Old' };

      const changes = diffObjects(oldObj, newObj, ['name', 'email']);

      expect(changes).toEqual([]);
    });

    it('should return empty array when no fields changed', () => {
      const oldObj = { name: 'Same' };
      const newObj = { name: 'Same' };

      const changes = diffObjects(oldObj, newObj, ['name']);

      expect(changes).toEqual([]);
    });

    it('should detect null to value changes', () => {
      const oldObj = { name: null };
      const newObj = { name: 'New' };

      const changes = diffObjects(oldObj, newObj, ['name']);

      expect(changes).toEqual([
        { field: 'name', oldValue: null, newValue: 'New' },
      ]);
    });

    it('should detect value to null changes', () => {
      const oldObj = { name: 'Old' };
      const newObj = { name: null };

      const changes = diffObjects(oldObj, newObj, ['name']);

      expect(changes).toEqual([
        { field: 'name', oldValue: 'Old', newValue: null },
      ]);
    });

    it('should only track specified fields', () => {
      const oldObj = { name: 'Old', secret: 'a' };
      const newObj = { name: 'New', secret: 'b' };

      const changes = diffObjects(oldObj, newObj, ['name']);

      expect(changes).toEqual([
        { field: 'name', oldValue: 'Old', newValue: 'New' },
      ]);
    });

    it('should serialize boolean changes', () => {
      const oldObj = { isActive: true };
      const newObj = { isActive: false };

      const changes = diffObjects(oldObj, newObj, ['isActive']);

      expect(changes).toEqual([
        { field: 'isActive', oldValue: 'true', newValue: 'false' },
      ]);
    });
  });
});
