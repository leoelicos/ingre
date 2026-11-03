package app.ingre.android.network

import java.util.Base64
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import okio.Buffer

/**
 * Canned GraphQL answers for UI tests and screenshots (#195). The real Apollo client sends real
 * requests; this OkHttp interceptor answers them by operation name, so every type is parsed for
 * real. Modes: success, server-error (HTTP 500) and not-found (HTTP 404).
 */
enum class MockMode(val status: Int) {
    Success(200),
    ServerError(500),
    NotFound(404)
}

class MockGraphQl(
    @Volatile var mode: MockMode = MockMode.Success,
    /** milliseconds before each answer, so a test can see "Starting the Stripe checkout…" */
    @Volatile var delayMillis: Long = 0
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val buffer = Buffer()
        request.body?.writeTo(buffer)
        val operation = operationName(buffer.readUtf8()) ?: request.url.queryParameter("operationName").orEmpty()
        if (delayMillis > 0) Thread.sleep(delayMillis)
        val failed = """{"errors":[{"message":"HTTP ${mode.status}"}]}"""
        val body = if (mode == MockMode.Success) body(operation) else failed
        return Response.Builder()
            .request(request)
            .protocol(Protocol.HTTP_1_1)
            .code(mode.status)
            .message(if (mode == MockMode.Success) "OK" else "Error")
            .body(body.toResponseBody("application/json".toMediaType()))
            .build()
    }

    companion object {
        const val ENDPOINT = "https://mock.ingre.test/graphql"
        const val CHECKOUT_BASE = "https://checkout.mock.ingre.test/c/pay/"

        private fun part(json: String) = Base64.getUrlEncoder().withoutPadding().encodeToString(json.toByteArray())

        /** A token the app accepts: a real JWT shape for "Ann", expiring in 2100. */
        val token: String =
            part("""{"alg":"HS256","typ":"JWT"}""") + "." +
                part(
                    """{"data":{"_id":"u1","email":"ann@example.com","firstName":"Ann","pro":false},"exp":4102444800}"""
                ) +
                ".mock"

        fun operationName(body: String): String? = runCatching {
            Json.parseToJsonElement(body).jsonObject["operationName"]?.jsonPrimitive?.content
        }.getOrNull()

        fun body(operation: String): String {
            val user = """{"__typename":"User","_id":"u1","email":"ann@example.com","firstName":"Ann","pro":false}"""
            return when (operation) {
                "Login" -> """{"data":{"login":{"__typename":"Auth","token":"$token","user":$user}}}"""
                "GetUser" -> """{"data":{"getUser":$user}}"""
                "GetSavedRecipes" -> """{"data":{"getSavedRecipes":[]}}"""
                "SaveRecipe" -> """{"data":{"saveRecipe":{"__typename":"Recipe","_id":"saved-1","libraryId":null}}}"""
                "RemoveRecipe" -> """{"data":{"removeRecipe":true}}"""
                "Checkout" -> """{"data":{"checkout":{"__typename":"Checkout","session":"cs_test_mock"}}}"""
                "MakeUserPro" -> """{"data":{"makeUserPro":{"__typename":"User","_id":"u1","pro":true}}}"""
                else -> """{"errors":[{"message":"Unknown operation $operation"}]}"""
            }
        }
    }
}
