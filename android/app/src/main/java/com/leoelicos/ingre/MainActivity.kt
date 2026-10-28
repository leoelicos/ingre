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
import androidx.compose.runtime.setValue
import com.leoelicos.ingre.data.TokenStore
import com.leoelicos.ingre.ui.AccountScreen
import com.leoelicos.ingre.ui.ExploreScreen
import com.leoelicos.ingre.ui.HomeScreen
import com.leoelicos.ingre.ui.IngreTheme
import com.leoelicos.ingre.ui.RecipeDetailScreen
import com.leoelicos.ingre.ui.ShoppingListScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val store = TokenStore(this)
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
                                NavigationBarItem(selected = tab == 3, onClick = { tab = 3 }, label = { Text("Account") }, icon = {})
                            }
                        }
                    ) { _ ->
                        when (tab) {
                            0 -> HomeScreen(onOpenRecipe = { openRecipeId = it })
                            1 -> ShoppingListScreen()
                            2 -> ExploreScreen(token = token)
                            else -> AccountScreen(token = token, store = store)
                        }
                    }
                }
            }
        }
    }
}
