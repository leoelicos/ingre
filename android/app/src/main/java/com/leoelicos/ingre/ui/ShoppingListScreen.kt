package com.leoelicos.ingre.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.IngredientItem
import com.leoelicos.ingre.data.RecipeRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun ShoppingListScreen(token: String) {
    var items by remember { mutableStateOf<List<IngredientItem>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val repo = remember { RecipeRepository() }

    LaunchedEffect(token) {
        try {
            val recipes = withContext(Dispatchers.IO) { repo.getSavedRecipes(token) }
            val all = mutableMapOf<String, IngredientItem>()
            for (summary in recipes) {
                val detail = withContext(Dispatchers.IO) { repo.getRecipe(token, summary.id) }
                for (ing in detail.ingredients) {
                    val key = "${ing.name}|${ing.measure}"
                    val existing = all[key]
                    all[key] = if (existing == null) ing else existing.copy(quantity = existing.quantity + ing.quantity)
                }
            }
            items = all.values.sortedBy { it.name }
        } catch (e: Exception) {
            error = e.message
        }
    }

    when {
        error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(error!!)
        }
        items == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        items!!.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No ingredients", fontSize = 18.sp)
        }
        else -> LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
            item { Text("Shopping list", fontSize = 24.sp, modifier = Modifier.padding(bottom = 12.dp)) }
            items(items!!) { ing ->
                Text("${ing.quantity} ${ing.measure} ${ing.name}", modifier = Modifier.padding(vertical = 6.dp))
            }
        }
    }
}
