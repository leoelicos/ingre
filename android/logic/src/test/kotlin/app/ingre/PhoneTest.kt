package app.ingre

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class PhoneTest {
    private val dahl = StoredRecipe(
        "dahl",
        "Red lentil dahl",
        listOf(Line("onion", "onion", 0.25, "whole"), Line("garlic", "garlic", 1.0, "clove"))
    )

    @Test
    fun phoneOrderHasNoOverlayAndExploreFollowsTheList() {
        assertEquals(
            listOf(PhoneSection.Explore, PhoneSection.Ingredients, PhoneSection.Recipes, PhoneSection.Extra),
            phoneSections()
        )
        assertEquals(PhoneSection.Recipes, phoneSections()[phoneSections().indexOf(PhoneSection.Extra) - 1])
        assertTrue(exploreStartsOpen(0, false))
        assertFalse(exploreStartsOpen(2, false))
        assertTrue(exploreStartsOpen(2, true))
    }

    @Test
    fun closedRowsAreNamesOnlyAndNeverAPreviewOrBadge() {
        assertEquals(listOf(NameChip("onion"), NameChip("garlic")), closedChips(listOf("onion", "garlic")))
        assertFalse(SHOWS_KEY_INGREDIENT_PREVIEW)
        assertFalse(SHOWS_BADGES)
    }

    @Test
    fun editingACopyLeavesTheExploreOriginal() {
        val picked = pickRecipe(ListMemory(), dahl)
        val edited = editCopy(picked, "dahl", listOf(Line("onion", "onion", 1.0, "whole")))
        assertEquals(0.25, exploreRecipe(edited, "dahl")?.lines?.first()?.quantity)
        assertEquals(1.0, recipeCopies(edited).single().lines.first().quantity)
        assertNull(exploreRecipe(ListMemory(), "missing"))
        assertEquals(picked, pickRecipe(picked, dahl))
        assertEquals(picked, editCopy(picked, "missing", emptyList()))
    }

    @Test
    fun titlesSplitAndUpgradeStartsOnce() {
        assertEquals("Shaking beef" to "bò lúc lắc", splitTitle("Shaking beef (bò lúc lắc)"))
        assertEquals("Red lentil dahl" to null, splitTitle("Red lentil dahl"))
        val upgrade = UpgradeStarter()
        assertTrue(upgrade.start())
        assertFalse(upgrade.start())
        assertTrue(upgrade.starting)
        assertEquals("Starting the Stripe checkout…", UPGRADE_STARTING)
    }

    @Test
    fun loginBodyCarriesTheVariables() {
        val body = loginBody("a@b.c", "p\"x")
        assertTrue(body.contains("mutation Login"))
        assertTrue(body.contains("\"email\":\"a@b.c\""))
        assertTrue(body.contains("\"password\":\"p\\\"x\""))
    }
}
