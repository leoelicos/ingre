package app.ingre.android.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import app.ingre.android.account.AccountViewModel
import app.ingre.android.core.L10n
import app.ingre.android.explore.ExploreViewModel
import app.ingre.android.ingredients.IngredientsViewModel
import app.ingre.android.recipes.RecipesViewModel
import app.ingre.android.upgrade.MockCheckoutOpener
import app.ingre.android.upgrade.UpgradeViewModel

enum class Page { Account, Upgrade }

/** The ViewModels the pages draw; all scoped to the one activity. */
class AppModels(
    val explore: ExploreViewModel,
    val recipes: RecipesViewModel,
    val ingredients: IngredientsViewModel,
    val account: AccountViewModel,
    val upgrade: UpgradeViewModel
)

/**
 * The app (#195): the list page, with Account and Upgrade pushed on top as full pages (never a
 * sheet or a dialog). Back pops them.
 */
@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun IngreApp(models: AppModels, stack: MutableList<Page> = remember { mutableStateListOf() }) {
    val colors = LocalIngreColors.current
    BackHandler(enabled = stack.isNotEmpty()) { stack.removeAt(stack.lastIndex) }
    Box(
        Modifier
            .fillMaxSize()
            .background(colors.background)
            .semantics { testTagsAsResourceId = true }
            .safeDrawingPadding()
    ) {
        when (stack.lastOrNull()) {
            null -> ListScreen(models) { stack.add(Page.Account) }

            Page.Account -> AccountScreen(
                models.account,
                back = { stack.removeAt(stack.lastIndex) },
                showSaved = {
                    models.explore.showSaved()
                    stack.clear()
                },
                upgrade = { stack.add(Page.Upgrade) }
            )

            Page.Upgrade -> UpgradeScreen(models.upgrade, models.account) { stack.removeAt(stack.lastIndex) }
        }
    }
}

/** The phone list page: the header, then Explore, Recipes, Ingredients and Extra in one scrolling column. */
@Composable
fun ListScreen(models: AppModels, openAccount: () -> Unit) {
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag("list.scroll"),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        HeaderBar(models, openAccount)
        ExploreSection(models.explore, models.account)
        RecipesSection(models.recipes, models.account)
        IngredientsSection(models.ingredients)
        ExtraSection(models.ingredients)
    }
}

@Composable
private fun HeaderBar(models: AppModels, openAccount: () -> Unit) {
    val colors = LocalIngreColors.current
    val claims by models.account.claims.collectAsState()
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                L10n.t("app.name"),
                Modifier
                    .weight(1f)
                    .semantics { heading() },
                color = colors.primary,
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold
            )
            Box(
                Modifier
                    .testTag("account.open")
                    .clickable(role = Role.Button, onClick = openAccount)
                    .clearAndSetSemantics {
                        contentDescription = L10n.t("account.label")
                        claims?.let {
                            stateDescription = L10n.t("account.signedIn", mapOf("name" to it.data.firstName))
                        }
                    }
                    .touchTarget(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    if (claims !=
                        null
                    ) {
                        "●"
                    } else {
                        "○"
                    },
                    color = colors.text,
                    style = MaterialTheme.typography.titleLarge
                )
            }
        }
        SearchField(models.explore)
    }
}

/** Search filters Explore, and opens it. */
@Composable
private fun SearchField(explore: ExploreViewModel) {
    val colors = LocalIngreColors.current
    val query by explore.query.collectAsState()
    Row(
        Modifier
            .fillMaxWidth()
            .touchTarget()
            .surface(Depth.Recessed, colors, RoundedCornerShape(Dimens.controlRadius))
            .padding(horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("⌕", Modifier.clearAndSetSemantics { }, color = colors.secondary)
        Box(Modifier.weight(1f)) {
            if (query.isEmpty()) {
                Text(
                    L10n.t("search.placeholder"),
                    Modifier.clearAndSetSemantics {
                    },
                    color = colors.secondary
                )
            }
            BasicTextField(
                query,
                explore::setQuery,
                Modifier
                    .fillMaxWidth()
                    .testTag("search.field")
                    .semantics { contentDescription = L10n.t("search.label") },
                textStyle = TextStyle(color = colors.text, fontSize = MaterialTheme.typography.bodyLarge.fontSize),
                cursorBrush = SolidColor(colors.text),
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.None,
                    autoCorrectEnabled = false,
                    imeAction = ImeAction.Search
                )
            )
        }
        if (query.isNotEmpty()) {
            Box(
                Modifier
                    .testTag("search.clear")
                    .clickable(role = Role.Button) { explore.setQuery("") }
                    .clearAndSetSemantics { contentDescription = L10n.t("search.clear") }
                    .touchTarget(),
                contentAlignment = Alignment.Center
            ) { Text("✕", color = colors.text) }
        }
    }
}

/** A pushed page's top bar: back and the title. */
@Composable
private fun PageBar(title: String, back: () -> Unit) {
    val colors = LocalIngreColors.current
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Box(
            Modifier
                .testTag("page.back")
                .clickable(role = Role.Button, onClick = back)
                .clearAndSetSemantics { contentDescription = L10n.tOr("page.back", "Back") }
                .touchTarget(),
            contentAlignment = Alignment.Center
        ) { Text("←", color = colors.text, style = MaterialTheme.typography.titleLarge) }
        Text(
            title,
            Modifier.semantics {
                heading()
            },
            color = colors.text,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun Page(tag: String, content: @Composable () -> Unit) {
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag(tag),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) { content() }
}

/** Account (#195): signed out it is the Log in form (as the web's /login); signed in it offers Saved, Upgrade and Log out. */
@Composable
fun AccountScreen(account: AccountViewModel, back: () -> Unit, showSaved: () -> Unit, upgrade: () -> Unit) {
    val colors = LocalIngreColors.current
    val claims by account.claims.collectAsState()
    Page("account.page") {
        PageBar(if (claims != null) L10n.t("account.label") else L10n.t("auth.logIn"), back)
        val signedIn = claims
        if (signedIn != null) {
            Text(
                L10n.t("account.signedIn", mapOf("name" to signedIn.data.firstName)),
                Modifier.testTag("account.signedIn"),
                color = colors.text,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            InkButton(L10n.t("account.saved"), "account.saved", onClick = showSaved)
            InkButton(L10n.t("account.upgrade"), "account.upgrade", onClick = upgrade)
            InkButton(L10n.t("account.logOut"), "account.logOut") { account.logout() }
        } else {
            Text(L10n.t("account.signedOut"), color = colors.secondary)
            LoginForm(account)
            InkButton(L10n.t("account.upgrade"), "account.upgrade", onClick = upgrade)
        }
    }
}

/** The web's Log in form: email, password with Show/Hide, its two messages, Loading, and "Couldn't log you in." on failure. */
@Composable
private fun LoginForm(account: AccountViewModel) {
    val colors = LocalIngreColors.current
    val form by account.form.collectAsState()
    Column(
        Modifier
            .fillMaxWidth()
            .surface(Depth.Raised, colors)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (form.failed) {
            StatusText(L10n.t("auth.loginFailed"), "auth.failed")
            InkButton(L10n.t("auth.logIn"), "auth.retry") { account.retryLogin() }
            return@Column
        }
        Labelled(L10n.t("auth.email")) {
            FormField(form.email, account::setEmail, L10n.t("auth.email"), "auth.email", KeyboardType.Email)
        }
        Labelled(L10n.t("auth.password")) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.weight(1f)) {
                    FormField(
                        form.password,
                        account::setPassword,
                        L10n.t("auth.password"),
                        "auth.password",
                        KeyboardType.Password,
                        !form.showPassword
                    )
                }
                Box(
                    Modifier
                        .testTag("auth.showPassword")
                        .clickable(role = Role.Button) { account.toggleShowPassword() }
                        .clearAndSetSemantics {
                            contentDescription =
                                L10n.t(if (form.showPassword) "auth.hidePassword" else "auth.showPassword")
                        }
                        .touchTarget()
                        .padding(horizontal = 8.dp),
                    contentAlignment = Alignment.Center
                ) { Text(L10n.t(if (form.showPassword) "auth.hide" else "auth.show"), color = colors.text) }
            }
        }
        form.validation?.let { StatusText(it, "auth.validation") }
        if (form.loggingIn) StatusText(L10n.t("auth.wakingServer"), "auth.loading")
        InkButton(
            if (form.loggingIn) L10n.t("auth.loading") else L10n.t("auth.logIn"),
            "auth.submit",
            enabled = !form.loggingIn
        ) {
            account.submitLogin()
        }
    }
}

@Composable
private fun FormField(
    value: String,
    onChange: (String) -> Unit,
    label: String,
    tag: String,
    type: KeyboardType,
    hidden: Boolean = false
) {
    val colors = LocalIngreColors.current
    BasicTextField(
        value,
        onChange,
        Modifier
            .fillMaxWidth()
            .touchTarget()
            .surface(Depth.Recessed, colors, RoundedCornerShape(Dimens.controlRadius))
            .padding(horizontal = 12.dp, vertical = 14.dp)
            .testTag(tag)
            .semantics { contentDescription = label },
        textStyle = TextStyle(color = colors.text, fontSize = MaterialTheme.typography.bodyLarge.fontSize),
        cursorBrush = SolidColor(colors.text),
        singleLine = true,
        visualTransformation = if (hidden) PasswordVisualTransformation() else VisualTransformation.None,
        keyboardOptions = KeyboardOptions(
            keyboardType = type,
            capitalization = KeyboardCapitalization.None,
            autoCorrectEnabled = false
        )
    )
}

/**
 * Upgrade (#195): the web's /upgrade. Signed out: "You need to be logged in…". Pro: "You are
 * pro". Otherwise why to upgrade and "Checkout with Stripe", one attempt at a time.
 */
@Composable
fun UpgradeScreen(upgrade: UpgradeViewModel, account: AccountViewModel, back: () -> Unit) {
    val colors = LocalIngreColors.current
    val ui by upgrade.ui.collectAsState()
    val claims by account.claims.collectAsState()
    LaunchedEffect(claims) { if (claims != null) upgrade.loadUser() }
    Page("upgrade.page") {
        PageBar(L10n.t("upgrade.title"), back)
        when {
            ui.succeeded -> {
                Text(
                    L10n.t("success.title"),
                    color = colors.text,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(L10n.t("success.thanks"), Modifier.testTag("upgrade.success"), color = colors.text)
            }

            claims == null -> Text(
                L10n.t("notLoggedIn.message"),
                Modifier.testTag("upgrade.notLoggedIn"),
                color = colors.text
            )

            ui.pro -> Text(
                L10n.t("upgrade.pro"),
                Modifier.testTag("upgrade.pro"),
                color = colors.text,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            else -> {
                Text(
                    L10n.t("upgrade.why"),
                    Modifier.semantics {
                        heading()
                    },
                    color = colors.text,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    for (key in listOf(
                        "upgrade.instructions",
                        "upgrade.price",
                        "upgrade.secure"
                    )) {
                        Text("• ${L10n.t(key)}", color = colors.text)
                    }
                }
                InkButton(L10n.t("upgrade.checkout"), "upgrade.checkout") { upgrade.startCheckout() }
                if (ui.starting) StatusText(L10n.t("upgrade.starting"), "upgrade.starting")
                if (ui.failed) StatusText(L10n.t("upgrade.failed"), "upgrade.failed")
                if (ui.cancelled) StatusText(L10n.t("upgrade.cancelled"), "upgrade.cancelled")
                (upgrade.opener as? MockCheckoutOpener)?.let { mock ->
                    // UI tests only: the checkout page the app would have opened, and how many times
                    val url by mock.lastUrl.collectAsState()
                    val opens by mock.opens.collectAsState()
                    url?.let {
                        Text(
                            it,
                            Modifier.testTag("upgrade.mockCheckoutURL"),
                            color = colors.secondary,
                            style = MaterialTheme.typography.labelSmall
                        )
                        Text(
                            "$opens",
                            Modifier.testTag("upgrade.mockCheckoutCount"),
                            color = colors.secondary,
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                }
            }
        }
    }
}
