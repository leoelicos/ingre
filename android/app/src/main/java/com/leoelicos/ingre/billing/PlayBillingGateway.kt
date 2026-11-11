package com.leoelicos.ingre.billing

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClient.BillingResponseCode
import com.android.billingclient.api.BillingClient.ProductType
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import kotlin.coroutines.resume
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.suspendCancellableCoroutine

/**
 * #314: Google Play Billing Library (the Java artifact, wrapped in coroutines here) behind
 * [BillingGateway]. Created only when the `tiers` flag is on.
 */
class PlayBillingGateway(
    context: Context,
    private val activity: () -> Activity?
) : BillingGateway {
    private val _updates = MutableSharedFlow<PurchaseUpdate>(
        extraBufferCapacity = 8,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    override val updates: SharedFlow<PurchaseUpdate> = _updates

    private val details = mutableMapOf<String, ProductDetails>()

    private val client: BillingClient = BillingClient.newBuilder(context.applicationContext)
        .setListener { result, purchases ->
            _updates.tryEmit(
                when (result.responseCode) {
                    BillingResponseCode.OK ->
                        PurchaseUpdate.Purchased(purchases.orEmpty().map { it.toStore() })
                    BillingResponseCode.USER_CANCELED -> PurchaseUpdate.Cancelled
                    else -> PurchaseUpdate.Failed(messageFor(result))
                }
            )
        }
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enablePrepaidPlans().build())
        .enableAutoServiceReconnection()
        .build()

    override suspend fun connect(): Boolean {
        if (client.isReady) return true
        return suspendCancellableCoroutine { cont ->
            client.startConnection(object : BillingClientStateListener {
                override fun onBillingSetupFinished(result: BillingResult) {
                    if (cont.isActive) cont.resume(result.responseCode == BillingResponseCode.OK)
                }

                override fun onBillingServiceDisconnected() {
                    if (cont.isActive) cont.resume(false)
                }
            })
        }
    }

    override suspend fun products(productIds: List<String>): List<StoreProduct> {
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                productIds.map {
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(it)
                        .setProductType(ProductType.SUBS)
                        .build()
                }
            )
            .build()
        val found: List<ProductDetails> = suspendCancellableCoroutine { cont ->
            client.queryProductDetailsAsync(params) { result, list ->
                cont.resume(
                    if (result.responseCode == BillingResponseCode.OK) list.productDetailsList
                    else emptyList()
                )
            }
        }
        return found.mapNotNull { product ->
            // the base plan: the offer without an offer id
            val offer = product.subscriptionOfferDetails?.let { offers ->
                offers.firstOrNull { it.offerId == null } ?: offers.firstOrNull()
            } ?: return@mapNotNull null
            details[product.productId] = product
            StoreProduct(
                productId = product.productId,
                formattedPrice = offer.pricingPhases.pricingPhaseList.lastOrNull()?.formattedPrice
                    ?: return@mapNotNull null,
                offerToken = offer.offerToken
            )
        }
    }

    override suspend fun activePurchases(): List<StorePurchase> =
        suspendCancellableCoroutine { cont ->
            client.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(ProductType.SUBS).build()
            ) { result, purchases ->
                cont.resume(
                    if (result.responseCode == BillingResponseCode.OK) purchases.map { it.toStore() }
                    else emptyList()
                )
            }
        }

    override suspend fun acknowledge(purchaseToken: String): Boolean =
        suspendCancellableCoroutine { cont ->
            client.acknowledgePurchase(
                AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchaseToken).build()
            ) { result -> cont.resume(result.responseCode == BillingResponseCode.OK) }
        }

    override fun launch(request: PurchaseRequest): Boolean {
        val host = activity() ?: return false
        val product = details[request.product.productId] ?: return false
        val productParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(product)
            .setOfferToken(request.product.offerToken)
            .apply {
                request.replacement?.let { change ->
                    setSubscriptionProductReplacementParams(
                        SubscriptionProductReplacementParams.newBuilder()
                            .setOldProductId(change.oldProductId)
                            .setReplacementMode(
                                when (change.mode) {
                                    ReplacementMode.CHARGE_PRORATED_PRICE ->
                                        SubscriptionProductReplacementParams.ReplacementMode.CHARGE_PRORATED_PRICE
                                    ReplacementMode.DEFERRED ->
                                        SubscriptionProductReplacementParams.ReplacementMode.DEFERRED
                                }
                            )
                            .build()
                    )
                }
            }
            .build()
        val flow = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productParams))
            .apply {
                request.accountId?.let { setObfuscatedAccountId(it) }
                request.replacement?.let { change ->
                    setSubscriptionUpdateParams(
                        BillingFlowParams.SubscriptionUpdateParams.newBuilder()
                            .setOldPurchaseToken(change.oldPurchaseToken)
                            .build()
                    )
                }
            }
            .build()
        return client.launchBillingFlow(host, flow).responseCode == BillingResponseCode.OK
    }

    private fun Purchase.toStore() = StorePurchase(
        productIds = products,
        purchaseToken = purchaseToken,
        purchased = purchaseState == Purchase.PurchaseState.PURCHASED,
        acknowledged = isAcknowledged
    )

    private fun messageFor(result: BillingResult): String = when (result.responseCode) {
        BillingResponseCode.BILLING_UNAVAILABLE -> "Google Play billing isn't available on this device."
        BillingResponseCode.NETWORK_ERROR, BillingResponseCode.SERVICE_UNAVAILABLE ->
            "Couldn't reach Google Play. Try again."
        BillingResponseCode.ITEM_ALREADY_OWNED -> "You already have this plan."
        else -> "The purchase didn't go through. Try again."
    }
}
