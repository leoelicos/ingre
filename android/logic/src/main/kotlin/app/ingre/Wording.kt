package app.ingre

import kotlin.math.floor
import kotlin.math.round

/** A counted item's unit word, singular and plural. Matches the web `CountUnit`. */
data class CountUnit(val one: String, val other: String)

/** Something the wording can total: the fields the web helper reads (#182). */
data class CountedItem(
    val countUnit: CountUnit? = null,
    val partMeasure: String? = null,
    val approxGrams: Double? = null,
    val measureGrams: Map<String, Double>? = null
)

data class Amount(val amount: Double, val unit: String)

data class Parts(val quantity: Double, val measure: String)

data class SoldSize(val amount: Double, val unit: String)

data class SoldOption(val type: String, val size: SoldSize?)

/** Two decimals at most, half away from zero, matching the web `rounded`. */
fun rounded(n: Double): Double = round(n * 100.0) / 100.0

/** A plain decimal, two places at most and no grouping. Never "-0". */
fun formatNumber(n: Double): String {
    val value = rounded(n)
    if (value == 0.0) return "0"
    val whole = value.toLong()
    if (value == whole.toDouble()) return whole.toString()
    return String.format(java.util.Locale.US, "%.2f", value).trimEnd('0').trimEnd('.')
}

private val FRACTIONS = listOf(0.25 to "¼", 0.5 to "½", 0.75 to "¾")

/** Quarters as glyphs, otherwise a plain decimal. */
fun formatFraction(n: Double): String {
    val value = rounded(n)
    val whole = floor(value).toInt()
    val glyph = FRACTIONS.find { it.first == rounded(value - whole) }?.second
    return when {
        glyph == null -> formatNumber(value)
        whole == 0 -> glyph
        else -> formatNumber(whole.toDouble()) + glyph
    }
}

/**
 * The count a unit word is chosen by. Up to 1 reads singular ("½ clove", "1 head"),
 * so (0, 1] counts as 1. Anything else is the rounded amount.
 */
fun pluralCount(quantity: Double): Double {
    val value = rounded(quantity)
    return if (value > 0.0 && value <= 1.0) 1.0 else value
}

private fun singular(quantity: Double): Boolean = pluralCount(quantity) == 1.0

fun formatItemUnit(quantity: Double): String = if (singular(quantity)) "item" else "items"

fun formatCountUnit(quantity: Double, unit: CountUnit?): String =
    when {
        unit == null -> formatItemUnit(quantity)
        singular(quantity) -> unit.one
        else -> unit.other
    }

private val PLURAL = mapOf(
    "cup" to "cups",
    "clove" to "cloves",
    "stalk" to "stalks",
    "bunch" to "bunches"
)

/** A recipe measure's word. Spoons, weights and volumes never pluralise. */
fun formatMeasure(quantity: Double, measure: String): String =
    if (singular(quantity)) measure else PLURAL[measure] ?: measure

private val DECIMAL_MEASURES = setOf("g", "ml", "g tin", "ml tin")

private fun joinQuantity(number: String, unit: String): String = "$number $unit"

/** A recipe amount in its own unit: "37.5 g", "½ tbsp", "1½ cloves", "2 onions". */
fun formatQuantity(quantity: Double, measure: String, unit: CountUnit? = null): String {
    val number = if (measure in DECIMAL_MEASURES) formatNumber(quantity) else formatFraction(quantity)
    val word = if (measure == "whole") formatCountUnit(quantity, unit) else formatMeasure(quantity, measure)
    return joinQuantity(number, word)
}

/** A counted amount: "3 eggs", "1½ onions", "1 item". */
fun formatCount(quantity: Double, unit: CountUnit?): String =
    joinQuantity(formatFraction(quantity), formatCountUnit(quantity, unit))

/** A weight or volume, never pluralised. Switches to kg and L from 1000. */
fun formatMass(amount: Double, unit: String): String =
    if (amount >= 1000.0) {
        val big = if (unit == "g") "kg" else "L"
        joinQuantity(formatNumber(amount / 1000.0), big)
    } else {
        joinQuantity(formatNumber(amount), unit)
    }

private val MEASURE_TO_BASE = mapOf(
    "g" to Amount(1.0, "g"),
    "g tin" to Amount(1.0, "g"),
    "ml" to Amount(1.0, "ml"),
    "ml tin" to Amount(1.0, "ml"),
    "tsp" to Amount(5.0, "ml"),
    "tbsp" to Amount(20.0, "ml"),
    "cup" to Amount(250.0, "ml"),
    "whole" to Amount(1.0, "count"),
    "bunch" to Amount(1.0, "count")
)

fun toBase(quantity: Double, measure: String, measureGrams: Map<String, Double>?): Amount? {
    val direct = MEASURE_TO_BASE[measure]
    if (direct != null) return Amount(quantity * direct.amount, direct.unit)
    val grams = measureGrams?.get(measure) ?: return null
    return Amount(quantity * grams, "g")
}

private fun isMass(unit: String): Boolean = unit == "g" || unit == "ml"

fun convert(amount: Amount, to: String, approxGrams: Double?): Double? {
    if (amount.unit == to || (isMass(amount.unit) && isMass(to))) return amount.amount
    val each = approxGrams ?: return null
    return if (amount.unit == "count") amount.amount * each else amount.amount / each
}

fun partsOf(amount: Double, item: CountedItem?): Parts? {
    val measure = item?.partMeasure ?: return null
    val each = item.approxGrams ?: return null
    val grams = item.measureGrams?.get(measure) ?: return null
    return Parts((amount * each) / grams, measure)
}

private fun isWhole(n: Double): Boolean {
    val value = rounded(n)
    return value == floor(value)
}

/** A counted total. Parts until the total is a whole item, then the item's own unit. */
fun countText(amount: Double, item: CountedItem?): String {
    val parts = partsOf(amount, item)
    return if (parts == null || isWhole(amount)) formatCount(amount, item?.countUnit)
    else formatQuantity(parts.quantity, parts.measure)
}

fun formatAmount(amount: Amount, item: CountedItem? = null): String =
    if (amount.unit == "count") countText(amount.amount, item) else formatMass(amount.amount, amount.unit)

/** The unit an item is totalled in: its first sized sold option, else grams. Free text is counted. */
fun itemUnit(sold: List<SoldOption>?): String =
    if (sold == null) "count" else sold.firstOrNull { it.size != null }?.size?.unit ?: "g"

fun unitMeasure(unit: String): String = if (unit == "count") "whole" else unit
