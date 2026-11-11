package com.leoelicos.ingre.billing

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update

/** What the Plans screen shows. */
data class PlansState(
    val loading: Boolean = true,
    /** false when Google Play billing can't be reached on this device */
    val available: Boolean = true,
    val prices: Map<Tier, String> = emptyMap(),
    val current: Tier? = null,
    val busy: Boolean = false,
    val message: String? = null
)

/** What choosing a tier does from the current one. */
enum class PlanAction { CHOOSE, UPGRADE, DOWNGRADE, CURRENT }

fun planAction(current: Tier?, tier: Tier): PlanAction = when {
    current == null -> PlanAction.CHOOSE
    current == tier -> PlanAction.CURRENT
    tier.ordinal > current.ordinal -> PlanAction.UPGRADE
    else -> PlanAction.DOWNGRADE
}

/** The button text for a tier: plain and literal (house rules). */
fun planButtonLabel(current: Tier?, tier: Tier): String = when (planAction(current, tier)) {
    PlanAction.CHOOSE -> "Choose ${tier.label}"
    PlanAction.UPGRADE -> "Switch up to ${tier.label}"
    PlanAction.DOWNGRADE -> "Switch down to ${tier.label}"
    PlanAction.CURRENT -> "${tier.label} is your plan"
}

/**
 * #314: buying, restoring and switching tiers on Google Play. A purchase only counts once
 * the server has checked it with Google; it is acknowledged after that (Google refunds a
 * purchase that isn't acknowledged within three days, so a purchase the server can't
 * confirm is never kept).
 */
class SubscriptionManager(
    private val gateway: BillingGateway,
    private val verifier: PurchaseVerifier,
    private val accountId: () -> String?
) {
    private val _state = MutableStateFlow(PlansState())
    val state: StateFlow<PlansState> = _state

    private val products = mutableMapOf<Tier, StoreProduct>()
    private var currentPurchase: StorePurchase? = null

    /** Connects, reads prices, and quietly restores a plan bought before. */
    suspend fun load() {
        _state.update { it.copy(loading = true, message = null) }
        if (!gateway.connect()) {
            _state.update { it.copy(loading = false, available = false, message = UNAVAILABLE) }
            return
        }
        gateway.products(Tier.productIds).forEach { product ->
            Tier.of(product.productId)?.let { products[it] = product }
        }
        _state.update {
            it.copy(
                loading = false,
                available = true,
                prices = products.mapValues { (_, p) -> p.formattedPrice }
            )
        }
        sync(gateway.activePurchases(), announce = false)
    }

    /** Opens Google Play for [tier]; switching tiers replaces the current subscription. */
    fun choose(tier: Tier): Boolean {
        val product = products[tier]
        if (product == null) {
            _state.update { it.copy(message = "${tier.label} isn't available right now.") }
            return false
        }
        val current = _state.value.current
        val owned = currentPurchase
        val replacement = when (planAction(current, tier)) {
            PlanAction.CURRENT -> return false
            PlanAction.CHOOSE -> null
            PlanAction.UPGRADE, PlanAction.DOWNGRADE -> if (owned == null || current == null) null else Replacement(
                oldPurchaseToken = owned.purchaseToken,
                oldProductId = current.productId,
                mode = if (planAction(current, tier) == PlanAction.UPGRADE) {
                    ReplacementMode.CHARGE_PRORATED_PRICE
                } else {
                    ReplacementMode.DEFERRED
                }
            )
        }
        val launched = gateway.launch(PurchaseRequest(product, accountId(), replacement))
        _state.update {
            it.copy(busy = launched, message = if (launched) null else "Couldn't open Google Play. Try again.")
        }
        return launched
    }

    /** Google Play's answer to a purchase sheet. */
    suspend fun onUpdate(update: PurchaseUpdate) {
        when (update) {
            is PurchaseUpdate.Purchased -> sync(update.purchases, announce = true)
            PurchaseUpdate.Cancelled -> _state.update { it.copy(busy = false, message = null) }
            is PurchaseUpdate.Failed -> _state.update { it.copy(busy = false, message = update.message) }
        }
    }

    /** "Restore purchases": checks every subscription Google Play has for this Google account. */
    suspend fun restore() {
        _state.update { it.copy(busy = true, message = null) }
        val purchases = gateway.activePurchases()
        if (purchases.none { p -> p.productIds.any { Tier.of(it) != null } }) {
            _state.update { it.copy(busy = false, message = "No plan to restore on this Google account.") }
            return
        }
        sync(purchases, announce = true)
    }

    private suspend fun sync(purchases: List<StorePurchase>, announce: Boolean) {
        var message: String? = null
        for (purchase in purchases) {
            val productId = purchase.productIds.firstOrNull { Tier.of(it) != null } ?: continue
            if (!purchase.purchased) {
                message = "Waiting for Google Play to confirm the payment."
                continue
            }
            val verified = try {
                verifier.submit(productId, purchase.purchaseToken)
            } catch (e: Exception) {
                message = "Couldn't confirm the purchase: ${e.message ?: "try again"}."
                continue
            }
            if (!purchase.acknowledged) gateway.acknowledge(purchase.purchaseToken)
            if (verified.active && verified.tier != null) {
                currentPurchase = purchase
                _state.update { it.copy(current = verified.tier) }
                message = "You're on ${verified.tier.label}."
            } else {
                message = "Google Play says this plan isn't active (${verified.status})."
            }
        }
        _state.update { it.copy(busy = false, message = if (announce) message else it.message) }
    }

    companion object {
        const val UNAVAILABLE = "Google Play billing isn't available on this device."
    }
}
