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
import com.leoelicos.ingre.data.RecipeDetail
import com.leoelicos.ingre.data.RecipeRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun RecipeDetailScreen(token: String, recipeId: String, onBack: () -> Unit) {
    var detail by remember { mutableStateOf<RecipeDetail?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val repo = remember { RecipeRepository() }

    LaunchedEffect(recipeId) {
        try {
            detail = withContext(Dispatchers.IO) { repo.getRecipe(token, recipeId) }
        } catch (e: Exception) {
            error = e.message
        }
    }

    when {
        error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(error!!)
        }
        detail == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        else -> LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
            item {
                Text(detail!!.name, fontSize = 28.sp)
                Text("${detail!!.portions} portions", fontSize = 14.sp, modifier = Modifier.padding(bottom = 16.dp))
                Text("Ingredients", fontSize = 20.sp, modifier = Modifier.padding(bottom = 8.dp))
            }
            items(detail!!.ingredients) { ing ->
                Text("${ing.quantity} ${ing.measure} ${ing.name}", modifier = Modifier.padding(vertical = 4.dp))
            }
            if (!detail!!.instructions.isNullOrBlank()) {
                item {
                    Text("Instructions", fontSize = 20.sp, modifier = Modifier.padding(top = 16.dp, bottom = 8.dp))
                    Text(detail!!.instructions!!)
                }
            }
            item {
                androidx.compose.material3.Button(onClick = onBack, modifier = Modifier.padding(top = 24.dp)) {
                    Text("Back")
                }
            }
        }
    }
}
