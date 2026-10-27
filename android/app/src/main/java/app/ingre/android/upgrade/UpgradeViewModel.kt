package app.ingre.android.upgrade

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.ingre.android.AppConfig
import app.ingre.android.core.CheckoutOpener
import app.ingre.android.core.CheckoutReturn
import app.ingre.android.core.CheckoutUrl
import app.ingre.android.core.IngreApi
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class UpgradeUi(
    val pro: Boolean = false,
    val starting: Boolean = false,
    val failed: Boolean = false,
    val cancelled: Boolean = false,
    val succeeded: Boolean = false,
    /** how many checkout attempts actually started (a double tap starts one) */
    val attempts: Int = 0
)

/**
 * Upgrade (#195): a port of client/src/pages/Admin/useUpgrade.ts. One attempt at a time: a
 * second tap while one is starting does nothing, and "Starting the Stripe checkout…" shows.
 */
@HiltViewModel
class UpgradeViewModel
@Inject
constructor(private val api: IngreApi, val opener: CheckoutOpener, private val config: AppConfig) : ViewModel() {
    private val _ui = MutableStateFlow(UpgradeUi())
    val ui: StateFlow<UpgradeUi> = _ui.asStateFlow()

    fun loadUser() {
        viewModelScope.launch {
            try {
                val user = api.currentUser()
                _ui.update { it.copy(pro = user.pro) }
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                // not signed in, or offline: the offer stays
            }
        }
    }

    /** Each tap starts an attempt, unless one is already in flight (then it is a no-op). */
    fun startCheckout() {
        if (_ui.value.starting) return
        _ui.update { it.copy(attempts = it.attempts + 1, starting = true, failed = false, cancelled = false) }
        viewModelScope.launch {
            try {
                val session = try {
                    api.checkoutSession()
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    null
                }
                if (session.isNullOrEmpty()) {
                    _ui.update { it.copy(failed = true) }
                    return@launch
                }
                finish(opener.open(CheckoutUrl.make(session, config.checkoutBaseUrl)))
            } finally {
                _ui.update { it.copy(starting = false) }
            }
        }
    }

    /** Back from Stripe: success makes the user pro (as the web's Success page does). */
    suspend fun finish(result: CheckoutReturn) {
        when (result) {
            CheckoutReturn.Success -> {
                val pro = try {
                    api.makeUserPro()
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    false
                }
                _ui.update { if (pro) it.copy(pro = true, succeeded = true) else it.copy(failed = true) }
            }

            CheckoutReturn.Cancel -> _ui.update { it.copy(cancelled = true) }

            CheckoutReturn.Dismissed -> Unit

            CheckoutReturn.Failed -> _ui.update { it.copy(failed = true) }
        }
    }
}
