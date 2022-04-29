package de.dhbwloe.loerrach.campusapp;

import android.content.Intent;
import android.nfc.NfcAdapter;
import android.os.Bundle;
import android.widget.TextView;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.google.android.material.snackbar.Snackbar;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;

import de.dhbwloe.loerrach.campusapp.nfcreader.NfcBadgeInterface;
import de.dhbwloe.loerrach.campusapp.nfcreader.NfcBadgeListener;

public class MainActivity extends ReactActivity {

    private NfcBadgeListener nfcBadgeListener;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      DecimalFormatSymbols dfs = DecimalFormatSymbols.getInstance();
      dfs.setDecimalSeparator(',');
      final DecimalFormat euroFormat = new DecimalFormat("0.00€", dfs);
      nfcBadgeListener = new NfcBadgeListener(this);
      nfcBadgeListener.registerNfcBadgeInterface(new NfcBadgeInterface() {
            @Override
            public void onNfcReaderStateChanged(boolean state) {}

            @Override
            public void onNfcReaderReceived(int balance, int lastTransaction) {
                double badgeBalance = balance / 100.0;
                double lastTransactionValue = -lastTransaction / 100.0;
                String msg = "Guthaben: " + euroFormat.format(badgeBalance) + "\n"
                        + "Letzte Transaktion: " + euroFormat.format(lastTransactionValue);
                Snackbar snackbar =
                        Snackbar.make(findViewById(android.R.id.content).getRootView(), msg, Snackbar.LENGTH_LONG);
                TextView snackbarTextView =
                        snackbar.getView().findViewById(com.google.android.material.R.id.snackbar_text);
                snackbarTextView.setTextSize(24);
                snackbar.show();
            }
        });
      nfcBadgeListener.startNfcListener();
    }

    /* nfc listener related callbacks */
    @Override
    public void onResume() {
        super.onResume();
        nfcBadgeListener.resumeForefrontDispatcher();
    }

    @Override
    public void onPause() {
        super.onPause();
        nfcBadgeListener.pauseForefrontDispatcher();
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (NfcAdapter.ACTION_TECH_DISCOVERED.equals(intent.getAction())) {
            nfcBadgeListener.handleNfcEvent(intent);
        }
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "CampusApp";
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
     * you can specify the rendered you wish to use (Fabric or the older renderer).
    */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new MainActivityDelegate(this, getMainComponentName());
    }

    public static class MainActivityDelegate extends ReactActivityDelegate {
        public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
            super(activity, mainComponentName);
        }

        @Override
        protected ReactRootView createRootView() {
            ReactRootView reactRootView = new ReactRootView(getContext());
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
            return reactRootView;
        }
    }
}
