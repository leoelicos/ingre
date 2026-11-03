package app.ingre.android

import app.ingre.android.core.CheckoutReturn
import app.ingre.android.core.CheckoutUrl
import app.ingre.android.core.ChipState
import app.ingre.android.core.Chips
import app.ingre.android.core.Copies
import app.ingre.android.core.CustomisationsValue
import app.ingre.android.core.Extra
import app.ingre.android.core.LibraryRecipe
import app.ingre.android.core.RecipeCopy
import app.ingre.android.core.Search
import app.ingre.android.core.ShopSection
import app.ingre.android.core.Units
import java.text.Collator
import java.util.Base64
import java.util.Locale
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class CopiesTest {
    @BeforeEach
    fun setUp() = TestSupport.useStrings()

    private val library = TestSupport.library
    private val bolognese: LibraryRecipe get() = library.recipe("spaghetti-bolognese")!!

    @Test
    fun linesScaleWithPortions() {
        val lines = Copies.lines(bolognese, RecipeCopy(bolognese.id, 2), library)
        val spaghetti = lines.first { it.ingredientId == "spaghetti" }
        assertEquals(200.0, spaghetti.quantity)
        assertEquals(200.0, spaghetti.original)
        val garlic = lines.first { it.ingredientId == "garlic" }
        assertEquals("1 clove", Units.amountText(garlic.quantity, garlic.measure, garlic.item))
    }

    @Test
    fun amountsAreStoredPerServe() {
        var copy = RecipeCopy(bolognese.id)
        copy = Copies.withAmount(copy, bolognese, "spaghetti", 300.0)
        assertEquals(mapOf("spaghetti" to 150.0), copy.amounts)
        copy = Copies.withPortions(copy, 4.0)
        assertEquals(600.0, Copies.lines(bolognese, copy, library).first { it.ingredientId == "spaghetti" }.quantity)
        // the original amount clears the edit
        copy = Copies.withAmount(copy, bolognese, "spaghetti", 400.0)
        assertTrue(copy.amounts.isEmpty())
        assertEquals(12, Copies.withPortions(copy, 40.0).portions)
        assertEquals(1, Copies.withPortions(copy, 0.0).portions)
    }

    @Test
    fun addedIngredientsUseTheirBaseUnitAndZeroTakesThemOff() {
        var copy = Copies.withAmount(RecipeCopy(bolognese.id), bolognese, "full-cream-milk", 100.0)
        val milk = Copies.lines(bolognese, copy, library).last()
        assertEquals("full-cream-milk", milk.ingredientId)
        assertNull(milk.original)
        assertEquals("full-cream-milk", milk.item?.id)
        assertEquals(Copies.addedMeasure(library.item("full-cream-milk")), milk.measure)
        copy = Copies.withAmount(copy, bolognese, "full-cream-milk", 0.0)
        assertTrue(copy.amounts.isEmpty())
    }

    @Test
    fun customisationsAndBullets() {
        var copy = RecipeCopy(bolognese.id)
        copy = Copies.withAmount(copy, bolognese, "parmesan", 0.0)
        copy = Copies.withAmount(copy, bolognese, "beef-mince", 300.0)
        copy = Copies.withPortions(copy, 4.0)
        val lines = Copies.lines(bolognese, copy, library)
        val custom = Copies.customisations(lines, copy)
        assertEquals(listOf(CustomisationsValue.Removed("parmesan", 50.0)), custom.removed)
        assertEquals(listOf(CustomisationsValue.Changed("beef-mince", 500.0, 600.0)), custom.changed)
        assertEquals(CustomisationsValue.Portions(2, 4), custom.portions)
        assertEquals(
            listOf("Parmesan removed", "Beef mince 500 g → 600 g", "Portions 2 → 4"),
            Copies.bullets(lines, copy)
        )
    }

    @Test
    fun saveInputIsTheCopyWithItsChanges() {
        val copy = Copies.withAmount(RecipeCopy(bolognese.id), bolognese, "parmesan", 0.0)
        val input = Copies.saveInput(bolognese, copy, library)
        assertEquals("spaghetti-bolognese", input.libraryId)
        assertEquals(2, input.portions)
        assertFalse(input.ingredients.any { it.ingredientId == "parmesan" })
        assertEquals(1, input.customisations.removed.size)
        val original = Copies.saveInput(bolognese, RecipeCopy(bolognese.id), library)
        assertEquals(CustomisationsValue(), original.customisations)
        assertEquals(bolognese.ingredients.size, original.ingredients.size)
    }

    @Test
    fun notesListAllergens() {
        val notes = Copies.notes(Copies.lines(bolognese, RecipeCopy(bolognese.id), library))
        assertTrue(notes.first().startsWith("Contains: "))
    }
}

class ChipsTest {
    @BeforeEach
    fun setUp() = TestSupport.useStrings()

    private val library = TestSupport.library

    @Test
    fun chipsBalanceRecipesAndExtra() {
        val entries = Chips.entries(listOf(RecipeCopy("spaghetti-bolognese")), library)
        val chips = Chips.build(
            entries,
            listOf(Extra.catalogue(library.item("garlic")!!)),
            ChipState(crossedIds = setOf("garlic")),
            library
        )
        val chip = chips.first { it.id == "garlic" }
        assertEquals(2, chip.sources.size)
        assertTrue(chip.crossed)
        assertEquals("in 1 recipe and Extra", Chips.usedInSummary(chip))
        // 1 clove (6 g of a 60 g head) plus 1 head
        assertTrue(Chips.amount(chip) in setOf("1.1 heads", "11 cloves"), Chips.amount(chip))
        assertTrue(Chips.accessibilityLabel(chip, "x").endsWith("crossed off"))
        assertEquals("${chips.size} items, 1 crossed off", Chips.ingredientsSummary(chips))
    }

    @Test
    fun groupsFollowShopOrder() {
        val chips = Chips.build(
            Chips.entries(listOf(RecipeCopy("spaghetti-bolognese")), library),
            emptyList(),
            ChipState(),
            library
        )
        val sections = Chips.groups(chips).map { it.section }
        assertEquals(ShopSection.entries.filter { it in sections }, sections)
        assertEquals(ShopSection.FruitVeg, sections.first())
    }

    @Test
    fun removedEverywhereIsGreyed() {
        val recipe = library.recipe("spaghetti-bolognese")!!
        val copy = Copies.withAmount(RecipeCopy(recipe.id), recipe, "parmesan", 0.0)
        val parmesan = Chips.build(Chips.entries(listOf(copy), library), emptyList(), ChipState(), library).first {
            it.id ==
                "parmesan"
        }
        assertTrue(parmesan.greyed)
        assertTrue(parmesan.customised)
        assertEquals("removed from every recipe", Chips.usedInSummary(parmesan))
    }

    @Test
    fun repeatedNamesGetANumber() {
        assertEquals("Pad thai (2)", Chips.sourceLabel(listOf("Pad thai"), "Pad thai"))
        assertEquals("Pad thai", Chips.sourceLabel(emptyList(), "Pad thai"))
    }
}

class SearchTest {
    @BeforeEach
    fun setUp() = TestSupport.useStrings()

    private val library = TestSupport.library

    @Test
    fun normalisesToSingular() {
        assertEquals("tomato chilli", Search.normalise(" Tomatoes Chillies "))
        assertEquals("egg", Search.normalise("eggs"))
        assertEquals("hummus", Search.normalise("hummus"))
        assertEquals("glass", Search.normalise("glass"))
    }

    @Test
    fun blankBrowsesAlphabetically() {
        val results = Search.results("  ", library, false, emptySet()) as Search.Results.Browse
        val collator = Collator.getInstance(Locale.ENGLISH)
        assertEquals(library.recipes.map { it.name }.sortedWith(collator::compare), results.recipes.map { it.name })
    }

    @Test
    fun matchesRankByTier() {
        val results = Search.results("spaghetti", library, false, emptySet()) as Search.Results.Matches
        assertEquals("spaghetti", results.ingredients.first().id)
        assertEquals("spaghetti-bolognese", results.recipes.first().id)
        assertEquals(0, Search.tier("Spaghetti bolognese", "spag"))
        assertEquals(1, Search.tier("Beef spaghetti", "spag"))
        assertEquals(2, Search.tier("Xspaghetti", "spag"))
    }

    @Test
    fun noMatchOffersCloseOnesThenBrowse() {
        val results = Search.results("spagetti", library, false, emptySet()) as Search.Results.None
        assertEquals("spaghetti", results.ingredients.first().id)
        assertEquals(library.recipes.size, results.browse.size)
    }

    @Test
    fun savedShowsOnlyHearted() {
        val results = Search.results("", library, true, setOf("spaghetti-bolognese")) as Search.Results.Browse
        assertEquals(listOf("spaghetti-bolognese"), results.recipes.map { it.id })
    }

    @Test
    fun checkoutUrlCarriesTheSessionAndKey() {
        val url = CheckoutUrl.make("cs_test_1")
        assertTrue(url.startsWith("https://checkout.stripe.com/c/pay/cs_test_1#"))
        val decoded = Base64.getDecoder().decode(url.substringAfter('#')).map {
            (it.toInt() xor 5).toByte()
        }.toByteArray()
        assertEquals("""{"apiKey":"pk_test_TYooMQauvdEDq54NiTphI7jx"}""", String(decoded))
    }

    @Test
    fun returnUrls() {
        assertEquals(CheckoutReturn.Success, CheckoutReturn.fromUrl("ingre", "upgrade", "/success"))
        assertEquals(CheckoutReturn.Cancel, CheckoutReturn.fromUrl("ingre", "upgrade", "/cancel"))
        assertNull(CheckoutReturn.fromUrl("ingre", "other", "/cancel"))
    }
}
