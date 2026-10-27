package app.ingre.android

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import app.ingre.android.account.AccountViewModel
import app.ingre.android.core.CheckoutOpener
import app.ingre.android.core.CheckoutReturn
import app.ingre.android.explore.ExploreViewModel
import app.ingre.android.ingredients.IngredientsViewModel
import app.ingre.android.platform.AndroidStrings
import app.ingre.android.recipes.RecipesViewModel
import app.ingre.android.ui.AppModels
import app.ingre.android.ui.IngreApp
import app.ingre.android.ui.IngreTheme
import app.ingre.android.upgrade.CustomTabCheckoutOpener
import app.ingre.android.upgrade.UpgradeViewModel
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

/**
 * The one activity. singleTask, so Stripe's `ingre://upgrade/success|cancel` comes back here
 * (onNewIntent) and finishes the checkout that is waiting in the Custom Tab opener.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var opener: CheckoutOpener

    private val explore: ExploreViewModel by viewModels()
    private val recipes: RecipesViewModel by viewModels()
    private val ingredients: IngredientsViewModel by viewModels()
    private val account: AccountViewModel by viewModels()
    private val upgrade: UpgradeViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        AndroidStrings.install(this)
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val models = AppModels(explore, recipes, ingredients, account, upgrade)
        setContent { IngreTheme { IngreApp(models) } }
        handle(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handle(intent)
    }

    override fun onPause() {
        super.onPause()
        (opener as? CustomTabCheckoutOpener)?.onPause()
    }

    override fun onResume() {
        super.onResume()
        (opener as? CustomTabCheckoutOpener)?.onResume()
    }

    private fun handle(intent: Intent?) {
        val uri = intent?.data ?: return
        val result = CheckoutReturn.fromUrl(uri.scheme, uri.host, uri.path) ?: return
        (opener as? CustomTabCheckoutOpener)?.returned(result)
    }
}
