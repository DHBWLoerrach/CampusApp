import convertBytesToDouble from '../nfcHelper';

describe('nfcHelper', () => {
  describe('valid input', () => {
    test('correctly decodes balance and last transaction', () => {
      // Example payload captured from a CampusCard with a 50€ balance and last
      // transaction of 10€. The helper should decode the values in little-endian
      // order; the previous implementation reversed the slice twice and inflated
      // the balance to 1_354_956.8€ instead of 50€.
      // Balance bytes: [status, b1, b2, b3, b4] → 0x00C35000 = 12800000 / 1000 = 50€
      const balanceBytes = [0x00, 0x50, 0xc3, 0x00, 0x00];
      // Transaction bytes: 17 bytes, value at index 13-16 → 0x00002710 = 10000 / 1000 = 10€
      const lastTransactionBytes = [
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x10, 0x27, 0x00, 0x00,
      ];

      const { balance, lastTransaction } = convertBytesToDouble(
        balanceBytes,
        lastTransactionBytes
      );

      expect(balance).toBe(50);
      expect(lastTransaction).toBe(-10);
    });

    test('handles zero balance and zero transaction', () => {
      const balanceBytes = [0x00, 0x00, 0x00, 0x00, 0x00];
      const lastTransactionBytes = new Array(17).fill(0x00);

      const { balance, lastTransaction } = convertBytesToDouble(
        balanceBytes,
        lastTransactionBytes
      );

      expect(balance).toBe(0);
      expect(lastTransaction).toBe(-0);
    });

    test('works with exactly minimum required byte lengths', () => {
      // Exactly 5 bytes for balance, 17 for transaction
      const balanceBytes = [0x00, 0xe8, 0x03, 0x00, 0x00]; // 1000 / 1000 = 1€
      const lastTransactionBytes = [
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0xf4,
        0x01,
        0x00,
        0x00, // 500 / 1000 = 0.5€
      ];

      const { balance, lastTransaction } = convertBytesToDouble(
        balanceBytes,
        lastTransactionBytes
      );

      expect(balance).toBe(1);
      expect(lastTransaction).toBe(-0.5);
    });

    test('handles large values without overflow', () => {
      // Max reasonable balance: 0x000F4240 = 1_000_000 / 1000 = 1000€
      const balanceBytes = [0x00, 0x40, 0x42, 0x0f, 0x00];
      const lastTransactionBytes = [
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0xa0,
        0x86,
        0x01,
        0x00, // 100_000 / 1000 = 100€
      ];

      const { balance, lastTransaction } = convertBytesToDouble(
        balanceBytes,
        lastTransactionBytes
      );

      expect(balance).toBe(1000);
      expect(lastTransaction).toBe(-100);
    });
  });

  describe('invalid input', () => {
    test('throws on insufficient balanceBytes length', () => {
      const balanceBytes = [0x00, 0x50, 0xc3, 0x00]; // Only 4 bytes, need 5
      const lastTransactionBytes = new Array(17).fill(0x00);

      expect(() =>
        convertBytesToDouble(balanceBytes, lastTransactionBytes)
      ).toThrow('Invalid byte array length');
    });

    test('throws on insufficient lastTransactionBytes length', () => {
      const balanceBytes = [0x00, 0x50, 0xc3, 0x00, 0x00];
      const lastTransactionBytes = new Array(16).fill(0x00); // Only 16 bytes, need 17

      expect(() =>
        convertBytesToDouble(balanceBytes, lastTransactionBytes)
      ).toThrow('Invalid byte array length');
    });

    test('throws on empty arrays', () => {
      expect(() => convertBytesToDouble([], [])).toThrow(
        'Invalid byte array length'
      );
    });
  });
});
