package com.leoelicos.ingre.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.loadCatalogueRecipes

@Composable
fun RecipeDetailScreen(recipeId: String, onBack: () -> Unit) {
    val context = LocalContext.current
    val recipe = remember {
        loadCatalogueRecipes(context).find { it.id == recipeId }
    }

    if (recipe == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Recipe not found")
        }
        return
    }

    LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Text(recipe.name, fontSize = 28.sp)
            Text("${recipe.portions} portions", fontSize = 14.sp, modifier = Modifier.padding(bottom = 16.dp))
            Text("Ingredients", fontSize = 20.sp, modifier = Modifier.padding(bottom = 8.dp))
        }
        items(recipe.ingredients) { ing ->
            Text("${ing.quantity} ${ing.measure} ${ing.name}", modifier = Modifier.padding(vertical = 4.dp))
        }
        if (recipe.instructions.isNotBlank()) {
            item {
                Text("Instructions", fontSize = 20.sp, modifier = Modifier.padding(top = 16.dp, bottom = 8.dp))
                Text(recipe.instructions)
            }
        }
        item {
            Button(onClick = onBack, modifier = Modifier.padding(top = 24.dp)) { Text("Back") }
        }
    }
}
