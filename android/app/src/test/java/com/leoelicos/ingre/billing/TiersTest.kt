package com.leoelicos.ingre.billing

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Test
import java.util.Base64

/** #314: tiers, the flag, button wording and the server call, without a device. */
class TiersTest {
    @Test
    fun productIdsMatchTheServerAndAppStore() {
        assertEquals(
            listOf("ingre_explorer_monthly", "ingre_manager_monthly", "ingre_leader_monthly"),
            Tier.productIds
        )
        assertEquals(Tier.MANAGER, Tier.of("ingre_manager_monthly"))
        assertNull(Tier.of("coins"))
        assertEquals("16 USD a month", Tier.LEADER.fallbackPrice)
    }

    @Test
    fun tiersAreOffByDefault() {
        assertFalse(Flags.tiers)
    }

    @Test
    fun buttonsSayWhatHappens() {
        assertEquals("Choose Explorer", planButtonLabel(null, Tier.EXPLORER))
        assertEquals("Switch up to Leader", planButtonLabel(Tier.MANAGER, Tier.LEADER))
        assertEquals("Switch down to Explorer", planButtonLabel(Tier.MANAGER, Tier.EXPLORER))
        assertEquals("Manager is your plan", planButtonLabel(Tier.MANAGER, Tier.MANAGER))
    }

    @Test
    fun theMutationSendsAGooglePurchase() {
        val vars = GraphQLPurchaseVerifier.submitVariables("ingre_leader_monthly", "tok")
        assertEquals("GOOGLE", vars.getString("platform"))
        assertEquals("ingre_leader_monthly", vars.getString("productId"))
        assertEquals("tok", vars.getString("purchaseToken"))
        assert(GraphQLPurchaseVerifier.SUBMIT.contains("submitStorePurchase(platform:"))
        val data = JSONObject("""{"submitStorePurchase":{"tier":"LEADER","status":"active","active":true}}""")
        assertEquals(Verified(Tier.LEADER, true, "active"), GraphQLPurchaseVerifier.parseVerified(data))
        val none = JSONObject("""{"submitStorePurchase":{"tier":null,"status":"incomplete","active":false}}""")
        assertEquals(Verified(null, false, "incomplete"), GraphQLPurchaseVerifier.parseVerified(none))
    }

    @Test
    fun theAccountIdIsTheUserIdInTheAppToken() {
        fun jwt(payload: String) =
            "x." + Base64.getUrlEncoder().withoutPadding().encodeToString(payload.toByteArray()) + ".y"
        assertEquals(
            "65a1b2c3d4e5f60718293a4b",
            userIdOf(jwt("""{"data":{"_id":"65a1b2c3d4e5f60718293a4b","email":"a@b.c"}}"""))
        )
        assertNull(userIdOf(jwt("""{"data":{"_id":"cook@example.com"}}""")))
        assertNull(userIdOf(jwt("""not json""")))
        assertNull(userIdOf("nodots"))
        assertNull(userIdOf(null))
    }
}
