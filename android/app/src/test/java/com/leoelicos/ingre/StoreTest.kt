package com.leoelicos.ingre

import com.leoelicos.ingre.data.SavedRecipesStore
import com.leoelicos.ingre.data.ShoppingListStore
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class StoreTest {
    @Before
    fun reset() {
        SavedRecipesStore.clear()
        ShoppingListStore.clear()
    }

    @Test
    fun saveRecipeIsLocalAndIdempotent() {
        SavedRecipesStore.save("spaghetti-bolognese")
        SavedRecipesStore.save("spaghetti-bolognese")
        assertEquals(setOf("spaghetti-bolognese"), SavedRecipesStore.ids.value)
    }

    @Test
    fun addIngredientIsLocal() {
        ShoppingListStore.add("onion")
        ShoppingListStore.add("onion")
        assertEquals(1, ShoppingListStore.items.value.size)
        assertTrue(ShoppingListStore.items.value.any { it.name == "onion" })
    }
}
