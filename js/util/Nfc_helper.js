function convertBytesToDouble(balanceBytes, lastTransactionBytes) {
  function convertFourHexBytesToInt(b1, b2, b3, b4) {
    let hexString =
      b1.toString(16).padStart(2, '0') +
      b2.toString(16).padStart(2, '0') +
      b3.toString(16).padStart(2, '0') +
      b4.toString(16).padStart(2, '0');

    return parseInt(hexString, 16);
  }
  // convert relevant bytes to int in proper order (reverse)
  let balance = convertFourHexBytesToInt(
    balanceBytes[4],
    balanceBytes[3],
    balanceBytes[2],
    balanceBytes[1]
  );
  balance /= 10; // for some reason the tag contains the amount in euro cent * 10

  // File settings consist of 18 bytes. Bytes 13 - 17 correspond to a "limited credit value"
  // which seems to contain the amount for the last transaction
  // convert relevant bytes to int in proper order (reverse)
  let lastTransaction = convertFourHexBytesToInt(
    lastTransactionBytes[16],
    lastTransactionBytes[15],
    lastTransactionBytes[14],
    lastTransactionBytes[13]
  );
  lastTransaction /= 10; // for some reason the tag contains the amount in euro cent * 10

  balance = balance / 100.0;
  lastTransaction = -lastTransaction / 100.0;

  return { balance, lastTransaction };
}

export default convertBytesToDouble;
