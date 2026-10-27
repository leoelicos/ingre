package app.ingre

import java.text.Collator
import java.util.Locale
import kotlin.math.round
import org.json.JSONObject

/** One catalogue ingredient. Amounts stay in the web units. */
data class CatalogIngredient(
    val id: String,
    val name: String,
    val category: String,
    val approxGrams: Double? = null,
    val measureGrams: Map<String, Double> = emptyMap()
)

data class CatalogLine(val ingredientId: String, val quantity: Double, val measure: String)

data class CatalogRecipe(
    val id: String,
    val name: String,
    val portions: Int,
    val lines: List<CatalogLine>,
    val method: List<String> = emptyList()
)

private val collator: Collator = Collator.getInstance(Locale.ROOT)

private val IRREGULAR = mapOf(
    "leaf" to "leaves",
    "chilli" to "chillies",
    "potato" to "potatoes",
    "tomato" to "tomatoes",
    "egg" to "eggs"
)

private val SINGULARS = IRREGULAR.entries.associate { (one, many) -> many to one }

private fun looksPlural(word: String): Boolean = Regex("[^su]s$").containsMatchIn(word)

private fun onLastWord(phrase: String, fn: (String) -> String): String {
    val i = phrase.lastIndexOf(' ') + 1
    return phrase.substring(0, i) + fn(phrase.substring(i))
}

/** Plural, never doubled. egg -> eggs, eggs -> eggs, leaf -> leaves, bunch -> bunches. */
fun pluralise(phrase: String): String = onLastWord(phrase) { word ->
    IRREGULAR[word]
        ?: if (SINGULARS.containsKey(word) || looksPlural(word)) word
        else if (Regex("(s|x|ch|sh)$").containsMatchIn(word)) "${word}es"
        else if (Regex("[^aeiou]y$").containsMatchIn(word)) word.dropLast(1) + "ies"
        else "${word}s"
}

/** Singular for a catalogue name given in the plural. tomatoes -> tomato. */
fun singularise(phrase: String): String = onLastWord(phrase) { word ->
    SINGULARS[word] ?: if (looksPlural(word)) word.dropLast(1) else word
}

/** Lowercase, trimmed, every word singular. " Tomatoes Chillies " -> "tomato chilli". */
fun normaliseTerm(text: String): String =
    text.trim().lowercase().split(Regex("\\s+")).filter { it.isNotEmpty() }.joinToString(" ") { singularise(it) }

fun tierOf(name: String, query: String): Int {
    val text = normaliseTerm(name)
    val q = normaliseTerm(query)
    if (text.startsWith(q)) return 0
    if (text.split(" ").any { it.startsWith(q) }) return 1
    return if (text.contains(q)) 2 else 3
}

fun ingredientMatches(name: String, query: String): Boolean {
    val haystack = normaliseTerm(name)
    val words = normaliseTerm(query).split(" ").filter { it.isNotEmpty() }
    return words.all { haystack.contains(it) }
}

fun recipeMatches(recipe: CatalogRecipe, query: String, namesById: Map<String, String>): Boolean {
    val words = normaliseTerm(query).split(" ").filter { it.isNotEmpty() }
    if (words.isEmpty()) return true
    val fields = listOf(normaliseTerm(recipe.name)) +
        recipe.lines.map { normaliseTerm(namesById[it.ingredientId] ?: "") }
    return words.all { word -> fields.any { it.contains(word) } }
}

sealed class ExploreView {
    data class Browse(val recipes: List<CatalogRecipe>) : ExploreView()
    data class Matches(val ingredients: List<CatalogIngredient>, val recipes: List<CatalogRecipe>) : ExploreView()
    data class None(
        val ingredients: List<CatalogIngredient>,
        val recipes: List<CatalogRecipe>,
        val browse: List<CatalogRecipe>
    ) : ExploreView()
}

fun levenshtein(a: String, b: String): Int {
    if (a == b) return 0
    if (a.isEmpty()) return b.length
    if (b.isEmpty()) return a.length
    var prev = IntArray(b.length + 1) { it }
    val cur = IntArray(b.length + 1)
    for (i in a.indices) {
        cur[0] = i + 1
        for (j in b.indices) {
            val cost = if (a[i] == b[j]) 0 else 1
            cur[j + 1] = minOf(cur[j] + 1, prev[j + 1] + 1, prev[j] + cost)
        }
        prev = cur.clone()
    }
    return prev[b.length]
}

private fun <T> rank(items: List<T>, query: String, name: (T) -> String): List<T> =
    items.sortedWith { left, right ->
        val tier = tierOf(name(left), query) - tierOf(name(right), query)
        if (tier != 0) tier else collator.compare(name(left), name(right))
    }

private fun <T> closeMatches(items: List<T>, query: String, name: (T) -> String): List<T> {
    val q = normaliseTerm(query)
    if (q.length < 3) return emptyList()
    return items.mapNotNull { item ->
        val distance = levenshtein(normaliseTerm(name(item)), q)
        if (distance <= 2) item to distance else null
    }.sortedWith { left, right ->
        val byDistance = left.second - right.second
        if (byDistance != 0) byDistance else collator.compare(name(left.first), name(right.first))
    }.map { it.first }
}

fun explore(
    query: String,
    ingredients: List<CatalogIngredient>,
    recipes: List<CatalogRecipe>,
    savedOnly: Boolean = false,
    savedIds: Set<String> = emptySet()
): ExploreView {
    val pool = if (savedOnly) recipes.filter { it.id in savedIds } else recipes
    val alpha = pool.sortedWith { a, b -> collator.compare(a.name, b.name) }
    if (normaliseTerm(query).isEmpty()) return ExploreView.Browse(alpha)
    val names = ingredients.associate { it.id to it.name }
    val foundIngredients = rank(ingredients.filter { ingredientMatches(it.name, query) }, query) { it.name }
    val foundRecipes = rank(pool.filter { recipeMatches(it, query, names) }, query) { it.name }
    if (foundIngredients.isEmpty() && foundRecipes.isEmpty()) {
        return ExploreView.None(
            closeMatches(ingredients, query) { it.name },
            closeMatches(pool, query) { it.name },
            alpha
        )
    }
    return ExploreView.Matches(foundIngredients, foundRecipes)
}

fun capitaliseFirst(name: String): String =
    if (name.isEmpty()) name else name.replaceFirstChar { it.uppercaseChar() }

data class ShopLine(
    val ingredientId: String,
    val name: String,
    val quantity: Double,
    val measure: String,
    val category: String
)

fun shopLines(
    recipes: List<StoredRecipe>,
    names: Map<String, String>,
    categories: Map<String, String>
): List<ShopLine> {
    val totals = linkedMapOf<Pair<String, String>, Double>()
    val seen = mutableMapOf<String, String>()
    for (recipe in recipes) {
        for (line in recipe.lines) {
            if (line.quantity <= 0.0) continue
            val key = line.ingredientId to line.measure
            totals[key] = (totals[key] ?: 0.0) + line.quantity
            seen.putIfAbsent(line.ingredientId, line.name)
        }
    }
    return totals.map { (key, quantity) ->
        ShopLine(
            key.first,
            names[key.first] ?: seen[key.first] ?: key.first,
            quantity,
            key.second,
            categories[key.first] ?: "other"
        )
    }.sortedWith { a, b ->
        val byCategory = collator.compare(a.category, b.category)
        if (byCategory != 0) byCategory else collator.compare(a.name, b.name)
    }
}

const val DEFAULT_PORTIONS = 2
const val MIN_PORTIONS = 1
const val MAX_PORTIONS = 12

fun clampPortions(portions: Double): Int {
    if (!portions.isFinite()) return DEFAULT_PORTIONS
    return round(portions).toInt().coerceIn(MIN_PORTIONS, MAX_PORTIONS)
}

data class RecipeCopyState(
    val recipeId: String,
    val portions: Int = DEFAULT_PORTIONS,
    val amounts: Map<String, Double> = emptyMap()
)

fun newCopy(recipeId: String, portions: Int = DEFAULT_PORTIONS): RecipeCopyState =
    RecipeCopyState(recipeId, clampPortions(portions.toDouble()))

fun scaledLines(recipe: CatalogRecipe, copy: RecipeCopyState, names: Map<String, String>): List<Line> {
    val portions = maxOf(recipe.portions, 1)
    val originalIds = recipe.lines.map { it.ingredientId }.toSet()
    val originals = recipe.lines.map { line ->
        val perServe = line.quantity / portions
        val amount = copy.amounts[line.ingredientId] ?: perServe
        Line(
            line.ingredientId,
            names[line.ingredientId] ?: line.ingredientId,
            amount * copy.portions,
            line.measure
        )
    }
    val added = copy.amounts.filterKeys { it !in originalIds }.map { (id, amount) ->
        Line(id, names[id] ?: id, amount * copy.portions, "whole")
    }
    return originals + added
}

fun toStored(recipe: CatalogRecipe, names: Map<String, String>): StoredRecipe =
    StoredRecipe(
        recipe.id,
        recipe.name,
        recipe.lines.map { line ->
            Line(line.ingredientId, names[line.ingredientId] ?: line.ingredientId, line.quantity, line.measure)
        }
    )

fun parseIngredients(json: String): List<CatalogIngredient> {
    val root = runCatching { JSONObject(json) }.getOrNull() ?: return emptyList()
    val array = root.optJSONArray("ingredients") ?: return emptyList()
    return buildList {
        for (index in 0 until array.length()) {
            val obj = array.optJSONObject(index) ?: continue
            val id = obj.optString("id")
            val name = obj.optString("name")
            if (id.isEmpty() || name.isEmpty()) continue
            val grams = if (obj.has("approxGrams") && !obj.isNull("approxGrams")) obj.getDouble("approxGrams") else null
            val measures = mutableMapOf<String, Double>()
            obj.optJSONObject("measureGrams")?.let { raw ->
                val keys = raw.keys()
                while (keys.hasNext()) {
                    val key = keys.next()
                    measures[key] = raw.getDouble(key)
                }
            }
            add(CatalogIngredient(id, name, obj.optString("category"), grams, measures))
        }
    }
}

fun parseRecipes(json: String): List<CatalogRecipe> {
    val root = runCatching { JSONObject(json) }.getOrNull() ?: return emptyList()
    val array = root.optJSONArray("recipes") ?: return emptyList()
    return buildList {
        for (index in 0 until array.length()) {
            val obj = array.optJSONObject(index) ?: continue
            val id = obj.optString("id")
            val name = obj.optString("name")
            if (id.isEmpty() || name.isEmpty()) continue
            val lines = mutableListOf<CatalogLine>()
            obj.optJSONArray("ingredients")?.let { raw ->
                for (lineIndex in 0 until raw.length()) {
                    val line = raw.optJSONObject(lineIndex) ?: continue
                    val ingredientId = line.optString("ingredientId")
                    if (ingredientId.isEmpty()) continue
                    lines.add(CatalogLine(ingredientId, line.optDouble("quantity"), line.optString("measure")))
                }
            }
            val method = mutableListOf<String>()
            obj.optJSONArray("method")?.let { raw ->
                for (step in 0 until raw.length()) method.add(raw.optString(step))
            }
            add(CatalogRecipe(id, name, obj.optInt("portions", 1), lines, method))
        }
    }
}
