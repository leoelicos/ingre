package com.leoelicos.ingre.billing

import kotlinx.coroutines.flow.MutableSharedFlow

/** #314: Google Play stand-in for unit tests. */
class FakeBillingGateway(
    var connects: Boolean = true,
    var offered: List<StoreProduct> = Tier.entries.map {
        StoreProduct(it.productId, "A$${it.usdPerMonth}.99", "offer-${it.name.lowercase()}")
    },
    var owned: List<StorePurchase> = emptyList(),
    var launches: Boolean = true
) : BillingGateway {
    override val updates = MutableSharedFlow<PurchaseUpdate>()
    val launched = mutableListOf<PurchaseRequest>()
    val acknowledged = mutableListOf<String>()

    override suspend fun connect() = connects
    override suspend fun products(productIds: List<String>) =
        offered.filter { it.productId in productIds }
    override suspend fun activePurchases() = owned
    override suspend fun acknowledge(purchaseToken: String): Boolean {
        acknowledged += purchaseToken
        return true
    }
    override fun launch(request: PurchaseRequest): Boolean {
        launched += request
        return launches
    }
}

fun purchase(tier: Tier, token: String, purchased: Boolean = true, acknowledged: Boolean = false) =
    StorePurchase(listOf(tier.productId), token, purchased, acknowledged)

/** Server stand-in: active for every token it knows, else it refuses like the real one. */
class FakeVerifier(private val known: MutableMap<String, Verified> = mutableMapOf()) : PurchaseVerifier {
    val submitted = mutableListOf<Pair<String, String>>()
    fun knows(token: String, tier: Tier, active: Boolean = true) {
        known[token] = Verified(tier, active, if (active) "active" else "canceled")
    }
    override suspend fun submit(productId: String, purchaseToken: String): Verified {
        submitted += productId to purchaseToken
        return known[purchaseToken] ?: throw Exception("STORE_VERIFICATION_FAILED")
    }
}
