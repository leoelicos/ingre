package com.leoelicos.ingre.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
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
import com.leoelicos.ingre.data.RecipeRepository
import com.leoelicos.ingre.data.RecipeSummary
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun HomeScreen(token: String, onOpenRecipe: (String) -> Unit, onLogout: () -> Unit) {
    var recipes by remember { mutableStateOf<List<RecipeSummary>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val repo = remember { RecipeRepository() }

    LaunchedEffect(token) {
        try {
            recipes = withContext(Dispatchers.IO) { repo.getSavedRecipes(token) }
        } catch (e: Exception) {
            error = e.message
        }
    }

    Box(Modifier.fillMaxSize()) {
        when {
            error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(error!!, color = androidx.compose.material3.MaterialTheme.colorScheme.error)
            }
            recipes == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            recipes!!.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No saved recipes", fontSize = 18.sp)
            }
            else -> LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                item {
                    Text("Saved recipes", fontSize = 24.sp, modifier = Modifier.padding(bottom = 12.dp))
                }
                items(recipes!!) { recipe ->
                    Text(
                        "${recipe.name} (${recipe.portions})",
                        modifier = Modifier
                            .fillMaxSize()
                            .clickable { onOpenRecipe(recipe.id) }
                            .padding(vertical = 12.dp),
                        fontSize = 16.sp
                    )
                }
            }
        }
        Button(
            onClick = onLogout,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
        ) { Text("Log out") }
    }
}
