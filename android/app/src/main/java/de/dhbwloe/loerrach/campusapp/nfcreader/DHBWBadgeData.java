package de.dhbwloe.loerrach.campusapp.nfcreader;

public class DHBWBadgeData {
    private int credit;
    private int lastTransaction;

    public DHBWBadgeData(int credit, int lastTransaction) {
        this.credit = credit;
        this.lastTransaction = lastTransaction;
    }

    public int getCredit() {
        return credit;
    }

    public int getLastTransaction() {
        return lastTransaction;
    }
}
