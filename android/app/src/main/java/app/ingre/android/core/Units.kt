package app.ingre.android.core

import java.util.Locale
import kotlin.math.floor

/**
 * Amount and unit wording (#195): a port of client/src/i18n/format.ts and
 * client/src/utils/shopping/units.ts, so the app reads exactly like the web app.
 */
object Units {
    /** Two decimals at most: 37.5 -> 37.5, 1/3 -> 0.33 (Math.round, half up). */
    fun rounded(n: Double): Double = floor(n * 100 + 0.5) / 100

    /** A plain decimal, two places at most and no grouping: 37.5 -> "37.5", 1250 -> "1250". */
    fun formatNumber(n: Double): String {
        val value = rounded(n) + 0.0
        if (value == floor(value)) return value.toLong().toString()
        return String.format(Locale.ROOT, "%.2f", value).trimEnd('0').trimEnd('.')
    }

    private val fractions = listOf(0.25 to "¼", 0.5 to "½", 0.75 to "¾")

    /** Quarters as glyphs, else a plain decimal: 0.5 -> "½", 1.25 -> "1¼", 0.3 -> "0.3". */
    fun formatFraction(n: Double): String {
        val value = rounded(n)
        val whole = floor(value)
        val glyph = fractions.firstOrNull { it.first == rounded(value - whole) }?.second ?: return formatNumber(value)
        return if (whole == 0.0) glyph else "${formatNumber(whole)}$glyph"
    }

    /** Owner decision (#182): an amount up to 1 reads singular ("½ clove"), so (0, 1] counts as 1. */
    fun pluralCount(quantity: Double): Double {
        val value = rounded(quantity)
        return if (value > 0 && value <= 1) 1.0 else value
    }

    fun formatItemUnit(quantity: Double): String = L10n.plural("item", pluralCount(quantity))

    /** "1 head", "½ clove", "2 tomatoes"; the generic "item"/"items" without a unit of its own. */
    fun formatCountUnit(quantity: Double, unit: CountUnit?): String {
        if (unit == null) return formatItemUnit(quantity)
        return if (PluralRules.english(pluralCount(quantity)) == "one") unit.one else unit.other
    }

    private fun joinQuantity(number: String, unit: String) = L10n.t(
        "quantity",
        mapOf("number" to number, "unit" to unit)
    )

    private val decimalMeasures = setOf("g", "ml", "g tin", "ml tin")
    private val pluralMeasures = setOf("cup", "clove", "stalk", "bunch")
    private val fixedMeasures = setOf("g", "kg", "ml", "L", "g tin", "ml tin", "tsp", "tbsp")

    /** "g" and "tbsp" never pluralise; "cup"/"cups"; an unknown measure is shown as written. */
    fun formatMeasure(quantity: Double, measure: String): String = when (measure) {
        in pluralMeasures -> L10n.plural("measure.$measure", pluralCount(quantity))
        in fixedMeasures -> L10n.t("measure.$measure")
        else -> measure
    }

    /** "37.5 g", "½ tbsp", "1½ cloves", "2 onions"; "whole" takes the item's count unit. */
    fun formatQuantity(quantity: Double, measure: String, unit: CountUnit? = null): String {
        val number = if (measure in decimalMeasures) formatNumber(quantity) else formatFraction(quantity)
        val word = if (measure == "whole") formatCountUnit(quantity, unit) else formatMeasure(quantity, measure)
        return joinQuantity(number, word)
    }

    /** "3 eggs", "1½ onions", "1 item". */
    fun formatCount(quantity: Double, unit: CountUnit?): String =
        joinQuantity(formatFraction(quantity), formatCountUnit(quantity, unit))

    /** "250 g", "1 kg", "1.5 L": never pluralised. */
    fun formatMass(amount: Double, unit: BaseUnit): String {
        val small = if (unit == BaseUnit.Ml) "ml" else "g"
        val big = if (unit == BaseUnit.Ml) "L" else "kg"
        return if (amount >= 1000) {
            joinQuantity(formatNumber(amount / 1000), L10n.t("measure.$big"))
        } else {
            joinQuantity(formatNumber(amount), L10n.t("measure.$small"))
        }
    }

    /** "2 recipes", "1 recipe". */
    fun formatRecipeCount(
        n: Int
    ): String = joinQuantity(formatNumber(n.toDouble()), L10n.plural("recipe", n.toDouble()))

    /** "2 items", "1 item". */
    fun formatItemCount(n: Int): String = joinQuantity(formatNumber(n.toDouble()), formatItemUnit(n.toDouble()))

    /** The unit word of free text: counted things are never a bare number. */
    val genericCountUnit: CountUnit get() = CountUnit(formatItemUnit(1.0), formatItemUnit(2.0))

    fun countUnitOf(item: LibraryIngredient?): CountUnit = item?.countUnit ?: genericCountUnit

    /** A recipe amount in its own unit: "37.5 g", "½ tbsp", "1½ cloves", "2 onions". */
    fun amountText(quantity: Double, measure: String, item: LibraryIngredient? = null): String =
        formatQuantity(quantity, measure, countUnitOf(item))

    /** The unit word after a recipe amount: "g", "cloves", or the item's own count unit. */
    fun measureWord(quantity: Double, measure: String, item: LibraryIngredient? = null): String =
        if (measure == "whole") formatCountUnit(quantity, countUnitOf(item)) else formatMeasure(quantity, measure)

    private val measureToBase = mapOf(
        "g" to Amount(1.0, BaseUnit.G),
        "g tin" to Amount(1.0, BaseUnit.G),
        "ml" to Amount(1.0, BaseUnit.Ml),
        "ml tin" to Amount(1.0, BaseUnit.Ml),
        "tsp" to Amount(5.0, BaseUnit.Ml),
        "tbsp" to Amount(20.0, BaseUnit.Ml),
        "cup" to Amount(250.0, BaseUnit.Ml),
        "whole" to Amount(1.0, BaseUnit.Count),
        "bunch" to Amount(1.0, BaseUnit.Count)
    )

    /** A recipe quantity as a base amount, or null when the measure is unknown for this item. */
    fun toBase(quantity: Double, measure: String, item: LibraryIngredient): Amount? {
        measureToBase[measure]?.let { return Amount(quantity * it.amount, it.unit) }
        val grams = item.measureGrams?.get(measure) ?: return null
        return Amount(quantity * grams, BaseUnit.G)
    }

    private fun isMass(unit: BaseUnit) = unit == BaseUnit.G || unit == BaseUnit.Ml

    /** Between base units: g and ml are equal; counts convert with approxGrams. */
    fun convert(amount: Amount, to: BaseUnit, item: LibraryIngredient): Double? {
        if (amount.unit == to || (isMass(amount.unit) && isMass(to))) return amount.amount
        val each = item.approxGrams ?: return null
        return if (amount.unit == BaseUnit.Count) amount.amount * each else amount.amount / each
    }

    /** The amount in the item's parts (garlic 0.3 -> 3 cloves), or null when it has none. */
    fun partsOf(amount: Double, item: LibraryIngredient?): Pair<Double, String>? {
        val measure = item?.partMeasure ?: return null
        val each = item.approxGrams ?: return null
        val grams = item.measureGrams?.get(measure) ?: return null
        return (amount * each) / grams to measure
    }

    /** "2 heads", "1½ onions"; items bought whole but used in parts read in parts until whole. */
    fun countText(amount: Double, item: LibraryIngredient?): String {
        val value = rounded(amount)
        val parts = partsOf(amount, item)
        if (parts == null || value == floor(value)) return formatCount(amount, countUnitOf(item))
        return amountText(parts.first, parts.second)
    }

    /** "3 eggs", "250 g", "1 kg", "1.5 L". */
    fun formatAmount(amount: Amount, item: LibraryIngredient? = null): String =
        if (amount.unit == BaseUnit.Count) countText(amount.amount, item) else formatMass(amount.amount, amount.unit)

    /** The unit an item is totalled in: its first sized sold option's unit, else grams. */
    fun itemUnit(item: LibraryIngredient?): BaseUnit {
        if (item == null) return BaseUnit.Count
        return item.sold.firstOrNull { it.size != null }?.size?.unit ?: BaseUnit.G
    }

    /** The recipe measure for a unit: counted items are "whole". */
    fun unitMeasure(unit: BaseUnit): String = if (unit == BaseUnit.Count) "whole" else unit.raw
}
