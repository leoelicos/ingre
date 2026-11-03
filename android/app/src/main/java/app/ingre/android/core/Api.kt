package app.ingre.android.core

import java.util.Base64
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** The signed-in user, as getUser and login give it. */
data class UserProfile(val id: String, val email: String, val firstName: String, val pro: Boolean)

/** A saved recipe: what the heart needs to know (its server id and library id). */
data class SavedRecipeSummary(val id: String, val libraryId: String?)

sealed class ApiException(message: String) : Exception(message) {
    /** the server answered with this HTTP status (404, 500 …) */
    class Http(val status: Int) : ApiException("HTTP $status")

    /** the server answered 200 with GraphQL errors */
    class GraphQl(val messages: List<String>) : ApiException(messages.joinToString())

    /** the server answered without the data asked for (e.g. login with wrong details) */
    class NoData : ApiException("no data")

    /** no answer at all */
    class Offline : ApiException("offline")
}

/**
 * Everything the app asks the GraphQL server (server/src/schemas/typeDefs.ts), behind an
 * interface so view models are tested without a network. The app's implementation uses Apollo Kotlin.
 */
interface IngreApi {
    suspend fun login(email: String, password: String): Pair<String, UserProfile>

    suspend fun currentUser(): UserProfile

    suspend fun savedRecipes(): List<SavedRecipeSummary>

    suspend fun saveRecipe(input: RecipeInputValue): SavedRecipeSummary

    suspend fun removeRecipe(id: String): Boolean

    /** A new Stripe Checkout session id, or null when the server gave none. */
    suspend fun checkoutSession(): String?

    suspend fun makeUserPro(): Boolean
}

/** Where the JWT lives: the Android Keystore in the app, memory in tests. Never plain prefs. */
interface TokenStore {
    fun read(): String?

    fun write(token: String?)
}

class MemoryTokenStore(
    @Volatile private var token: String? = null
) : TokenStore {
    override fun read(): String? = token

    override fun write(token: String?) {
        this.token = token
    }
}

/** The JWT's payload, as the server signs it: `{ data: { _id, email, firstName, pro }, exp }`. */
@Serializable
data class JwtClaims(val data: Data, val exp: Double) {
    @Serializable
    data class Data(
        @SerialName("_id") val id: String,
        val email: String,
        val firstName: String,
        val pro: Boolean? = null
    )

    fun isExpired(nowSeconds: Double): Boolean = exp < nowSeconds

    companion object {
        private val json = Json { ignoreUnknownKeys = true }

        /** The claims of a token, or null when it isn't a readable JWT. */
        fun decode(token: String): JwtClaims? {
            val parts = token.split(".")
            if (parts.size != 3) return null
            return runCatching {
                val payload = String(Base64.getUrlDecoder().decode(parts[1].trimEnd('=')), Charsets.UTF_8)
                json.decodeFromString<JwtClaims>(payload)
            }.getOrNull()
        }
    }
}

/**
 * Stripe's hosted checkout page for a session (#195). The server returns only the session id
 * (the web hands it to Stripe.js `redirectToCheckout`), so the app builds the page's URL the
 * way Stripe.js does: the session id in the path and the publishable key, XOR 5 and base64, in
 * the fragment.
 */
object CheckoutUrl {
    /** The web app's publishable test key (client/src/pages/Admin/checkout.ts). */
    const val PUBLISHABLE_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx"

    fun make(
        sessionId: String,
        base: String = "https://checkout.stripe.com/c/pay/",
        key: String = PUBLISHABLE_KEY
    ): String {
        val json = """{"apiKey":"$key"}"""
        val bytes = json.toByteArray().map { (it.toInt() xor 5).toByte() }.toByteArray()
        val fragment = Base64.getEncoder().encodeToString(bytes)
        return "${base.trimEnd('/')}/$sessionId#$fragment"
    }
}

/** How a checkout in the browser ended: `ingre://upgrade/success`, `/cancel`, or closed. */
enum class CheckoutReturn {
    Success,
    Cancel,
    Dismissed,
    Failed
    ;

    companion object {
        /** `ingre://upgrade/success` and `ingre://upgrade/cancel`; anything else is null. */
        fun fromUrl(scheme: String?, host: String?, path: String?): CheckoutReturn? {
            if (scheme != "ingre" || host != "upgrade") return null
            return when (path) {
                "/success" -> Success
                "/cancel" -> Cancel
                else -> null
            }
        }
    }
}

/** Opens Stripe's checkout page and waits for it to come back (a Custom Tab in the app). */
interface CheckoutOpener {
    suspend fun open(url: String): CheckoutReturn
}
