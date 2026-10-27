package app.ingre

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class CatalogueTest {
    private val garlic = CatalogIngredient("garlic", "garlic", "fruit & veg", 60.0, mapOf("clove" to 6.0))
    private val onion = CatalogIngredient("onion", "onion", "fruit & veg")

    @Test
    fun parsesTheCatalogueShape() {
        val ingredients = parseIngredients(
            """{"_note":"x","ingredients":[{"id":"garlic","name":"garlic","category":"fruit & veg","approxGrams":60,"measureGrams":{"clove":6}}]}"""
        )
        assertEquals(garlic, ingredients.single())
        val recipes = parseRecipes(
            """{"recipes":[{"id":"spaghetti-bolognese","name":"Spaghetti bolognese","portions":1,"ingredients":[{"ingredientId":"garlic","quantity":0.5,"measure":"clove"}],"method":["Simmer"]}]}"""
        )
        assertEquals("spaghetti-bolognese", recipes.single().id)
        assertEquals(0.5, recipes.single().lines.single().quantity)
        assertEquals(listOf("Simmer"), recipes.single().method)
        assertEquals(emptyList<CatalogIngredient>(), parseIngredients(""))
        assertEquals(emptyList<CatalogRecipe>(), parseRecipes("{}"))
    }

    @Test
    fun wordingAndSearchMatchTheWeb() {
        assertEquals("tomato chilli", normaliseTerm(" Tomatoes Chillies "))
        assertEquals("eggs", pluralise("egg"))
        assertEquals("eggs", pluralise("eggs"))
        assertEquals("leaves", pluralise("leaf"))
        assertEquals("bunches", pluralise("bunch"))
        assertEquals("glasses", pluralise("glass"))
        assertEquals("tomato", singularise("tomatoes"))
        assertEquals("hummus", singularise("hummus"))
        assertEquals(1, tierOf("red onion", "on"))
        assertEquals(0, tierOf("onion", "on"))
        assertEquals(1, levenshtein("garlic", "garlick"))
    }

    @Test
    fun exploreRanksBrowseMatchesAndCloseNames() {
        val recipes = listOf(
            CatalogRecipe("spaghetti", "Spaghetti", 1, listOf(CatalogLine("garlic", 0.5, "clove"))),
            CatalogRecipe("dahl", "Dahl", 1, listOf(CatalogLine("onion", 1.0, "whole")))
        )
        val browse = explore("", listOf(garlic, onion), recipes) as ExploreView.Browse
        assertEquals(listOf("Dahl", "Spaghetti"), browse.recipes.map { it.name })
        val matches = explore("gar", listOf(garlic, onion), recipes) as ExploreView.Matches
        assertEquals(listOf("garlic"), matches.ingredients.map { it.id })
        assertEquals(listOf("spaghetti"), matches.recipes.map { it.id })
        val none = explore("zzzzqq", listOf(garlic), recipes) as ExploreView.None
        assertTrue(none.ingredients.isEmpty())
        assertTrue(none.recipes.isEmpty())
        val close = explore("garlick", listOf(garlic), emptyList()) as ExploreView.None
        assertEquals(listOf("garlic"), close.ingredients.map { it.id })
        val saved = explore("", listOf(garlic), recipes, savedOnly = true, savedIds = setOf("dahl")) as ExploreView.Browse
        assertEquals(listOf("dahl"), saved.recipes.map { it.id })
    }

    @Test
    fun theListSumsCopiesAndScalesPortions() {
        val lines = shopLines(
            listOf(
                StoredRecipe("a", "A", listOf(Line("onion", "onion", 0.25, "whole"), Line("salt", "salt", 0.0, "g"))),
                StoredRecipe("b", "B", listOf(Line("onion", "onion", 0.75, "whole"), Line("onion", "onion", 10.0, "g")))
            ),
            mapOf("onion" to "onion"),
            mapOf("onion" to "fruit & veg")
        )
        assertEquals(2, lines.size)
        assertEquals(1.0, lines.first { it.measure == "whole" }.quantity)
        assertEquals(10.0, lines.first { it.measure == "g" }.quantity)
        assertEquals(1, clampPortions(0.4))
        assertEquals(12, clampPortions(12.6))
        assertEquals(2, clampPortions(Double.NaN))
        val recipe = CatalogRecipe("spaghetti", "Spaghetti", 1, listOf(CatalogLine("garlic", 0.5, "clove")))
        val scaled = scaledLines(recipe, newCopy("spaghetti", 2), mapOf("garlic" to "garlic"))
        assertEquals(1.0, scaled.single().quantity)
        val stored = toStored(recipe, mapOf("garlic" to "garlic"))
        val edited = editCopy(pickRecipe(ListMemory(), stored), "spaghetti", listOf(Line("garlic", "garlic", 2.0, "clove")))
        assertEquals(0.5, exploreRecipe(edited, "spaghetti")?.lines?.single()?.quantity)
    }
}
