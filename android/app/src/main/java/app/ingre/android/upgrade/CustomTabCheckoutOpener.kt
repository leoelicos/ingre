package app.ingre.android.upgrade

import android.content.Context
import android.content.Intent
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.net.toUri
import app.ingre.android.core.CheckoutOpener
import app.ingre.android.core.CheckoutReturn
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Opens Stripe's checkout page in a Custom Tab and waits for it to come back (#195): Stripe
 * sends the user to `ingre://upgrade/success` or `ingre://upgrade/cancel`, which MainActivity
 * hands to [returned]; coming back any other way is [CheckoutReturn.Dismissed].
 */
class CustomTabCheckoutOpener(private val context: Context) : CheckoutOpener {
    private var pending: CompletableDeferred<CheckoutReturn>? = null
    private var leftApp = false

    override suspend fun open(url: String): CheckoutReturn {
        val result = CompletableDeferred<CheckoutReturn>()
        pending = result
        leftApp = false
        try {
            val intent = CustomTabsIntent.Builder().setShowTitle(true).build()
            intent.intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            intent.launchUrl(context, url.toUri())
        } catch (_: android.content.ActivityNotFoundException) {
            pending = null
            return CheckoutReturn.Failed
        }
        return result.await().also { pending = null }
    }

    /** The app went to the background while the tab is open. */
    fun onPause() {
        if (pending != null) leftApp = true
    }

    /** Back in the app: without a deep link, the user closed the tab. */
    fun onResume() {
        if (leftApp) pending?.complete(CheckoutReturn.Dismissed)
    }

    /** `ingre://upgrade/success|cancel` arrived. */
    fun returned(result: CheckoutReturn) {
        pending?.complete(result)
    }
}

/** UI tests: records the checkout page instead of opening it, and answers with [answer]. */
class MockCheckoutOpener(private val answer: CheckoutReturn = CheckoutReturn.Cancel) : CheckoutOpener {
    private val _lastUrl = MutableStateFlow<String?>(null)
    val lastUrl: StateFlow<String?> = _lastUrl.asStateFlow()

    private val _opens = MutableStateFlow(0)
    val opens: StateFlow<Int> = _opens.asStateFlow()

    override suspend fun open(url: String): CheckoutReturn {
        _lastUrl.value = url
        _opens.value += 1
        return answer
    }
}
