package com.leoelicos.ingre

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.lifecycleScope
import com.leoelicos.ingre.billing.Flags
import com.leoelicos.ingre.billing.GraphQLPurchaseVerifier
import com.leoelicos.ingre.billing.PlayBillingGateway
import com.leoelicos.ingre.billing.SubscriptionManager
import com.leoelicos.ingre.billing.userIdOf
import com.leoelicos.ingre.data.TokenStore
import kotlinx.coroutines.launch
import com.leoelicos.ingre.ui.AccountScreen
import com.leoelicos.ingre.ui.ExploreScreen
import com.leoelicos.ingre.ui.ExtraScreen
import com.leoelicos.ingre.ui.UpgradeScreen
import com.leoelicos.ingre.ui.HomeScreen
import com.leoelicos.ingre.ui.IngreTheme
import com.leoelicos.ingre.ui.RecipeDetailScreen
import com.leoelicos.ingre.ui.ShoppingListScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        val store = TokenStore(this)
        // #314: Google Play subscriptions, only with the `tiers` flag (off by default)
        var signedIn: String? = null
        val plans = if (Flags.tiers) {
            val gateway = PlayBillingGateway(this) { this }
            SubscriptionManager(
                gateway = gateway,
                verifier = GraphQLPurchaseVerifier(token = { signedIn }),
                accountId = { userIdOf(signedIn) }
            ).also { manager ->
                lifecycleScope.launch { gateway.updates.collect { manager.onUpdate(it) } }
            }
        } else {
            null
        }
        lifecycleScope.launch { store.token.collect { signedIn = it } }
        setContent {
            IngreTheme {
                val token by store.token.collectAsState(initial = null)
                var tab by remember { mutableStateOf(0) }
                var openRecipeId by remember { mutableStateOf<String?>(null) }

                if (openRecipeId != null) {
                    RecipeDetailScreen(
                        recipeId = openRecipeId!!,
                        onBack = { openRecipeId = null }
                    )
                } else {
                    Scaffold(
                        bottomBar = {
                            NavigationBar {
                                NavigationBarItem(selected = tab == 0, onClick = { tab = 0 }, label = { Text("Recipes") }, icon = {})
                                NavigationBarItem(selected = tab == 1, onClick = { tab = 1 }, label = { Text("List") }, icon = {})
                                NavigationBarItem(selected = tab == 2, onClick = { tab = 2 }, label = { Text("Explore") }, icon = {})
                                NavigationBarItem(selected = tab == 3, onClick = { tab = 3 }, label = { Text("Extra") }, icon = {})
                                NavigationBarItem(selected = tab == 4, onClick = { tab = 4 }, label = { Text("Account") }, icon = {})
                            }
                        }
                    ) { _ ->
                        when (tab) {
                            0 -> HomeScreen(onOpenRecipe = { openRecipeId = it })
                            1 -> ShoppingListScreen()
                            2 -> ExploreScreen(token = token)
                            3 -> ExtraScreen()
                            4 -> AccountScreen(token = token, store = store, plans = plans)
                            else -> UpgradeScreen()
                        }
                    }
                }
            }
        }
    }
}
