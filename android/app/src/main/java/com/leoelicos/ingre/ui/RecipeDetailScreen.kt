package com.leoelicos.ingre.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.CustomisationStore
import com.leoelicos.ingre.data.loadCatalogueRecipes
import org.json.JSONArray

private fun allergensFor(context: android.content.Context, names: List<String>): List<String> {
    val text = context.assets.open("ingredients.json").bufferedReader().use { it.readText() }
    val arr = JSONArray(text)
    val found = mutableSetOf<String>()
    for (i in 0 until arr.length()) {
        val o = arr.getJSONObject(i)
        if (names.any { it.equals(o.getString("name"), ignoreCase = true) }) {
            val allergens = o.optJSONArray("allergens") ?: continue
            for (j in 0 until allergens.length()) found.add(allergens.getString(j))
        }
    }
    return found.sorted()
}

@Composable
fun RecipeDetailScreen(recipeId: String, onBack: () -> Unit) {
    val context = LocalContext.current
    val recipe = remember { loadCatalogueRecipes(context).find { it.id == recipeId } }
    val customisations by CustomisationStore.all.collectAsState()
    val custom = customisations[recipeId]
    var plusName by remember { mutableStateOf("") }

    if (recipe == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Recipe not found") }
        return
    }

    val portions = custom?.portions ?: recipe.portions
    val allergens = remember(recipe) { allergensFor(context, recipe.ingredients.map { it.name }) }

    LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Text(recipe.name, fontSize = 28.sp)
            Text("$portions portions", fontSize = 14.sp, modifier = Modifier.padding(bottom = 8.dp))
            Button(onClick = { CustomisationStore.setPortions(recipeId, portions + 1) }) { Text("Portions +") }
        }
        if (allergens.isNotEmpty()) {
            item { Text("Contains: ${allergens.joinToString(", ")}", modifier = Modifier.padding(vertical = 8.dp)) }
        }
        item { Text("Ingredients", fontSize = 20.sp, modifier = Modifier.padding(top = 12.dp, bottom = 8.dp)) }
        items(recipe.ingredients.filter { ing -> custom?.removed?.none { it.equals(ing.name, ignoreCase = true) } != false }) { ing ->
            Text("${ing.quantity} ${ing.measure} ${ing.name}", modifier = Modifier.padding(vertical = 4.dp))
        }
        custom?.added?.forEach { name ->
            item { Text("+ $name (added)", modifier = Modifier.padding(vertical = 4.dp)) }
        }
        item {
            Text("Add to this recipe", fontSize = 18.sp, modifier = Modifier.padding(top = 16.dp))
            OutlinedTextField(plusName, { plusName = it }, label = { Text("Ingredient") }, modifier = Modifier.fillMaxSize(), singleLine = true)
            Button(
                onClick = {
                    if (plusName.isNotBlank()) {
                        CustomisationStore.addIngredient(recipeId, plusName.trim())
                        plusName = ""
                    }
                },
                enabled = plusName.isNotBlank()
            ) { Text("Add") }
        }
        if (recipe.instructions.isNotBlank()) {
            item {
                Text("Method", fontSize = 20.sp, modifier = Modifier.padding(top = 16.dp, bottom = 8.dp))
                Text(recipe.instructions)
            }
        }
        item {
            Button(onClick = { CustomisationStore.reset(recipeId) }, modifier = Modifier.padding(top = 16.dp)) { Text("Reset recipe") }
            Button(onClick = onBack, modifier = Modifier.padding(top = 8.dp)) { Text("Back") }
        }
    }
}
