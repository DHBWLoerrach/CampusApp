import convertBytesToDouble from '../nfcHelper';

describe('nfcHelper', () => {
  test('correctly decodes balance and last transaction', () => {
    // Example payload captured from a CampusCard with a 50€ balance and last
    // transaction of 10€. The helper should decode the values in little-endian
    // order; the previous implementation reversed the slice twice and inflated
    // the balance to 1_354_956.8€ instead of 50€.
    const balanceBytes = [0x00, 0x50, 0xc3, 0x00, 0x00];
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
});
