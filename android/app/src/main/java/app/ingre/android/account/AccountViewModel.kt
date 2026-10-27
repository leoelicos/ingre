package app.ingre.android.account

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.ingre.android.core.ApiException
import app.ingre.android.core.IngreApi
import app.ingre.android.core.JwtClaims
import app.ingre.android.core.L10n
import app.ingre.android.core.RecipeInputValue
import app.ingre.android.core.SavedRecipeSummary
import app.ingre.android.core.TokenStore
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Seconds since 1970, swappable in tests. */
fun interface Clock {
    fun nowSeconds(): Double
}

/** The log in form. */
data class LoginForm(
    val email: String = "",
    val password: String = "",
    val showPassword: Boolean = false,
    val loggingIn: Boolean = false,
    val failed: Boolean = false,
    val validation: String? = null
)

/**
 * Sign-in and hearts (#195): the JWT from the login mutation in the token store (the Android
 * Keystore in the app), and the saved recipes read back with getSavedRecipes.
 */
@HiltViewModel
class AccountViewModel
@Inject
constructor(private val api: IngreApi, private val tokens: TokenStore, private val clock: Clock) : ViewModel() {
    private val _claims = MutableStateFlow<JwtClaims?>(null)
    val claims: StateFlow<JwtClaims?> = _claims.asStateFlow()

    private val _saved = MutableStateFlow<List<SavedRecipeSummary>>(emptyList())
    val saved: StateFlow<List<SavedRecipeSummary>> = _saved.asStateFlow()

    /** "Couldn't update your saved recipes. Try again." after a failed heart. */
    private val _saveError = MutableStateFlow("")
    val saveError: StateFlow<String> = _saveError.asStateFlow()

    private val _form = MutableStateFlow(LoginForm())
    val form: StateFlow<LoginForm> = _form.asStateFlow()

    init {
        restore()
    }

    val loggedIn: Boolean get() = claims.value != null
    val savedIds: Set<String> get() = saved.value.mapNotNull { it.libraryId }.toSet()

    /** The stored token, unless it has expired (then it is dropped, as on the web). */
    private fun restore() {
        val token = tokens.read() ?: return
        val claims = JwtClaims.decode(token)
        if (claims == null || claims.isExpired(clock.nowSeconds())) {
            tokens.write(null)
            return
        }
        _claims.value = claims
    }

    fun setEmail(email: String) = _form.update { it.copy(email = email) }

    fun setPassword(password: String) = _form.update { it.copy(password = password) }

    fun toggleShowPassword() = _form.update { it.copy(showPassword = !it.showPassword) }

    fun submitLogin() {
        viewModelScope.launch { login() }
    }

    suspend fun login() {
        val form = _form.value
        when {
            form.email.isBlank() -> _form.update { it.copy(validation = L10n.t("auth.enterEmail")) }

            form.password.isEmpty() -> _form.update { it.copy(validation = L10n.t("auth.enterPassword")) }

            else -> {
                _form.update { it.copy(validation = null, loggingIn = true, failed = false) }
                try {
                    val (token, _) = api.login(form.email, form.password)
                    val claims = JwtClaims.decode(token) ?: throw ApiException.NoData()
                    tokens.write(token)
                    _claims.value = claims
                    _form.update { it.copy(password = "", loggingIn = false) }
                    loadSaved()
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    _form.update { it.copy(loggingIn = false, failed = true) }
                }
            }
        }
    }

    /** Back to the form after "Couldn't log you in." */
    fun retryLogin() = _form.update { it.copy(failed = false) }

    fun logout() {
        tokens.write(null)
        _claims.value = null
        _saved.value = emptyList()
        _saveError.value = ""
    }

    suspend fun loadSaved() {
        if (!loggedIn) return
        try {
            _saved.value = api.savedRecipes()
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            // keep what we had; the hearts read as before
        }
    }

    fun refreshSaved() {
        viewModelScope.launch { loadSaved() }
    }

    fun isSaved(libraryId: String): Boolean = libraryId in savedIds

    fun toggleSaved(libraryId: String, input: RecipeInputValue) {
        viewModelScope.launch { toggle(libraryId, input) }
    }

    /** The heart: saves the recipe (original plus changes), or removes every saved copy of it. */
    suspend fun toggle(libraryId: String, input: RecipeInputValue) {
        _saveError.value = ""
        try {
            if (isSaved(libraryId)) {
                for (recipe in saved.value.filter { it.libraryId == libraryId }) {
                    api.removeRecipe(recipe.id)
                    _saved.update { list -> list.filterNot { it.id == recipe.id } }
                }
            } else {
                val added = api.saveRecipe(input)
                _saved.update { it + added }
            }
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            _saveError.value = L10n.t("saved.failed")
        }
    }
}
