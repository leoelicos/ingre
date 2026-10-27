package app.ingre.android.core

import java.text.Collator
import java.util.Locale

/**
 * Explore search (#181, #195): a port of client/src/utils/explore/exploreSearch.ts and
 * searchTerms.ts. Close matches use a Bitap-style approximate match with Fuse.js's default
 * settings (threshold 0.6, location 0, distance 100), since Fuse.js itself is web only.
 */
object Search {
    private val irregularPlurals = mapOf(
        "leaf" to "leaves",
        "chilli" to "chillies",
        "potato" to "potatoes",
        "tomato" to "tomatoes",
        "egg" to "eggs"
    )
    private val singulars = irregularPlurals.entries.associate { (k, v) -> v to k }
    private val collator: Collator = Collator.getInstance(Locale.ENGLISH)

    /** Ends in a plural -s (not -ss or -us, e.g. "glass", "hummus"). */
    private fun looksPlural(word: String): Boolean {
        if (word.length < 2 || !word.endsWith("s")) return false
        val before = word[word.length - 2]
        return before != 's' && before != 'u'
    }

    /** Singular for a word: eggs -> egg, tomatoes -> tomato. */
    fun singularise(word: String): String = singulars[word] ?: if (looksPlural(word)) word.dropLast(1) else word

    /** Lowercase, trimmed, every word singular: " Tomatoes Chillies " -> "tomato chilli". */
    fun normalise(text: String): String = text.lowercase()
        .split(Regex("\\s+"))
        .filter { it.isNotEmpty() }
        .joinToString(" ") { singularise(it) }

    /** The name starts with the query, then a word in it does, then it contains it; else 3. */
    fun tier(name: String, query: String): Int {
        val text = normalise(name)
        val q = normalise(query)
        return when {
            text.startsWith(q) -> 0
            text.split(" ").any { it.startsWith(q) } -> 1
            text.contains(q) -> 2
            else -> 3
        }
    }

    fun <T> ranked(items: List<T>, query: String, name: (T) -> String): List<T> = items
        .map { it to tier(name(it), query) }
        .sortedWith { a, b ->
            if (a.second !=
                b.second
            ) {
                a.second - b.second
            } else {
                collator.compare(name(a.first), name(b.first))
            }
        }
        .map { it.first }

    /** An ingredient matches when its name holds every word of the query. */
    fun ingredientMatches(item: LibraryIngredient, query: String): Boolean {
        val name = normalise(item.name)
        return normalise(query).split(" ").all { name.contains(it) }
    }

    /** A recipe matches when every query word is in its name or one of its ingredients' names. */
    fun matches(recipe: LibraryRecipe, query: String, library: Library): Boolean {
        val q = normalise(query)
        if (q.isEmpty()) return true
        val haystack = (listOf(recipe.name) + recipe.ingredients.map { library.item(it.ingredientId)?.name ?: "" })
            .map { normalise(it) }
        return q.split(" ").all { word -> haystack.any { it.contains(word) } }
    }

    /** Fuse.js's score for one text: 0 is exact, 1 is no match; null above the 0.6 threshold. */
    fun fuzzyScore(text: String, pattern: String): Double? {
        val t = text.lowercase()
        val p = pattern.lowercase().take(32)
        if (p.isEmpty()) return null
        val threshold = 0.6
        val distance = 100.0
        var best: Double? = null
        // Sellers' algorithm: the fewest edits to match the pattern ending at each text position.
        var previous = IntArray(p.length + 1) { it }
        for ((j, ch) in t.withIndex()) {
            val current = IntArray(p.length + 1)
            for (i in 1..p.length) {
                val cost = if (p[i - 1] == ch) 0 else 1
                current[i] = minOf(previous[i] + 1, current[i - 1] + 1, previous[i - 1] + cost)
            }
            val errors = current[p.length]
            val start = maxOf(0, j - p.length + 1)
            val score = errors.toDouble() / p.length + start / distance
            if (errors < p.length && score <= threshold && (best == null || score < best)) best = score
            previous = current
        }
        return best
    }

    /** Close matches by name, best first, as Fuse.js's search gives them. */
    fun <T> closeMatches(items: List<T>, query: String, name: (T) -> String): List<T> {
        val q = query.trim()
        return items.withIndex()
            .mapNotNull { (index, item) -> fuzzyScore(name(item), q)?.let { Triple(item, it, index) } }
            .sortedWith(compareBy({ it.second }, { it.third }))
            .map { it.first }
    }

    sealed interface Results {
        data class Browse(val recipes: List<LibraryRecipe>) : Results

        data class Matches(val ingredients: List<LibraryIngredient>, val recipes: List<LibraryRecipe>) : Results

        data class None(
            val ingredients: List<LibraryIngredient>,
            val recipes: List<LibraryRecipe>,
            val browse: List<LibraryRecipe>
        ) : Results
    }

    /** The recipes Explore may show: only hearted ones while Saved is on. */
    fun shown(library: Library, savedOnly: Boolean, savedIds: Set<String>): List<LibraryRecipe> =
        library.recipes.filter { !savedOnly || it.id in savedIds }

    /** Blank: browse every recipe. Typed: ranked matches, or none plus close matches and browse. */
    fun results(query: String, library: Library, savedOnly: Boolean, savedIds: Set<String>): Results {
        val recipes = shown(library, savedOnly, savedIds)
        val browse = recipes.sortedWith { a, b -> collator.compare(a.name, b.name) }
        if (normalise(query).isEmpty()) return Results.Browse(browse)
        val ingredients = ranked(library.ingredients.filter { ingredientMatches(it, query) }, query) { it.name }
        val hits = ranked(recipes.filter { matches(it, query, library) }, query) { it.name }
        if (ingredients.isNotEmpty() || hits.isNotEmpty()) return Results.Matches(ingredients, hits)
        return Results.None(
            closeMatches(library.ingredients, query) { it.name },
            closeMatches(recipes, query) { it.name },
            browse
        )
    }
}
