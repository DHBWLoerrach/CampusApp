package de.dhbwloe.loerrach.campusapp.nfcreader;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.IsoDep;

import java.util.ArrayList;

public class NfcBadgeListener {
    private Activity mainActivity;
    private boolean isRunning = false, isResumed = false;
    private NfcAdapter oAdapter;
    private boolean bNfcAdapterState;

    private PendingIntent oPendingIntent;
    private IntentFilter[] aFilters;
    private String[][] aTechLists;


    private ArrayList<NfcBadgeInterface> lNfcBadgeInterfaces = new ArrayList<NfcBadgeInterface>();

    private final BroadcastReceiver oReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();

            if(NfcAdapter.ACTION_ADAPTER_STATE_CHANGED.equals(action)) {
                updateNfcState();
            }
        }
    };

    public NfcBadgeListener(Activity mainActivity) {
        this.mainActivity = mainActivity;
    }

    private void updateNfcState() {
        if(oAdapter == null)
            return;
        boolean isEnabled = oAdapter.isEnabled();
        if(bNfcAdapterState != isEnabled) {
            bNfcAdapterState = isEnabled;
            for(NfcBadgeInterface nfcBadgeInterface : lNfcBadgeInterfaces) {
                nfcBadgeInterface.onNfcReaderStateChanged(bNfcAdapterState);
            }
        }
    }

    public void registerNfcBadgeInterface(NfcBadgeInterface nfcBadgeInterface) {
        lNfcBadgeInterfaces.add(nfcBadgeInterface);
    }

    public void startNfcListener() {
        if(isRunning)
            return;

        isRunning = true;

        oAdapter = NfcAdapter.getDefaultAdapter(mainActivity);
 
        oPendingIntent = PendingIntent.getActivity(mainActivity, 0, new Intent(mainActivity, mainActivity.getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | PendingIntent.FLAG_IMMUTABLE), 0);
        IntentFilter techDiscovered = new IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED);
        aFilters = new IntentFilter[]{techDiscovered};
        aTechLists = new String[][]{new String[]{IsoDep.class.getName()}};

        IntentFilter intentFilter = new IntentFilter("android.nfc.action.ADAPTER_STATE_CHANGED");
        mainActivity.getApplicationContext().registerReceiver(oReceiver, intentFilter);

        if(isResumed)
            setupForefrontDispatcher();
    }

    public void setupForefrontDispatcher() {
        if(!isRunning || !isResumed)
            return;

        if(oAdapter != null)
            oAdapter.enableForegroundDispatch(mainActivity, oPendingIntent, aFilters, aTechLists);

        updateNfcState();
    }

    public void resumeForefrontDispatcher() {
        boolean wasResumed = isResumed;
        isResumed = true;
        if(!wasResumed && isRunning)
            setupForefrontDispatcher();

    }

    public void pauseForefrontDispatcher() {
        if(isResumed && isRunning && oAdapter != null) {
            oAdapter.disableForegroundDispatch(mainActivity);
        }
        isResumed = false;
    }

    public void handleNfcEvent(Intent intent) {
        if(!isRunning)
            return;
        if (NfcAdapter.ACTION_TECH_DISCOVERED.equals(intent.getAction()) || NfcAdapter.ACTION_TAG_DISCOVERED.equals(intent.getAction())) {
            Tag tagFromIntent = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            IsoDep tag = IsoDep.get(tagFromIntent);

            try {
                DHBWBadge dhbwBadge = new DHBWBadge(tag);
                DHBWBadgeData badgeData = dhbwBadge.getData();

                for(NfcBadgeInterface nfcBadgeInterface : lNfcBadgeInterfaces) {
                    nfcBadgeInterface.onNfcReaderReceived(badgeData.getCredit(), badgeData.getLastTransaction());
                }
            } catch (Exception e) {
               // Fehler mit der Karte werden ignoriert
            }

            setupForefrontDispatcher();
        }
    }

}
