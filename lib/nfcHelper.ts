function convertFourHexBytesToIntLE(
  b1: number,
  b2: number,
  b3: number,
  b4: number
): number {
  const hex = [b1, b2, b3, b4]
    .map((b) => b.toString(16).padStart(2, '0'))
    .reverse()
    .join('');
  return parseInt(hex, 16);
}

function extractAmount(
  bytes: number[],
  startIndex: number,
  negate = false
): number {
  const val = convertFourHexBytesToIntLE(
    bytes[startIndex + 3],
    bytes[startIndex + 2],
    bytes[startIndex + 1],
    bytes[startIndex]
  );
  return (negate ? -val : val) / 1000; // tag contains the amount in euro cent * 10
}

function convertBytesToDouble(
  balanceBytes: number[],
  lastTransactionBytes: number[]
): { balance: number; lastTransaction: number } {
  if (balanceBytes.length < 5 || lastTransactionBytes.length < 17) {
    throw new Error('Invalid byte array length');
  }

  const balance = extractAmount(balanceBytes, 1); // Bytes 1–4 (current balance)
  const lastTransaction = extractAmount(
    lastTransactionBytes,
    13,
    true // negate the value for last transaction
  ); // Bytes 13–16 ("limited credit value", i.e. last transaction)

  return { balance, lastTransaction };
}

export default convertBytesToDouble;
