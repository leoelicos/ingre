package com.leoelicos.ingre.billing

import com.leoelicos.ingre.data.GraphQLClient
import java.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

/** What the server says after checking a purchase with Google Play. */
data class Verified(val tier: Tier?, val active: Boolean, val status: String)

/** #314: sends a purchase to the server, which checks it with Google before granting the tier. */
fun interface PurchaseVerifier {
    suspend fun submit(productId: String, purchaseToken: String): Verified
}

/** The real verifier: the `submitStorePurchase` mutation, with the signed-in user's token. */
class GraphQLPurchaseVerifier(
    private val token: () -> String?,
    private val client: GraphQLClient = GraphQLClient()
) : PurchaseVerifier {
    override suspend fun submit(productId: String, purchaseToken: String): Verified =
        withContext(Dispatchers.IO) {
            val data = client.query(SUBMIT, submitVariables(productId, purchaseToken), token())
            parseVerified(data)
        }

    companion object {
        val SUBMIT = """
            mutation SubmitStorePurchase(${'$'}platform: StorePlatform!, ${'$'}productId: String!, ${'$'}purchaseToken: String!) {
              submitStorePurchase(platform: ${'$'}platform, productId: ${'$'}productId, purchaseToken: ${'$'}purchaseToken) {
                tier
                status
                active
              }
            }
        """.trimIndent()

        fun submitVariables(productId: String, purchaseToken: String): JSONObject =
            JSONObject().apply {
                put("platform", "GOOGLE")
                put("productId", productId)
                put("purchaseToken", purchaseToken)
            }

        fun parseVerified(data: JSONObject): Verified {
            val result = data.getJSONObject("submitStorePurchase")
            val tierName = result.optString("tier", "")
            return Verified(
                tier = Tier.entries.firstOrNull { it.name == tierName },
                active = result.getBoolean("active"),
                status = result.getString("status")
            )
        }
    }
}

/**
 * The signed-in user's id from the app's JWT (`data._id`), sent to Google as the
 * obfuscated account id so a purchase can only be claimed by this account. Null if the
 * token can't be read.
 */
fun userIdOf(jwt: String?): String? {
    val payload = jwt?.split(".")?.getOrNull(1) ?: return null
    return try {
        val json = JSONObject(String(Base64.getUrlDecoder().decode(payload)))
        json.getJSONObject("data").getString("_id").takeIf { it.matches(Regex("[0-9a-fA-F]{24}")) }
    } catch (_: Exception) {
        null
    }
}
