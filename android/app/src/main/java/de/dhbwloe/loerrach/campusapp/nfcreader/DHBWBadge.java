package de.dhbwloe.loerrach.campusapp.nfcreader;

import android.nfc.tech.IsoDep;

public class DHBWBadge {

    private IsoDep tag;

    public DHBWBadge(IsoDep tag) {
        this.tag = tag;
    }

    public DHBWBadgeData getData() throws Exception {
        tag.connect();

        // note: documentation for the InterCard (i.e. Mifare Desfire) is hard to find :-(
        // inspect raw NFC data an NFC app, search PlayStore for "nfc info" or "nfc reader"
        // see https://ridrix.wordpress.com/2009/09/20/tkort-public-transportation-card-explorations/
        // see https://ridrix.wordpress.com/2009/09/19/mifare-desfire-communication-example/
        // these NFC tags are based on ISO 14443-4

        // A tag contains applications which consist of files. Value files have settings and a value.
        // The following code access a specific app and gets contents and settings from a value file.

        // command byte arrays are sent to tag, first element is command, following are 'parameters'
        // send command 0x5a to select application with ID 0x15845F
        tag.transceive(new byte[] {(byte)0x5a, (byte)0x5f, (byte)0x84, (byte)0x15});
        // now we can access data and files on the level of the selected application

        // command to get value of value file: 0x6c, file 1 is requested (which is a value file)
        // the contents of this value file contains the current balance in 4 bytes
        byte[] balanceBytes = tag.transceive(new byte[] {(byte)0x6c, (byte)0x1});
        // convert relevant bytes to int in proper order (reverse)
        int balance =
                convertFourHexBytesToInt(balanceBytes[4], balanceBytes[3], balanceBytes[2], balanceBytes[1]);
        balance /= 10; // for some reason the tag contains the amount in euro cent * 10

        // command to get file settings: 0xf5, file 1 is requested (which is a value file)
        byte[] lastTransactionBytes = tag.transceive(new byte[] {(byte)0xf5, (byte)0x1});
        // File settings consist of 18 bytes. Bytes 13 - 17 correspond to a "limited credit value"
        // which seems to contain the amount for the last transaction
        // convert relevant bytes to int in proper order (reverse)
        int lastTransaction = convertFourHexBytesToInt(lastTransactionBytes[16], lastTransactionBytes[15],
                lastTransactionBytes[14], lastTransactionBytes[13]);
        lastTransaction /= 10; // for some reason the tag contains the amount in euro cent * 10

        tag.close();

        return new DHBWBadgeData(balance, lastTransaction);
    }

    private int convertFourHexBytesToInt(byte b1, byte b2, byte b3, byte b4) {
        // Format string used:
        // Flag 0 - zero-padded result, Width 2 (0 --> 00), Conversion 'X' - result is hex int uppercase
        String hexString = String.format("%02X%02X%02X%02X", b1, b2, b3, b4);
        return Integer.parseInt(hexString, 16);
    }
}
