package com.leoelicos.ingre.ui

import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.CatalogueRecipe
import com.leoelicos.ingre.data.SavedRecipesStore
import com.leoelicos.ingre.data.ShoppingListStore
import com.leoelicos.ingre.data.loadCatalogueRecipes
import org.json.JSONArray

private fun loadIngredients(context: Context): List<String> {
    val text = context.assets.open("ingredients.json").bufferedReader().use { it.readText() }
    val arr = JSONArray(text)
    return List(arr.length()) { i -> arr.getJSONObject(i).getString("name") }.sorted()
}

@Composable
fun ExploreScreen() {
    val context = LocalContext.current
    var ingredients by remember { mutableStateOf<List<String>>(emptyList()) }
    var recipes by remember { mutableStateOf<List<CatalogueRecipe>>(emptyList()) }
    var query by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        ingredients = loadIngredients(context)
        recipes = loadCatalogueRecipes(context)
    }

    val q = query.trim()
    val filteredRecipes = remember(recipes, q) {
        if (q.isEmpty()) recipes else recipes.filter { it.name.contains(q, ignoreCase = true) }
    }
    val filteredIngredients = remember(ingredients, q) {
        if (q.isEmpty()) ingredients else ingredients.filter { it.contains(q, ignoreCase = true) }
    }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Explore", fontSize = 24.sp)
        if (message != null) {
            Text(message!!, fontSize = 14.sp, modifier = Modifier.padding(vertical = 4.dp))
        }
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("Search") },
            modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
            singleLine = true
        )
        LazyColumn {
            item { Text("Recipes — tap to save", fontSize = 18.sp, modifier = Modifier.padding(vertical = 8.dp)) }
            items(filteredRecipes) { recipe ->
                Text(
                    recipe.name,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            SavedRecipesStore.save(recipe.id)
                            message = "Saved ${recipe.name}"
                        }
                        .padding(vertical = 10.dp),
                    fontSize = 16.sp
                )
            }
            item { Text("Ingredients — tap to add", fontSize = 18.sp, modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)) }
            items(filteredIngredients) { name ->
                Text(
                    name,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            ShoppingListStore.add(name)
                            message = "Added $name"
                        }
                        .padding(vertical = 10.dp),
                    fontSize = 16.sp
                )
            }
        }
    }
}
