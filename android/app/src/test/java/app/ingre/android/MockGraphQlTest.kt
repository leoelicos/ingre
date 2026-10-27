package app.ingre.android

import app.ingre.android.core.ApiException
import app.ingre.android.core.MemoryTokenStore
import app.ingre.android.network.ApolloIngreApi
import app.ingre.android.network.MockGraphQl
import app.ingre.android.network.MockMode
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

/** The real Apollo client against the mock server the UI tests use: success, 404 and 500. */
class MockGraphQlTest {
    private fun api(mode: MockMode, tokens: MemoryTokenStore = MemoryTokenStore()) = ApolloIngreApi(
        MockGraphQl.ENDPOINT,
        "https://web.test",
        tokens,
        OkHttpClient.Builder().addInterceptor(MockGraphQl(mode)).build()
    )

    @Test
    fun successAnswersEveryOperation() = runTest {
        val tokens = MemoryTokenStore()
        val api = api(MockMode.Success, tokens)
        val (token, user) = api.login("ann@example.com", "secret")
        assertEquals("Ann", user.firstName)
        tokens.write(token)
        assertEquals(false, api.currentUser().pro)
        assertTrue(api.checkoutSession()!!.startsWith("cs_test_"))
        assertTrue(api.makeUserPro())
    }

    @Test
    fun serverErrorsBecomeHttpErrors() = runTest {
        for ((mode, status) in listOf(MockMode.ServerError to 500, MockMode.NotFound to 404)) {
            val error = assertThrows<ApiException.Http> { api(mode).checkoutSession() }
            assertEquals(status, error.status)
            assertThrows<ApiException.Http> { api(mode).login("a@b.c", "x") }
        }
    }
}
