package app.ingre.android

import app.ingre.android.core.ApiException
import app.ingre.android.core.CheckoutOpener
import app.ingre.android.core.CheckoutReturn
import app.ingre.android.core.IngreApi
import app.ingre.android.core.L10n
import app.ingre.android.core.Library
import app.ingre.android.core.RecipeInputValue
import app.ingre.android.core.SavedRecipeSummary
import app.ingre.android.core.UserProfile
import java.io.File
import java.util.Base64
import javax.xml.parsers.DocumentBuilderFactory
import org.w3c.dom.Element

/** The repo root: Gradle runs unit tests in android/app. */
val repoRoot: File = File("../..").canonicalFile

object TestSupport {
    /** res/values/strings.xml by resource name, unquoted and unescaped as Android does. */
    val strings: Map<String, String> by lazy {
        val doc = DocumentBuilderFactory.newInstance().newDocumentBuilder()
            .parse(File(repoRoot, "android/app/src/main/res/values/strings.xml"))
        val nodes = doc.getElementsByTagName("string")
        (0 until nodes.length).associate { i ->
            val node = nodes.item(i) as Element
            node.getAttribute("name") to unescape(node.textContent)
        }
    }

    fun unescape(raw: String): String {
        val text = if (raw.length >= 2 && raw.startsWith('"') &&
            raw.endsWith('"')
        ) {
            raw.substring(1, raw.length - 1)
        } else {
            raw
        }
        val out = StringBuilder()
        var i = 0
        while (i < text.length) {
            val c = text[i]
            if (c == '\\' && i + 1 < text.length) {
                out.append(
                    when (val next = text[i + 1]) {
                        'n' -> '\n'
                        't' -> '\t'
                        else -> next
                    }
                )
                i += 2
            } else {
                out.append(c)
                i += 1
            }
        }
        return out.toString()
    }

    fun useStrings() {
        val strings = strings
        L10n.lookup = { key -> strings[L10n.resourceName(key)] ?: key }
    }

    /** The same JSON the web client bundles (client/src/data), read from the repo. */
    val library: Library by lazy {
        val data = File(repoRoot, "client/src/data")
        Library.parse(File(data, "ingredients.json").readText(), File(data, "recipes.json").readText())
    }
}

/** A scripted API: every call is recorded, and each answer can be swapped per test. */
class FakeApi : IngreApi {
    val calls = mutableListOf<String>()
    var loginResult: Result<Pair<String, UserProfile>> = Result.failure(ApiException.NoData())
    var user = UserProfile("u1", "ann@example.com", "Ann", false)
    var saved = mutableListOf<SavedRecipeSummary>()
    var saveFails = false
    var session: Result<String?> = Result.success("cs_test_123")
    var proResult = true
    val savedInputs = mutableListOf<RecipeInputValue>()

    /** Called inside checkoutSession, so a test can tap again while one is in flight. */
    var duringCheckout: (suspend () -> Unit)? = null

    override suspend fun login(email: String, password: String): Pair<String, UserProfile> {
        calls += "login"
        return loginResult.getOrThrow()
    }

    override suspend fun currentUser(): UserProfile {
        calls += "getUser"
        return user
    }

    override suspend fun savedRecipes(): List<SavedRecipeSummary> {
        calls += "getSavedRecipes"
        return saved.toList()
    }

    override suspend fun saveRecipe(input: RecipeInputValue): SavedRecipeSummary {
        calls += "saveRecipe"
        if (saveFails) throw ApiException.Http(500)
        savedInputs += input
        return SavedRecipeSummary("s${savedInputs.size}", input.libraryId).also { saved += it }
    }

    override suspend fun removeRecipe(id: String): Boolean {
        calls += "removeRecipe"
        saved.removeAll { it.id == id }
        return true
    }

    override suspend fun checkoutSession(): String? {
        calls += "checkout"
        duringCheckout?.invoke()
        return session.getOrThrow()
    }

    override suspend fun makeUserPro(): Boolean {
        calls += "makeUserPro"
        return proResult
    }
}

/** A JWT the server could have signed (the signature is not checked on the device). */
fun makeToken(firstName: String = "Ann", exp: Long = 4_102_444_800): String {
    fun part(json: String) = Base64.getUrlEncoder().withoutPadding().encodeToString(json.toByteArray())
    val payload = """{"data":{"_id":"u1","email":"ann@example.com","firstName":"$firstName","pro":false},"exp":$exp}"""
    return "${part("""{"alg":"HS256","typ":"JWT"}""")}.${part(payload)}.sig"
}

/** Records the checkout URL and answers as told. */
class RecordingOpener(var answer: CheckoutReturn = CheckoutReturn.Cancel) : CheckoutOpener {
    val opened = mutableListOf<String>()

    override suspend fun open(url: String): CheckoutReturn {
        opened += url
        return answer
    }
}
