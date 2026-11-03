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
    fun portionsScaleTheCopyAndLeaveTheOriginal() {
        val picked = pickRecipe(ListMemory(), dahl)
        val four = setPortions(picked, "dahl", 4)
        assertEquals(4, recipeCopies(four).single().portions)
        assertEquals(0.5, recipeCopies(four).single().lines.first().quantity)
        assertEquals(2.0, recipeCopies(four).single().lines[1].quantity)
        assertEquals(0.25, exploreRecipe(four, "dahl")?.lines?.first()?.quantity)
        val one = setPortions(four, "dahl", 0)
        assertEquals(1, recipeCopies(one).single().portions)
        assertEquals(0.125, recipeCopies(one).single().lines.first().quantity)
        val capped = setPortions(one, "dahl", 40)
        assertEquals(12, recipeCopies(capped).single().portions)
        assertEquals(four, setPortions(four, "dahl", 4))
        assertEquals(picked, setPortions(picked, "missing", 3))
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
