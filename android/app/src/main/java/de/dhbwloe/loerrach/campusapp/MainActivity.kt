package de.dhbwloe.loerrach.campusapp

import android.R
import android.content.Intent
import android.nfc.NfcAdapter
import android.os.Bundle
import android.view.View
import android.widget.TextView
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.google.android.material.snackbar.Snackbar
import de.dhbwloe.loerrach.campusapp.nfcreader.NfcBadgeInterface
import de.dhbwloe.loerrach.campusapp.nfcreader.NfcBadgeListener
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols

class MainActivity : ReactActivity() {
 
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    override fun getMainComponentName(): String = "CampusApp"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    private lateinit var nfcBadgeListener: NfcBadgeListener

    override fun onCreate(savedInstanceState: Bundle?) {
	// We need to call super.onCreate(null), see
	// https://github.com/software-mansion/react-native-screens#android
        super.onCreate(null)
        val dfs = DecimalFormatSymbols.getInstance()
        dfs.decimalSeparator = ','
        val euroFormat = DecimalFormat("0.00€", dfs)
        nfcBadgeListener = NfcBadgeListener(this)
        nfcBadgeListener.registerNfcBadgeInterface(object : NfcBadgeInterface {
            override fun onNfcReaderStateChanged(state: Boolean) {}
            override fun onNfcReaderReceived(balance: Int, lastTransaction: Int) {
                val badgeBalance = balance / 100.0
                val lastTransactionValue = -lastTransaction / 100.0
                val msg = """
                    Guthaben: ${euroFormat.format(badgeBalance)}
                    Letzte Transaktion: ${euroFormat.format(lastTransactionValue)}
                    """.trimIndent()
                val snackbar = Snackbar.make(
                    findViewById<View>(R.id.content).rootView,
                    msg,
                    Snackbar.LENGTH_LONG
                )
                val snackbarTextView =
                    snackbar.view.findViewById<TextView>(com.google.android.material.R.id.snackbar_text)
                snackbarTextView.textSize = 24f
                snackbar.show()
            }
        })
        nfcBadgeListener.startNfcListener()
    }

    /* nfc listener related callbacks */
    override fun onResume() {
        super.onResume()
        nfcBadgeListener.resumeForefrontDispatcher()
    }

    override fun onPause() {
        super.onPause()
        nfcBadgeListener.pauseForefrontDispatcher()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (NfcAdapter.ACTION_TECH_DISCOVERED == intent.action) {
            nfcBadgeListener.handleNfcEvent(intent)
        }
    }
}
