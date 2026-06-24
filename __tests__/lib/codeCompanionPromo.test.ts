const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

import {
  dismissCodeCompanionPromo,
  getCodeCompanionPromoDismissed,
  isCodeCompanionEligibleCourse,
} from '@/lib/codeCompanionPromo';
import { CODE_COMPANION_PROMO_DISMISSED_KEY } from '@/constants/StorageKeys';

describe('codeCompanionPromo', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
  });

  describe('isCodeCompanionEligibleCourse', () => {
    it('accepts supported course prefixes', () => {
      expect(isCodeCompanionEligibleCourse('TIF24A')).toBe(true);
      expect(isCodeCompanionEligibleCourse('wds23b')).toBe(true);
      expect(isCodeCompanionEligibleCourse('WWI26C')).toBe(true);
    });

    it('accepts known aliases after canonicalization', () => {
      expect(isCodeCompanionEligibleCourse('wwi25a')).toBe(true);
    });

    it('rejects unrelated courses', () => {
      expect(isCodeCompanionEligibleCourse('BWL24A')).toBe(false);
      expect(isCodeCompanionEligibleCourse('MKB22A')).toBe(false);
    });

    it('rejects empty input', () => {
      expect(isCodeCompanionEligibleCourse('')).toBe(false);
      expect(isCodeCompanionEligibleCourse('   ')).toBe(false);
      expect(isCodeCompanionEligibleCourse(null)).toBe(false);
      expect(isCodeCompanionEligibleCourse(undefined)).toBe(false);
    });
  });

  describe('storage helpers', () => {
    it('treats a missing dismissed flag as not dismissed', async () => {
      mockGetItem.mockResolvedValueOnce(null);

      await expect(getCodeCompanionPromoDismissed()).resolves.toBe(false);
    });

    it('stores the permanent dismiss flag', async () => {
      await dismissCodeCompanionPromo();

      expect(mockSetItem).toHaveBeenCalledWith(
        CODE_COMPANION_PROMO_DISMISSED_KEY,
        '1'
      );
    });

  });
});
