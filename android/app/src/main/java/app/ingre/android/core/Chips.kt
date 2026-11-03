package app.ingre.android.core

import kotlinx.serialization.Serializable

/** Something added by hand to Extra: a catalogue item (or free text), with a whole quantity. */
@Serializable
data class Extra(
    val id: String,
    val name: String,
    /** catalogue id, or null for free text (stored as `"ingredientId": null`, as on the web) */
    val ingredientId: String?,
    val quantity: Int
) {
    val chipId: String get() = ingredientId ?: id

    companion object {
        fun catalogue(item: LibraryIngredient, quantity: Int = 1) = Extra(item.id, item.name, item.id, quantity)
    }
}

/** A chip's category edit (`ingre.chips.edits`); null keeps the catalogue's. */
@Serializable
data class ChipEdit(val section: ShopSection? = null)

/** A picked recipe's copy with what the chips need from it. */
data class CopyEntry(
    val copy: RecipeCopy,
    val recipe: LibraryRecipe,
    /** the recipe's name, with "(2)" on a repeat */
    val label: String,
    val lines: List<CopyLine>
)

/** One source of a chip's amount: a recipe's need (in its own unit) or the Extra amount. */
sealed interface ChipSource {
    val key: String
    val quantity: Double

    /** The box's visible label: the recipe's name, or "Extra". */
    val label: String
    val removed: Boolean
    val customised: Boolean
    val isRecipe: Boolean get() = this is Recipe

    data class Recipe(
        val recipeId: String,
        override val label: String,
        override val quantity: Double,
        val measure: String,
        override val removed: Boolean,
        override val customised: Boolean
    ) : ChipSource {
        override val key: String get() = recipeId
    }

    data class ExtraAmount(override val quantity: Double) : ChipSource {
        override val key: String get() = "extra"
        override val label: String get() = L10n.t("chip.extraSource")
        override val removed: Boolean get() = false
        override val customised: Boolean get() = false
    }
}

/** One chip: an item, its sources, its total, where it sits and whether it is crossed off. */
data class Chip(
    val id: String,
    val name: String,
    val item: LibraryIngredient?,
    val unit: BaseUnit,
    val sources: List<ChipSource>,
    val total: Amount,
    /** the Extra amount, or null when the item is not in Extra */
    val extra: Int?,
    val section: ShopSection,
    val crossed: Boolean,
    /** every recipe removed it and it is not in Extra (#182) */
    val greyed: Boolean,
    /** a recipe copy changed, added or removed it (#182) */
    val customised: Boolean
) {
    val displayName: String get() = capitaliseFirst(name)
    val recipeSources: List<ChipSource> get() = sources.filter { it.isRecipe }
}

data class ChipGroup(val section: ShopSection, val chips: List<Chip>)

data class ChipState(val edits: Map<String, ChipEdit> = emptyMap(), val crossedIds: Set<String> = emptySet())

object Chips {
    /** A recipe's label, with "(2)", "(3)" when earlier recipes have the same name (#182). */
    fun sourceLabel(earlier: List<String>, name: String): String {
        val seen = earlier.count { it == name }
        return if (seen == 0) name else L10n.t("sourceLabel", mapOf("name" to name, "n" to (seen + 1).toString()))
    }

    /** The picked copies with their recipes, labels and lines; unknown recipes are skipped. */
    fun entries(copies: List<RecipeCopy>, library: Library): List<CopyEntry> {
        val known = copies.mapNotNull { copy -> library.recipe(copy.recipeId)?.let { copy to it } }
        val names = known.map { it.second.name }
        return known.mapIndexed { index, (copy, recipe) ->
            CopyEntry(copy, recipe, sourceLabel(names.take(index), recipe.name), Copies.lines(recipe, copy, library))
        }
    }

    /** One recipe source's amount in the chip's unit; the raw number when it can't convert. */
    fun sourceAmount(source: ChipSource, item: LibraryIngredient?, unit: BaseUnit): Double {
        if (source !is ChipSource.Recipe) return source.quantity
        if (source.removed) return 0.0
        if (item == null) return source.quantity
        val base = Units.toBase(source.quantity, source.measure, item) ?: return source.quantity
        return Units.convert(base, unit, item) ?: source.quantity
    }

    /** The chip's total: every recipe need plus Extra, never rounded (#182). */
    fun total(sources: List<ChipSource>, item: LibraryIngredient?, unit: BaseUnit): Amount =
        Amount(sources.sumOf { sourceAmount(it, item, unit) }, unit)

    /** The item's own category, or Other for free text. */
    fun startSection(item: LibraryIngredient?): ShopSection = item?.section ?: ShopSection.Other

    private fun recipeSources(id: String, entries: List<CopyEntry>): List<ChipSource> = entries.flatMap { entry ->
        entry.lines.filter { it.ingredientId == id }.map { line ->
            ChipSource.Recipe(
                entry.recipe.id,
                entry.label,
                line.quantity,
                line.measure,
                line.quantity == 0.0,
                entry.copy.isCustomised(id)
            )
        }
    }

    /**
     * Every chip (#182): recipe ingredients, staples included, in first-seen order, then extras
     * no recipe uses. Each lists its recipe sources and its Extra.
     */
    fun build(entries: List<CopyEntry>, extras: List<Extra>, state: ChipState, library: Library): List<Chip> {
        val ids = (entries.flatMap { e -> e.lines.map { it.ingredientId } } + extras.map { it.chipId }).distinct()
        return ids.map { id ->
            val extra = extras.firstOrNull { it.chipId == id }
            val item = library.item(id)
            val recipes = recipeSources(id, entries)
            val sources = recipes + listOfNotNull(extra?.let { ChipSource.ExtraAmount(it.quantity.toDouble()) })
            val unit = Units.itemUnit(item)
            Chip(
                id = id,
                name = item?.name ?: extra?.name ?: id,
                item = item,
                unit = unit,
                sources = sources,
                total = total(sources, item, unit),
                extra = extra?.quantity,
                section = state.edits[id]?.section ?: startSection(item),
                crossed = id in state.crossedIds,
                greyed = extra == null && recipes.all { it.removed },
                customised = recipes.any { it.customised }
            )
        }
    }

    /** Chips by category, categories in shop order; chip order is kept. */
    fun groups(chips: List<Chip>): List<ChipGroup> = ShopSection.entries.mapNotNull { section ->
        chips.filter { it.section == section }.takeIf { it.isNotEmpty() }?.let { ChipGroup(section, it) }
    }

    /** "in 2 recipes", "in 1 recipe and Extra", "in Extra" or "removed from every recipe". */
    fun usedInSummary(chip: Chip): String {
        val n = chip.recipeSources.count { !it.removed }
        if (n == 0) return L10n.t(if (chip.extra == null) "usedIn.nowhere" else "usedIn.extraOnly")
        return L10n.t(
            if (chip.extra == null) "usedIn.recipes" else "usedIn.recipesAndExtra",
            mapOf("recipes" to Units.formatRecipeCount(n))
        )
    }

    /**
     * A recipe row's chips (#182): every ingredient of the copy at its portions; crossed off is
     * the same state as everywhere else, and a removed one is greyed at 0.
     */
    fun rowChips(entry: CopyEntry, state: ChipState): List<Chip> = entry.lines.map { line ->
        val unit = Units.itemUnit(line.item)
        val source = ChipSource.Recipe(
            entry.recipe.id,
            entry.label,
            line.quantity,
            line.measure,
            line.quantity == 0.0,
            entry.copy.isCustomised(line.ingredientId)
        )
        Chip(
            id = line.ingredientId,
            name = line.name,
            item = line.item,
            unit = unit,
            sources = listOf(source),
            total = total(listOf(source), line.item, unit),
            extra = null,
            section = state.edits[line.ingredientId]?.section ?: startSection(line.item),
            crossed = line.ingredientId in state.crossedIds,
            greyed = source.removed,
            customised = source.customised
        )
    }

    /** The chip's amount (#182): its total, "1 kg" rather than packs. */
    fun amount(chip: Chip): String = Units.formatAmount(chip.total, chip.item)

    /** The Extra amount, in the chip's unit. */
    fun extraAmount(chip: Chip): String = Units.formatAmount(Amount((chip.extra ?: 0).toDouble(), chip.unit), chip.item)

    /** A row chip's amount: its one source, in the recipe's own unit. */
    fun rowAmount(chip: Chip): String = chip.sources.joinToString(L10n.t("chip.amountSeparator")) {
        Units.amountText(it.quantity, measureOf(it, chip), chip.item)
    }

    /** A source's measure: the recipe's own, or the chip's unit for Extra. */
    fun measureOf(source: ChipSource, chip: Chip): String =
        if (source is ChipSource.Recipe) source.measure else Units.unitMeasure(chip.unit)

    /** The unit after a box: "g", "tbsp", "cloves", "heads" (never a bare number). */
    fun sourceUnit(source: ChipSource, chip: Chip): String =
        Units.measureWord(source.quantity, measureOf(source, chip), chip.item)

    /** "Butter chicken, butter (g)". */
    fun sourceAccessibilityLabel(source: ChipSource, chip: Chip): String = L10n.t(
        "chip.sourceLabel",
        mapOf("source" to source.label, "name" to chip.name, "unit" to sourceUnit(source, chip))
    )

    /**
     * What TalkBack reads for a chip: name, amount, category, where it is used, and crossed off
     * when it is.
     */
    fun accessibilityLabel(chip: Chip, amount: String): String =
        (
            listOf(chip.displayName, amount, chip.section.label, usedInSummary(chip)) +
                if (chip.crossed) listOf(L10n.t("chip.crossedOff")) else emptyList()
            ).joinToString(L10n.t("chip.labelSeparator"))

    /** "5 items", "5 items, 2 crossed off". */
    fun ingredientsSummary(chips: List<Chip>): String {
        val crossed = chips.count { it.crossed }
        val items = Units.formatItemCount(chips.size)
        return if (crossed == 0) {
            items
        } else {
            L10n.t("ingredients.summaryCrossed", mapOf("items" to items, "count" to crossed.toString()))
        }
    }
}
