package app.ingre.android

import app.ingre.android.core.Amount
import app.ingre.android.core.BaseUnit
import app.ingre.android.core.PluralRules
import app.ingre.android.core.Units
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/** Unit wording must read exactly like the web helper (client/src/i18n/__tests__). */
class UnitWordingTest {
    @BeforeEach
    fun setUp() = TestSupport.useStrings()

    private val garlic get() = TestSupport.library.item("garlic")!!

    @Test
    fun numbersKeepTwoDecimalsAndNoGrouping() {
        assertEquals("37.5", Units.formatNumber(37.5))
        assertEquals("1250", Units.formatNumber(1250.0))
        assertEquals("0.33", Units.formatNumber(1.0 / 3.0))
        assertEquals("2", Units.formatNumber(2.0))
    }

    @Test
    fun quartersAreGlyphs() {
        assertEquals("½", Units.formatFraction(0.5))
        assertEquals("1¼", Units.formatFraction(1.25))
        assertEquals("¾", Units.formatFraction(0.75))
        assertEquals("0.3", Units.formatFraction(0.3))
        assertEquals("3", Units.formatFraction(3.0))
    }

    @Test
    fun halfQuantitiesReadSingular() {
        assertEquals("½ clove", Units.formatQuantity(0.5, "clove"))
        assertEquals("1 clove", Units.formatQuantity(1.0, "clove"))
        assertEquals("1½ cloves", Units.formatQuantity(1.5, "clove"))
        assertEquals("½ cup", Units.formatQuantity(0.5, "cup"))
        assertEquals("2 cups", Units.formatQuantity(2.0, "cup"))
        assertEquals("½ item", Units.formatCount(0.5, null))
        assertEquals("0 items", Units.formatCount(0.0, null))
    }

    @Test
    fun measuresThatNeverPluralise() {
        assertEquals("37.5 g", Units.formatQuantity(37.5, "g"))
        assertEquals("½ tbsp", Units.formatQuantity(0.5, "tbsp"))
        assertEquals("400 g tin", Units.formatQuantity(400.0, "g tin"))
        assertEquals("2 pinch", Units.formatQuantity(2.0, "pinch"))
    }

    @Test
    fun wholeTakesTheItemsCountUnit() {
        assertEquals("1 head", Units.amountText(1.0, "whole", garlic))
        assertEquals("2 heads", Units.amountText(2.0, "whole", garlic))
        assertEquals("½ item", Units.amountText(0.5, "whole", null))
    }

    @Test
    fun massesBecomeKilosAndLitres() {
        assertEquals("250 g", Units.formatMass(250.0, BaseUnit.G))
        assertEquals("1 kg", Units.formatMass(1000.0, BaseUnit.G))
        assertEquals("1.5 L", Units.formatMass(1500.0, BaseUnit.Ml))
    }

    @Test
    fun garlicReadsInClovesUntilWhole() {
        // 6 g cloves in a 60 g head: 0.3 head is 3 cloves, 1 head is a head
        assertEquals("3 cloves", Units.formatAmount(Amount(0.3, BaseUnit.Count), garlic))
        assertEquals("½ clove", Units.formatAmount(Amount(0.05, BaseUnit.Count), garlic))
        assertEquals("1 head", Units.formatAmount(Amount(1.0, BaseUnit.Count), garlic))
        assertEquals("2 heads", Units.formatAmount(Amount(2.0, BaseUnit.Count), garlic))
    }

    @Test
    fun recipeAndItemCounts() {
        assertEquals("1 recipe", Units.formatRecipeCount(1))
        assertEquals("2 recipes", Units.formatRecipeCount(2))
        assertEquals("0 items", Units.formatItemCount(0))
        assertEquals("1 item", Units.formatItemCount(1))
    }

    @Test
    fun pluralRulesAreEnglish() {
        assertEquals("one", PluralRules.english(1.0))
        assertEquals("other", PluralRules.english(0.0))
        assertEquals("other", PluralRules.english(1.5))
        assertEquals(1.0, Units.pluralCount(0.25))
        assertEquals(0.0, Units.pluralCount(0.0))
    }
}
