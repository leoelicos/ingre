package app.ingre

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val sampleIngredients = listOf(
    CatalogIngredient("garlic", "garlic", "fruit & veg", 60.0, mapOf("clove" to 6.0)),
    CatalogIngredient("onion", "onion", "fruit & veg"),
    CatalogIngredient("spaghetti", "spaghetti", "pantry")
)

private val sampleRecipes = listOf(
    CatalogRecipe(
        "spaghetti-bolognese",
        "Spaghetti bolognese",
        1,
        listOf(
            CatalogLine("spaghetti", 100.0, "g"),
            CatalogLine("onion", 0.25, "whole"),
            CatalogLine("garlic", 0.5, "clove")
        )
    ),
    CatalogRecipe(
        "dahl",
        "Red lentil dahl",
        1,
        listOf(CatalogLine("onion", 0.5, "whole"), CatalogLine("garlic", 1.0, "clove"))
    )
)

private val sampleNames = sampleIngredients.associate { it.id to it.name }
private val sampleCategories = sampleIngredients.associate { it.id to it.category }

/** The phone page. Sections stay on the page. Nothing opens a sheet. */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { PhoneScreen() }
    }
}

@androidx.compose.runtime.Composable
fun PhoneScreen() {
    var query by remember { mutableStateOf("") }
    var memory by remember { mutableStateOf(ListMemory()) }
    var open by remember { mutableStateOf(exploreStartsOpen(0, false)) }
    var opened by remember { mutableStateOf(setOf<String>()) }
    var extra by remember { mutableStateOf("") }
    var extras by remember { mutableStateOf(listOf<String>()) }
    val copies = recipeCopies(memory)
    Column(Modifier.padding(16.dp).verticalScroll(rememberScrollState())) {
        Row(Modifier.fillMaxWidth().heightIn(min = 48.dp)) {
            Text("Explore", fontSize = 22.sp, modifier = Modifier.weight(1f).padding(top = 10.dp))
            Button(onClick = { open = !open }, modifier = Modifier.heightIn(min = 48.dp)) {
                Text(if (open) "Hide Explore" else "Show Explore")
            }
        }
        if (open) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                label = { Text("Search ingredients and recipes") },
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
            )
            when (val results = explore(query, sampleIngredients, sampleRecipes)) {
                is ExploreView.Browse -> RecipeHits(results.recipes) { memory = pickRecipe(memory, toStored(it, sampleNames)) }
                is ExploreView.Matches -> {
                    results.ingredients.forEach { Text(capitaliseFirst(it.name), modifier = Modifier.heightIn(min = 48.dp)) }
                    RecipeHits(results.recipes) { memory = pickRecipe(memory, toStored(it, sampleNames)) }
                }
                is ExploreView.None -> {
                    Text("No matches")
                    results.ingredients.forEach { Text(capitaliseFirst(it.name), modifier = Modifier.heightIn(min = 48.dp)) }
                    RecipeHits(results.recipes) { memory = pickRecipe(memory, toStored(it, sampleNames)) }
                }
            }
        }
        Text("Ingredients", fontSize = 22.sp, modifier = Modifier.padding(top = 16.dp))
        shopLines(copies, sampleNames, sampleCategories).forEach { line ->
            Text(
                "${capitaliseFirst(line.name)} ${formatQuantity(line.quantity, line.measure)}",
                modifier = Modifier.heightIn(min = 48.dp).padding(top = 8.dp)
            )
        }
        Text("Recipes", fontSize = 22.sp, modifier = Modifier.padding(top = 16.dp))
        copies.forEach { recipe ->
            Button(
                onClick = { opened = if (recipe.id in opened) opened - recipe.id else opened + recipe.id },
                modifier = Modifier.heightIn(min = 48.dp)
            ) { Text(recipe.name) }
            if (recipe.id in opened) {
                recipe.lines.filter { it.quantity > 0 }.forEach { line ->
                    Text("${capitaliseFirst(line.name)} ${formatQuantity(line.quantity, line.measure)}")
                }
            } else {
                Row {
                    closedChips(recipe.lines.filter { it.quantity > 0 }.map { it.name }).forEach { chip ->
                        Text(chip.name, modifier = Modifier.padding(end = 8.dp).heightIn(min = 48.dp))
                    }
                }
            }
        }
        Text("Extra", fontSize = 22.sp, modifier = Modifier.padding(top = 8.dp))
        OutlinedTextField(
            value = extra,
            onValueChange = { extra = it },
            label = { Text("Add an extra") },
            modifier = Modifier.fillMaxWidth()
        )
        Button(
            onClick = {
                val name = extra.trim()
                if (name.isNotEmpty()) {
                    extras = extras + name
                    extra = ""
                }
            },
            modifier = Modifier.heightIn(min = 48.dp)
        ) { Text("Add") }
        extras.forEach { Text(it, modifier = Modifier.heightIn(min = 48.dp)) }
    }
}

@androidx.compose.runtime.Composable
private fun RecipeHits(recipes: List<CatalogRecipe>, onPick: (CatalogRecipe) -> Unit) {
    recipes.forEach { recipe ->
        Button(onClick = { onPick(recipe) }, modifier = Modifier.heightIn(min = 48.dp)) {
            Text(recipe.name)
        }
    }
}
