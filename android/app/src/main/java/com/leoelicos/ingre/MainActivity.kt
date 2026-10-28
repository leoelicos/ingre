package com.leoelicos.ingre

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.leoelicos.ingre.data.TokenStore
import com.leoelicos.ingre.ui.ExploreScreen
import com.leoelicos.ingre.ui.HomeScreen
import com.leoelicos.ingre.ui.IngreTheme
import com.leoelicos.ingre.ui.LoginScreen
import com.leoelicos.ingre.ui.RecipeDetailScreen
import com.leoelicos.ingre.ui.ShoppingListScreen
import com.leoelicos.ingre.ui.SignupScreen
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val store = TokenStore(this)
        setContent {
            IngreTheme {
                val token by store.token.collectAsState(initial = null)
                val scope = rememberCoroutineScope()
                var showSignup by remember { mutableStateOf(false) }
                var openRecipeId by remember { mutableStateOf<String?>(null) }
                var tab by remember { mutableStateOf(0) }

                when {
                    token == null && showSignup -> SignupScreen(
                        onSignup = { t -> scope.launch { store.save(t) } },
                        onBack = { showSignup = false }
                    )
                    token == null -> LoginScreen(
                        onLogin = { t -> scope.launch { store.save(t) } },
                        onSignup = { showSignup = true }
                    )
                    openRecipeId != null -> RecipeDetailScreen(
                        token = token!!,
                        recipeId = openRecipeId!!,
                        onBack = { openRecipeId = null }
                    )
                    else -> Scaffold(
                        bottomBar = {
                            NavigationBar {
                                NavigationBarItem(
                                    selected = tab == 0,
                                    onClick = { tab = 0 },
                                    label = { Text("Recipes") },
                                    icon = {}
                                )
                                NavigationBarItem(
                                    selected = tab == 1,
                                    onClick = { tab = 1 },
                                    label = { Text("List") },
                                    icon = {}
                                )
                                NavigationBarItem(
                                    selected = tab == 2,
                                    onClick = { tab = 2 },
                                    label = { Text("Explore") },
                                    icon = {}
                                )
                            }
                        }
                    ) { padding ->
                        when (tab) {
                            0 -> HomeScreen(
                                token = token!!,
                                onOpenRecipe = { openRecipeId = it },
                                onLogout = { scope.launch { store.clear() } }
                            )
                            1 -> ShoppingListScreen(token = token!!)
                            else -> ExploreScreen()
                        }
                    }
                }
            }
        }
    }
}
