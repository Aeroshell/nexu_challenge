import { isNumber, isIntegerPositive } from './numeric';

describe('Utils', () => {
  describe('isNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isNumber('123')).toBeTruthy();
      expect(isNumber('12.34')).toBeTruthy();
    });

    it('should return false for invalid numbers', () => {
      expect(isNumber('abc')).toBeFalsy();
      expect(isNumber('12..34')).toBeFalsy();
    });
  });

  describe('isIntegerPositive', () => {
    it('should return true for positive integers', () => {
      expect(isIntegerPositive('123')).toBeTruthy();
      expect(isIntegerPositive('0')).toBeTruthy();
    });

    it('should return false for negative integers', () => {
      expect(isIntegerPositive('-123')).toBeFalsy();
    });

    it('should return false for non-integer values', () => {
      expect(isIntegerPositive('12.34')).toBeFalsy();
      expect(isIntegerPositive('abc')).toBeFalsy();
    });
  });
});