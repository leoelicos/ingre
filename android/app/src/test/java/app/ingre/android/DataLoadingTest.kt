package app.ingre.android

import app.ingre.android.core.ChipEdit
import app.ingre.android.core.Extra
import app.ingre.android.core.L10n
import app.ingre.android.core.Library
import app.ingre.android.core.LibraryRecipe
import app.ingre.android.core.ListState
import app.ingre.android.core.ListStorage
import app.ingre.android.core.MemoryStore
import app.ingre.android.core.RecipeCopy
import app.ingre.android.core.SectionTone
import app.ingre.android.core.ShopSection
import app.ingre.android.core.StorageKey
import java.io.File
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class DataLoadingTest {
    @BeforeEach
    fun setUp() = TestSupport.useStrings()

    @Test
    fun parsesTheWebClientsLibrary() {
        val library = TestSupport.library
        assertTrue(library.recipes.size >= 10)
        assertTrue(library.ingredients.size >= 50)
        assertEquals(SectionTone.Produce, library.tone(ShopSection.FruitVeg))
        assertEquals(SectionTone.Neutral, library.tone(ShopSection.Other))
        // every recipe ingredient is in the catalogue
        for (recipe in library.recipes) {
            for (ingredient in recipe.ingredients) {
                assertNotNull(
                    library.item(ingredient.ingredientId),
                    "${recipe.id}: ${ingredient.ingredientId}"
                )
            }
        }
    }

    @Test
    fun aislesMapToShopSections() {
        assertEquals(ShopSection.FruitVeg, ShopSection.forAisle("fruit & veg"))
        assertEquals(ShopSection.MeatSeafood, ShopSection.forAisle("seafood"))
        assertEquals(ShopSection.Dairy, ShopSection.forAisle("dairy & eggs"))
        assertEquals(ShopSection.Pantry, ShopSection.forAisle("sauces"))
        assertEquals("Dairy", ShopSection.Dairy.label)
    }

    @Test
    fun titlesDropTheLocalName() {
        assertEquals("Shaking beef", LibraryRecipe("x", "Shaking beef (bò lúc lắc)", 1, emptyList()).title)
    }

    @Test
    fun badDataFailsLoudly() {
        assertThrows<Exception> { Library.parse("{}", "{}") }
    }

    /** Every key the app's Kotlin asks for is in strings.xml (a missing one would show the raw key). */
    @Test
    fun everyKeyTheAppUsesHasAString() {
        val source = File(repoRoot, "android/app/src/main/java")
        val keys = source.walk().filter { it.extension == "kt" }.flatMap { file ->
            Regex("""L10n\.t\("([A-Za-z.]+)"""").findAll(file.readText()).map { it.groupValues[1] }
        }.toSet()
        assertTrue(keys.size > 50, "found ${keys.size} keys")
        val missing = keys.filter { L10n.resourceName(it) !in TestSupport.strings }
        assertEquals(emptyList<String>(), missing)
        // and the plural forms
        for (key in listOf("item_one", "item_other", "recipe_one", "recipe_other")) {
            assertTrue(key in TestSupport.strings, key)
        }
    }

    /** scripts/copy-native-data.sh is the only source of the app's JSON: none is committed under android/. */
    @Test
    fun theDataIsCopiedAtBuildTimeNotCommitted() {
        val committed = File(repoRoot, "android/app/src/main").walk().filter {
            it.name == "recipes.json" ||
                it.name == "ingredients.json"
        }.toList()
        assertEquals(emptyList<File>(), committed)
        assertTrue(File(repoRoot, "scripts/copy-native-data.sh").canExecute())
    }
}

class StorageTest {
    @Test
    fun usesTheWebKeysAndShapes() {
        val store = MemoryStore()
        val storage = ListStorage(store)
        val state = ListState(
            copies = listOf(RecipeCopy("pad-thai", 4, mapOf("egg" to 0.0))),
            extras = listOf(Extra("milk", "milk", "milk", 2)),
            crossed = setOf("egg"),
            edits = mapOf("milk" to ChipEdit(ShopSection.Other))
        )
        storage.save(state)
        assertEquals("""[{"recipeId":"pad-thai","portions":4,"amounts":{"egg":0.0}}]""", store.read(StorageKey.Copies))
        assertEquals(
            """[{"id":"milk","name":"milk","ingredientId":"milk","quantity":2}]""",
            store.read(StorageKey.Extras)
        )
        assertEquals("""["egg"]""", store.read(StorageKey.Crossed))
        assertEquals("""{"milk":{"section":"Other"}}""", store.read(StorageKey.Edits))
        assertEquals(state, storage.load())
        assertEquals("ingre.list.copies", StorageKey.Copies.key)
        assertEquals("ingre.chips.crossed", StorageKey.Crossed.key)
    }

    @Test
    fun dropsMalformedEntries() {
        val store = MemoryStore(
            mapOf(
                StorageKey.Copies to
                    """[{"recipeId":"a","portions":40,"amounts":{"x":-1,"y":2}},{"recipeId":"a","portions":2},{"nope":1}]""",
                StorageKey.Extras to
                    """[{"id":"t","name":"tea","ingredientId":null,"quantity":1.5},{"id":"u","name":"u","ingredientId":null,"quantity":1}]""",
                StorageKey.Edits to """{"a":{"section":"Nowhere"},"b":{"section":"Deli"}}""",
                StorageKey.Crossed to "not json"
            )
        )
        val state = ListStorage(store).load()
        assertEquals(listOf(RecipeCopy("a", 12, mapOf("y" to 2.0))), state.copies)
        assertEquals(listOf(Extra("u", "u", null, 1)), state.extras)
        assertEquals(mapOf("b" to ChipEdit(ShopSection.Deli)), state.edits)
        assertTrue(state.crossed.isEmpty())
    }
}
