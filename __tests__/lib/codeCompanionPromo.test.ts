const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

import {
  CODE_COMPANION_PROMO_HIDE_FOREVER_THRESHOLD,
  dismissCodeCompanionPromo,
  getCodeCompanionPromoDismissed,
  getCodeCompanionPromoSeenCount,
  incrementCodeCompanionPromoSeenCount,
  isCodeCompanionEligibleCourse,
} from '@/lib/codeCompanionPromo';
import {
  CODE_COMPANION_PROMO_DISMISSED_KEY,
  CODE_COMPANION_PROMO_SEEN_COUNT_KEY,
} from '@/constants/StorageKeys';

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
        '1',
      );
    });

    it('treats a missing seen counter as zero', async () => {
      mockGetItem.mockResolvedValueOnce(null);

      await expect(getCodeCompanionPromoSeenCount()).resolves.toBe(0);
    });

    it('normalizes invalid seen counter values to zero', async () => {
      mockGetItem.mockResolvedValueOnce('invalid');

      await expect(getCodeCompanionPromoSeenCount()).resolves.toBe(0);
    });

    it('increments the seen counter via a storage update function', async () => {
      mockSetItem.mockImplementationOnce(
        async (
          key: string,
          value: string | ((prevValue: string | null) => string),
        ) => {
          expect(key).toBe(CODE_COMPANION_PROMO_SEEN_COUNT_KEY);
          expect(typeof value).toBe('function');

          if (typeof value !== 'function') {
            throw new Error('Expected updater function');
          }

          expect(value('1')).toBe('2');
        },
      );

      await expect(incrementCodeCompanionPromoSeenCount()).resolves.toBe(2);
      expect(mockSetItem).toHaveBeenCalledWith(
        CODE_COMPANION_PROMO_SEEN_COUNT_KEY,
        expect.any(Function),
      );
    });

    it('exposes the permanent dismiss threshold as a named constant', () => {
      expect(CODE_COMPANION_PROMO_HIDE_FOREVER_THRESHOLD).toBe(2);
    });
  });
});
