package app.ingre

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class WordingTest {
    private val clove = CountUnit("clove", "cloves")
    private val tomato = CountUnit("tomato", "tomatoes")
    private val head = CountUnit("head", "heads")
    private val garlic = CountedItem(
        countUnit = CountUnit("head", "heads"),
        partMeasure = "clove",
        approxGrams = 60.0,
        measureGrams = mapOf("clove" to 6.0)
    )
    private val eggs = CountedItem(countUnit = CountUnit("egg", "eggs"))
    private val springOnion = CountedItem(
        countUnit = CountUnit("bunch", "bunches"),
        partMeasure = "stalk",
        approxGrams = 100.0,
        measureGrams = mapOf("stalk" to 10.0)
    )

    @Test
    fun pluralEdgeCases() {
        assertEquals(listOf("cloves", "clove", "cloves", "cloves"), listOf(0.0, 1.0, 2.0, 1.5).map { formatCountUnit(it, clove) })
        assertEquals(listOf("items", "item", "items", "items"), listOf(0.0, 1.0, 2.0, 1.5).map { formatItemUnit(it) })
        assertEquals(1.0, pluralCount(0.5))
        assertEquals("clove", formatCountUnit(0.5, clove))
        assertEquals("item", formatItemUnit(0.5))
        assertEquals("½ tomato", formatQuantity(0.5, "whole", tomato))
        assertEquals("½ clove", formatQuantity(0.5, "clove"))
        assertEquals(listOf(0.0, 0.0, 1.0, 1.0, 1.0, 1.5, 2.0), listOf(0.0, 0.001, 0.25, 1.0, 1.004, 1.5, 2.0).map { pluralCount(it) })
    }

    @Test
    fun readsLikeTheList() {
        assertEquals("1 clove", formatQuantity(1.0, "clove"))
        assertEquals("2 cloves", formatQuantity(2.0, "clove"))
        assertEquals("1 head", formatQuantity(1.0, "whole", head))
        assertEquals("2 tomatoes", formatQuantity(2.0, "whole", tomato))
        assertEquals("1½ tomatoes", formatQuantity(1.5, "whole", tomato))
        assertEquals("1 item", formatCount(1.0, null))
        assertEquals("3 items", formatCount(3.0, null))
        assertEquals("0 items", formatCount(0.0, null))
    }

    @Test
    fun measures() {
        assertEquals(listOf("cups", "cloves", "stalks", "bunches"), listOf("cup", "clove", "stalk", "bunch").map { formatMeasure(2.0, it) })
        assertEquals(listOf("cup", "clove", "stalk", "bunch"), listOf("cup", "clove", "stalk", "bunch").map { formatMeasure(1.0, it) })
        assertEquals(listOf("tsp", "tbsp", "g", "ml", "g tin", "ml tin", "kg", "L"), listOf("tsp", "tbsp", "g", "ml", "g tin", "ml tin", "kg", "L").map { formatMeasure(2.0, it) })
        assertEquals("pinch", formatMeasure(2.0, "pinch"))
        assertEquals("2 pinch", formatQuantity(2.0, "pinch"))
        assertEquals("37.5 g", formatQuantity(37.5, "g"))
        assertEquals("400 g tin", formatQuantity(400.0, "g tin"))
        assertEquals("½ tbsp", formatQuantity(0.5, "tbsp"))
        assertEquals("1¾ cups", formatQuantity(1.75, "cup"))
        assertEquals("250 g", formatMass(250.0, "g"))
        assertEquals("1 kg", formatMass(1000.0, "g"))
        assertEquals("2.5 kg", formatMass(2500.0, "g"))
        assertEquals("1.5 L", formatMass(1500.0, "ml"))
        assertEquals("1000 ml", formatMass(999.999, "ml"))
    }

    @Test
    fun numbers() {
        assertEquals("37.5", formatNumber(37.5))
        assertEquals("0.33", formatNumber(1.0 / 3.0))
        assertEquals("12500", formatNumber(12500.0))
        assertEquals("0", formatNumber(-0.001))
        assertEquals(2.35, rounded(2.345))
    }

    @Test
    fun toBaseAndConvert() {
        assertEquals(Amount(2.0, "g"), toBase(2.0, "g", null))
        assertEquals(Amount(100.0, "g"), toBase(100.0, "g tin", null))
        assertEquals(Amount(5.0, "ml"), toBase(1.0, "tsp", null))
        assertEquals(Amount(20.0, "ml"), toBase(1.0, "tbsp", null))
        assertEquals(Amount(125.0, "ml"), toBase(0.5, "cup", null))
        assertEquals(Amount(1.5, "count"), toBase(1.5, "whole", null))
        assertEquals(Amount(0.25, "count"), toBase(0.25, "bunch", null))
        assertEquals(Amount(12.0, "g"), toBase(2.0, "clove", mapOf("clove" to 6.0)))
        assertNull(toBase(2.0, "clove", null))
        assertEquals(5.0, convert(Amount(5.0, "g"), "g", null))
        assertEquals(5.0, convert(Amount(5.0, "ml"), "g", null))
        assertEquals(300.0, convert(Amount(2.0, "count"), "g", 150.0))
        assertEquals(2.0, convert(Amount(300.0, "g"), "count", 150.0))
        assertNull(convert(Amount(2.0, "count"), "g", null))
    }

    @Test
    fun countedTotals() {
        assertEquals("1 egg", countText(1.0, eggs))
        assertEquals("12 eggs", countText(12.0, eggs))
        assertEquals("0 eggs", countText(0.0, eggs))
        assertEquals("1½ onions", countText(1.5, CountedItem(countUnit = CountUnit("onion", "onions"))))
        assertEquals("2 items", formatAmount(Amount(2.0, "count")))
        assertEquals("3 cloves", countText(0.3, garlic))
        assertEquals("1 clove", countText(0.1, garlic))
        assertEquals("13 cloves", countText(1.3, garlic))
        assertEquals("1 head", countText(1.0, garlic))
        assertEquals("2 heads", countText(2.0, garlic))
        assertEquals("2 stalks", countText(0.2, springOnion))
        assertEquals("1 bunch", countText(1.0, springOnion))
        assertNull(partsOf(0.5, null))
        assertNull(partsOf(0.5, eggs))
        assertEquals(Parts(5.0, "clove"), partsOf(0.5, garlic))
        assertEquals("1.46 items", formatAmount(Amount(1.456, "count")))
        assertEquals("250 g", formatAmount(Amount(250.0, "g")))
        assertEquals("1 kg", formatAmount(Amount(1000.0, "g")))
        assertEquals("1.5 L", formatAmount(Amount(1500.0, "ml")))
    }

    @Test
    fun itemUnits() {
        assertEquals("ml", itemUnit(listOf(SoldOption("carton", SoldSize(1.0, "ml")))))
        assertEquals("g", itemUnit(listOf(SoldOption("weighed", null))))
        assertEquals("count", itemUnit(null))
        assertEquals("whole", unitMeasure("count"))
        assertEquals("g", unitMeasure("g"))
    }
}
