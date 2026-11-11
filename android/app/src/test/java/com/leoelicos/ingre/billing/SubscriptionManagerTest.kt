package com.leoelicos.ingre.billing

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** #314: buying, restoring and switching tiers, against a fake Google Play and server. */
class SubscriptionManagerTest {
    private val user = "65a1b2c3d4e5f60718293a4b"

    private fun setup(
        gateway: FakeBillingGateway = FakeBillingGateway(),
        verifier: FakeVerifier = FakeVerifier()
    ) = Triple(gateway, verifier, SubscriptionManager(gateway, verifier) { user })

    @Test
    fun loadShowsGooglePlayPrices() = runTest {
        val (_, _, manager) = setup()
        manager.load()
        val state = manager.state.value
        assertFalse(state.loading)
        assertTrue(state.available)
        assertEquals("A$8.99", state.prices[Tier.MANAGER])
        assertNull(state.current)
    }

    @Test
    fun withoutGooglePlayNothingCanBeBought() = runTest {
        val (gateway, _, manager) = setup(FakeBillingGateway(connects = false))
        manager.load()
        assertFalse(manager.state.value.available)
        assertEquals(SubscriptionManager.UNAVAILABLE, manager.state.value.message)
        assertFalse(manager.choose(Tier.EXPLORER))
        assertTrue(gateway.launched.isEmpty())
    }

    @Test
    fun choosingATierOpensGooglePlayForThisAccount() = runTest {
        val (gateway, _, manager) = setup()
        manager.load()
        assertTrue(manager.choose(Tier.EXPLORER))
        val request = gateway.launched.single()
        assertEquals("ingre_explorer_monthly", request.product.productId)
        assertEquals("offer-explorer", request.product.offerToken)
        assertEquals(user, request.accountId)
        assertNull(request.replacement)
        assertTrue(manager.state.value.busy)
    }

    @Test
    fun aPurchaseCountsOnlyAfterTheServerConfirmsItThenIsAcknowledged() = runTest {
        val (gateway, verifier, manager) = setup()
        manager.load()
        verifier.knows("tok-1", Tier.MANAGER)
        manager.onUpdate(PurchaseUpdate.Purchased(listOf(purchase(Tier.MANAGER, "tok-1"))))
        assertEquals(listOf("ingre_manager_monthly" to "tok-1"), verifier.submitted)
        assertEquals(listOf("tok-1"), gateway.acknowledged)
        assertEquals(Tier.MANAGER, manager.state.value.current)
        assertEquals("You're on Manager.", manager.state.value.message)
        assertFalse(manager.state.value.busy)
    }

    @Test
    fun aPurchaseTheServerRefusesIsNeitherGrantedNorAcknowledged() = runTest {
        val (gateway, _, manager) = setup()
        manager.load()
        manager.onUpdate(PurchaseUpdate.Purchased(listOf(purchase(Tier.LEADER, "tok-x"))))
        assertNull(manager.state.value.current)
        assertTrue(gateway.acknowledged.isEmpty())
        assertEquals("Couldn't confirm the purchase: STORE_VERIFICATION_FAILED.", manager.state.value.message)
    }

    @Test
    fun aPendingPaymentGivesNothingYet() = runTest {
        val (gateway, verifier, manager) = setup()
        manager.load()
        manager.onUpdate(PurchaseUpdate.Purchased(listOf(purchase(Tier.EXPLORER, "tok-p", purchased = false))))
        assertTrue(verifier.submitted.isEmpty())
        assertTrue(gateway.acknowledged.isEmpty())
        assertEquals("Waiting for Google Play to confirm the payment.", manager.state.value.message)
    }

    @Test
    fun anAlreadyAcknowledgedPurchaseIsNotAcknowledgedAgain() = runTest {
        val verifier = FakeVerifier().apply { knows("tok-a", Tier.EXPLORER) }
        val gateway = FakeBillingGateway(owned = listOf(purchase(Tier.EXPLORER, "tok-a", acknowledged = true)))
        val (_, _, manager) = setup(gateway, verifier)
        manager.load()
        assertEquals(Tier.EXPLORER, manager.state.value.current)
        assertTrue(gateway.acknowledged.isEmpty())
        // the quiet restore on load says nothing
        assertNull(manager.state.value.message)
    }

    @Test
    fun anInactivePlanIsNotGranted() = runTest {
        val verifier = FakeVerifier().apply { knows("tok-old", Tier.MANAGER, active = false) }
        val (_, _, manager) = setup(verifier = verifier)
        manager.load()
        manager.onUpdate(PurchaseUpdate.Purchased(listOf(purchase(Tier.MANAGER, "tok-old"))))
        assertNull(manager.state.value.current)
        assertEquals("Google Play says this plan isn't active (canceled).", manager.state.value.message)
    }

    @Test
    fun restoreFindsAPlanOrSaysThereIsNone() = runTest {
        val gateway = FakeBillingGateway()
        val verifier = FakeVerifier()
        val (_, _, manager) = setup(gateway, verifier)
        manager.load()
        manager.restore()
        assertEquals("No plan to restore on this Google account.", manager.state.value.message)
        gateway.owned = listOf(purchase(Tier.LEADER, "tok-r", acknowledged = true))
        verifier.knows("tok-r", Tier.LEADER)
        manager.restore()
        assertEquals(Tier.LEADER, manager.state.value.current)
        assertEquals("You're on Leader.", manager.state.value.message)
    }

    @Test
    fun switchingUpChargesTheDifferenceNowAndDownWaitsForRenewal() = runTest {
        val verifier = FakeVerifier().apply { knows("tok-m", Tier.MANAGER) }
        val gateway = FakeBillingGateway(owned = listOf(purchase(Tier.MANAGER, "tok-m", acknowledged = true)))
        val (_, _, manager) = setup(gateway, verifier)
        manager.load()
        assertFalse("the current plan isn't bought again", manager.choose(Tier.MANAGER))
        manager.choose(Tier.LEADER)
        assertEquals(
            Replacement("tok-m", "ingre_manager_monthly", ReplacementMode.CHARGE_PRORATED_PRICE),
            gateway.launched.last().replacement
        )
        manager.choose(Tier.EXPLORER)
        assertEquals(
            Replacement("tok-m", "ingre_manager_monthly", ReplacementMode.DEFERRED),
            gateway.launched.last().replacement
        )
    }

    @Test
    fun cancelledAndFailedSheetsSaySo() = runTest {
        val (_, _, manager) = setup()
        manager.load()
        manager.choose(Tier.EXPLORER)
        manager.onUpdate(PurchaseUpdate.Cancelled)
        assertFalse(manager.state.value.busy)
        assertNull(manager.state.value.message)
        manager.onUpdate(PurchaseUpdate.Failed("You already have this plan."))
        assertEquals("You already have this plan.", manager.state.value.message)
    }

    @Test
    fun aTierGooglePlayDidNotOfferOrASheetThatWontOpen() = runTest {
        val gateway = FakeBillingGateway(offered = emptyList(), launches = false)
        val (_, _, manager) = setup(gateway)
        manager.load()
        assertFalse(manager.choose(Tier.LEADER))
        assertEquals("Leader isn't available right now.", manager.state.value.message)
        gateway.offered = FakeBillingGateway().offered
        manager.load()
        assertFalse(manager.choose(Tier.LEADER))
        assertEquals("Couldn't open Google Play. Try again.", manager.state.value.message)
    }
}
