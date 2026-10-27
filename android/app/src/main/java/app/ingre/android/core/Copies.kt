package app.ingre.android.core

import kotlin.math.abs
import kotlin.math.roundToInt
import kotlinx.serialization.Serializable

/**
 * Recipe copies (#182, #195): one per picked recipe, with its own portions and the per-serve
 * amounts that differ from the library original. A port of client/src/utils/balance/copies.ts.
 */
@Serializable
data class RecipeCopy(
    val recipeId: String,
    /** whole number from 1 to 12 */
    val portions: Int = DEFAULT_PORTIONS,
    /** per-serve amounts in recipe units that differ from the original; 0 is removed */
    val amounts: Map<String, Double> = emptyMap()
) {
    fun isCustomised(ingredientId: String): Boolean = ingredientId in amounts

    companion object {
        const val DEFAULT_PORTIONS = 2
        const val MIN_PORTIONS = 1
        const val MAX_PORTIONS = 12

        fun clampPortions(portions: Double): Int {
            if (!portions.isFinite()) return DEFAULT_PORTIONS
            return portions.roundToInt().coerceIn(MIN_PORTIONS, MAX_PORTIONS)
        }
    }
}

/** One ingredient of a copy at its portions, in recipe units. */
data class CopyLine(
    val ingredientId: String,
    val name: String,
    val item: LibraryIngredient?,
    /** 0 when removed */
    val quantity: Double,
    val measure: String,
    /** the original amount at these portions, or null when the user added it */
    val original: Double?
) {
    val displayName: String get() = capitaliseFirst(name)
}

/** What saveRecipe takes (server RecipeInput), independent of the generated GraphQL types. */
data class RecipeInputValue(
    val name: String,
    val portions: Int,
    val pictureUrl: String,
    val libraryId: String,
    val ingredients: List<Ingredient>,
    val customisations: CustomisationsValue
) {
    data class Ingredient(
        val name: String,
        val quantity: Double,
        val measure: String,
        val category: String,
        val ingredientId: String
    )
}

data class CustomisationsValue(
    val added: List<Added> = emptyList(),
    val removed: List<Removed> = emptyList(),
    val changed: List<Changed> = emptyList(),
    val portions: Portions? = null
) {
    data class Added(val ingredientId: String, val to: Double)

    data class Removed(val ingredientId: String, val from: Double)

    data class Changed(val ingredientId: String, val from: Double, val to: Double)

    data class Portions(val from: Int, val to: Int)
}

object Copies {
    const val PLACEHOLDER_PICTURE = "/ingre.png"

    /** The measure an added ingredient is written in: its base unit ("g", "ml", "whole"). */
    fun addedMeasure(item: LibraryIngredient?): String = Units.unitMeasure(Units.itemUnit(item))

    /**
     * Every ingredient of the copy: the original ones (removed at 0), then the added ones by
     * name. The web keeps added ones in insertion order; both native apps sort them by name.
     */
    fun lines(recipe: LibraryRecipe, copy: RecipeCopy, library: Library): List<CopyLine> {
        val originalIds = recipe.ingredients.map { it.ingredientId }.toSet()
        val originals = recipe.ingredients.map { ri ->
            val perServe = ri.quantity / recipe.portions
            val amount = copy.amounts[ri.ingredientId] ?: perServe
            val item = library.item(ri.ingredientId)
            CopyLine(
                ri.ingredientId,
                item?.name ?: ri.ingredientId,
                item,
                amount * copy.portions,
                ri.measure,
                perServe * copy.portions
            )
        }
        val added = copy.amounts
            .filterKeys { it !in originalIds }
            .map { (id, amount) ->
                val item = library.item(id)
                CopyLine(id, item?.name ?: id, item, amount * copy.portions, addedMeasure(item), null)
            }
            .sortedBy { it.name }
        return originals + added
    }

    /** The ingredients the copy still uses (not removed). */
    fun used(lines: List<CopyLine>): List<CopyLine> = lines.filter { it.quantity > 0 }

    /**
     * The copy with one ingredient set to [quantity] at its portions. The original amount
     * clears the edit, and 0 on an added ingredient takes it off again.
     */
    fun withAmount(copy: RecipeCopy, recipe: LibraryRecipe, ingredientId: String, quantity: Double): RecipeCopy {
        val perServe = maxOf(0.0, quantity) / copy.portions
        val original = recipe.ingredients.firstOrNull { it.ingredientId == ingredientId }
        val unchanged = if (original != null) {
            abs(perServe - original.quantity / recipe.portions) < 1e-9
        } else {
            perServe == 0.0
        }
        val amounts = if (unchanged) copy.amounts - ingredientId else copy.amounts + (ingredientId to perServe)
        return copy.copy(amounts = amounts)
    }

    fun withPortions(copy: RecipeCopy, portions: Double): RecipeCopy =
        copy.copy(portions = RecipeCopy.clampPortions(portions))

    /** Refresh (#182): back to the original at the default portions. */
    fun reset(copy: RecipeCopy): RecipeCopy = RecipeCopy(copy.recipeId)

    /** The copy's differences from the original, as saveRecipe takes them (#182). */
    fun customisations(lines: List<CopyLine>, copy: RecipeCopy): CustomisationsValue {
        val added = mutableListOf<CustomisationsValue.Added>()
        val removed = mutableListOf<CustomisationsValue.Removed>()
        val changed = mutableListOf<CustomisationsValue.Changed>()
        for (line in lines.filter { copy.isCustomised(it.ingredientId) }) {
            val original = line.original
            when {
                original == null -> added += CustomisationsValue.Added(line.ingredientId, Units.rounded(line.quantity))

                line.quantity == 0.0 ->
                    removed +=
                        CustomisationsValue.Removed(line.ingredientId, Units.rounded(original))

                else -> changed += CustomisationsValue.Changed(
                    line.ingredientId,
                    Units.rounded(original),
                    Units.rounded(line.quantity)
                )
            }
        }
        val portions = if (copy.portions != RecipeCopy.DEFAULT_PORTIONS) {
            CustomisationsValue.Portions(RecipeCopy.DEFAULT_PORTIONS, copy.portions)
        } else {
            null
        }
        return CustomisationsValue(added, removed, changed, portions)
    }

    private fun bullet(line: CopyLine): String {
        val original = line.original
            ?: return L10n.t(
                "customisation.added",
                mapOf("name" to line.name, "amount" to Units.amountText(line.quantity, line.measure, line.item))
            )
        if (line.quantity == 0.0) return L10n.t("customisation.removed", mapOf("name" to line.displayName))
        return L10n.t(
            "customisation.changed",
            mapOf(
                "name" to line.displayName,
                "from" to Units.amountText(original, line.measure, line.item),
                "to" to Units.amountText(line.quantity, line.measure, line.item)
            )
        )
    }

    private fun rank(line: CopyLine): Int = when {
        line.original == null -> 0
        line.quantity == 0.0 -> 1
        else -> 2
    }

    /**
     * The bullets under Customisations (#182): "Added red chilli 1 item", "Butter removed",
     * "Butter 25 g → 37.5 g", "Portions 2 → 4".
     */
    fun bullets(lines: List<CopyLine>, copy: RecipeCopy): List<String> {
        val edited = lines.withIndex()
            .filter { copy.isCustomised(it.value.ingredientId) }
            .sortedWith(compareBy({ rank(it.value) }, { it.index }))
            .map { bullet(it.value) }
        val portions = if (copy.portions == RecipeCopy.DEFAULT_PORTIONS) {
            emptyList()
        } else {
            listOf(
                L10n.t(
                    "customisation.portions",
                    mapOf("from" to RecipeCopy.DEFAULT_PORTIONS.toString(), "to" to copy.portions.toString())
                )
            )
        }
        return edited + portions
    }

    /** The saveRecipe input for a copy (#182): its ingredients with catalogue ids, and its differences. */
    fun saveInput(recipe: LibraryRecipe, copy: RecipeCopy, library: Library): RecipeInputValue {
        val all = lines(recipe, copy, library)
        return RecipeInputValue(
            name = recipe.name,
            portions = copy.portions,
            pictureUrl = PLACEHOLDER_PICTURE,
            libraryId = recipe.id,
            ingredients = used(all).map {
                RecipeInputValue.Ingredient(
                    it.name,
                    Units.rounded(it.quantity),
                    it.measure,
                    it.item?.category ?: "other",
                    it.ingredientId
                )
            },
            customisations = customisations(all, copy)
        )
    }

    /** The notes under the method (#182): allergens of the ingredients used. */
    fun notes(lines: List<CopyLine>): List<String> {
        val allergens = used(lines).mapNotNull { it.item }.flatMap { item -> item.allergens.map { it.lowercase() } }
            .toSortedSet()
        if (allergens.isEmpty()) return emptyList()
        return listOf(
            L10n.t("allergens.contains", mapOf("list" to allergens.joinToString(L10n.t("allergens.separator"))))
        )
    }
}
