package com.leoelicos.ingre.billing

import kotlinx.coroutines.flow.Flow

/** #314: one subscription product as Google Play offers it to this user. */
data class StoreProduct(
    val productId: String,
    /** Google Play's local price for the base plan, e.g. "A$6.49" */
    val formattedPrice: String,
    /** the base plan's offer token, needed to launch the purchase */
    val offerToken: String
)

/** A purchase Google Play knows about (Purchase without the Play types). */
data class StorePurchase(
    val productIds: List<String>,
    val purchaseToken: String,
    /** PURCHASED, not PENDING (a pending payment gives nothing yet) */
    val purchased: Boolean,
    val acknowledged: Boolean
)

/** How a tier change happens: up now with the price difference, down at the next renewal. */
enum class ReplacementMode { CHARGE_PRORATED_PRICE, DEFERRED }

data class Replacement(
    val oldPurchaseToken: String,
    val oldProductId: String,
    val mode: ReplacementMode
)

data class PurchaseRequest(
    val product: StoreProduct,
    /** the signed-in user's id, so Google ties the purchase to this account */
    val accountId: String?,
    val replacement: Replacement?
)

sealed interface PurchaseUpdate {
    data class Purchased(val purchases: List<StorePurchase>) : PurchaseUpdate
    data object Cancelled : PurchaseUpdate
    data class Failed(val message: String) : PurchaseUpdate
}

/**
 * Everything the Plans screen needs from Google Play. [PlayBillingGateway] is the real one;
 * tests use a fake, so the purchase logic runs without a device or the Play Store.
 */
interface BillingGateway {
    val updates: Flow<PurchaseUpdate>
    suspend fun connect(): Boolean
    suspend fun products(productIds: List<String>): List<StoreProduct>
    suspend fun activePurchases(): List<StorePurchase>
    suspend fun acknowledge(purchaseToken: String): Boolean
    /** Opens Google Play's purchase sheet; the result arrives on [updates]. */
    fun launch(request: PurchaseRequest): Boolean
}
