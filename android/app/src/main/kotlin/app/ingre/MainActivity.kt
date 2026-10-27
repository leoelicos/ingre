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

/** The phone page. Sections stay on the page. Nothing opens a sheet. */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val ingredients = parseIngredients(readAsset("ingredients.json"))
        val recipes = parseRecipes(readAsset("recipes.json"))
        setContent { PhoneScreen(ingredients, recipes) }
    }

    private fun readAsset(name: String): String =
        runCatching { assets.open(name).bufferedReader().use { it.readText() } }.getOrDefault("")
}

@androidx.compose.runtime.Composable
fun PhoneScreen(ingredients: List<CatalogIngredient>, recipes: List<CatalogRecipe>) {
    val names = ingredients.associate { it.id to it.name }
    val categories = ingredients.associate { it.id to it.category }
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
            when (val results = explore(query, ingredients, recipes)) {
                is ExploreView.Browse -> RecipeHits(results.recipes) { memory = pickCatalogue(memory, it, names) }
                is ExploreView.Matches -> {
                    results.ingredients.forEach { Text(capitaliseFirst(it.name), modifier = Modifier.heightIn(min = 48.dp)) }
                    RecipeHits(results.recipes) { memory = pickCatalogue(memory, it, names) }
                }
                is ExploreView.None -> {
                    Text("No matches")
                    results.ingredients.forEach { Text(capitaliseFirst(it.name), modifier = Modifier.heightIn(min = 48.dp)) }
                    RecipeHits(results.recipes) { memory = pickCatalogue(memory, it, names) }
                }
            }
        }
        Text("Ingredients", fontSize = 22.sp, modifier = Modifier.padding(top = 16.dp))
        shopLines(copies, names, categories).forEach { line ->
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
                Row(Modifier.heightIn(min = 48.dp)) {
                    Text("Portions", modifier = Modifier.padding(top = 12.dp, end = 8.dp))
                    Button(
                        onClick = { memory = setPortions(memory, recipe.id, recipe.portions - 1) },
                        enabled = recipe.portions > MIN_PORTIONS,
                        modifier = Modifier.heightIn(min = 48.dp)
                    ) { Text("Fewer portions") }
                    Text("${recipe.portions}", modifier = Modifier.padding(horizontal = 8.dp, top = 12.dp))
                    Button(
                        onClick = { memory = setPortions(memory, recipe.id, recipe.portions + 1) },
                        enabled = recipe.portions < MAX_PORTIONS,
                        modifier = Modifier.heightIn(min = 48.dp)
                    ) { Text("More portions") }
                }
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
