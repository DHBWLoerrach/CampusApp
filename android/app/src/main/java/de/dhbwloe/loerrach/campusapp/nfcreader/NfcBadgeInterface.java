package de.dhbwloe.loerrach.campusapp.nfcreader;

public interface NfcBadgeInterface {

    void onNfcReaderStateChanged(boolean state);
    void onNfcReaderReceived(int balance, int lastTransaction);

}
