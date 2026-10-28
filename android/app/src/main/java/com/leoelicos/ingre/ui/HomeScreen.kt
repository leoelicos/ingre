package com.leoelicos.ingre.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.SavedRecipesStore
import com.leoelicos.ingre.data.loadCatalogueRecipes

@Composable
fun HomeScreen(onOpenRecipe: (String) -> Unit) {
    val context = LocalContext.current
    val catalogue = remember { loadCatalogueRecipes(context) }
    val savedIds by SavedRecipesStore.ids.collectAsState()
    val saved = catalogue.filter { it.id in savedIds }

    if (saved.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No saved recipes yet.\nSign in is optional. Tap recipes in Explore to save them.", fontSize = 16.sp)
        }
    } else {
        LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
            item { Text("Saved recipes", fontSize = 24.sp, modifier = Modifier.padding(bottom = 12.dp)) }
            items(saved) { recipe ->
                Text(
                    recipe.name,
                    modifier = Modifier
                        .fillMaxSize()
                        .clickable { onOpenRecipe(recipe.id) }
                        .padding(vertical = 12.dp),
                    fontSize = 16.sp
                )
            }
        }
    }
}
