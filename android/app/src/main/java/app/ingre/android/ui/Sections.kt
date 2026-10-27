package app.ingre.android.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import app.ingre.android.account.AccountViewModel
import app.ingre.android.core.ChipGroup
import app.ingre.android.core.Chips
import app.ingre.android.core.Copies
import app.ingre.android.core.CopyEntry
import app.ingre.android.core.L10n
import app.ingre.android.core.LibraryIngredient
import app.ingre.android.core.LibraryRecipe
import app.ingre.android.core.RecipeCopy
import app.ingre.android.core.Search
import app.ingre.android.core.ShopSection
import app.ingre.android.core.Units
import app.ingre.android.core.capitaliseFirst
import app.ingre.android.explore.ExploreViewModel
import app.ingre.android.ingredients.IngredientsViewModel
import app.ingre.android.ingredients.ShoppingList
import app.ingre.android.recipes.RecipesViewModel

@Composable
private fun SectionCard(tag: String, depth: Depth = Depth.Section, padding: Int = 16, content: @Composable () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .surface(depth, LocalIngreColors.current)
            .padding(padding.dp)
            .testTag(tag),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) { content() }
}

/**
 * Explore (#181, #195): always on the page as an inline raised card that pushes the list down
 * (never an overlay or a sheet). Its header row expands and collapses it; ✕ collapses it too.
 * Collapsed, only the header row shows.
 */
@Composable
fun ExploreSection(explore: ExploreViewModel, account: AccountViewModel) {
    val colors = LocalIngreColors.current
    val expanded by explore.expanded.collectAsState()
    SectionCard("explore.section", Depth.Raised, 12) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            HeaderRow(L10n.t("explore.title"), expanded, "explore.toggle", Modifier.weight(1f)) { explore.toggle() }
            if (expanded) {
                Box(
                    Modifier
                        .testTag("explore.hide")
                        .touchTarget()
                        .surface(Depth.Chip, colors, RoundedCornerShape(50))
                        .clickable(role = Role.Button) { explore.collapse() }
                        .clearAndSetSemantics { contentDescription = L10n.t("explore.hide") },
                    contentAlignment = Alignment.Center
                ) { Text("✕", color = colors.text, fontWeight = FontWeight.Bold) }
            }
        }
        if (expanded) {
            Column(Modifier.testTag("explore.content"), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                ExploreContent(explore, account)
            }
        }
    }
}

@Composable
private fun ExploreContent(explore: ExploreViewModel, account: AccountViewModel) {
    val colors = LocalIngreColors.current
    val claims by account.claims.collectAsState()
    val saved by account.saved.collectAsState()
    val savedOnly by explore.savedOnly.collectAsState()
    val query by explore.query.collectAsState()
    val savedIds = saved.mapNotNull { it.libraryId }.toSet()
    if (claims != null) {
        InkButton(
            (if (savedOnly) "♥ " else "♡ ") + L10n.t("saved.filter"),
            "explore.saved",
            depth = if (savedOnly) Depth.Recessed else Depth.Raised,
            description = L10n.t(if (savedOnly) "saved.filterOn" else "saved.filterOff")
        ) { explore.setSavedOnly(!savedOnly) }
    }
    if (savedOnly && savedIds.isEmpty()) {
        Text(L10n.t("saved.empty"), color = colors.secondary)
        return
    }
    when (val results = explore.results(savedIds)) {
        is Search.Results.Browse -> RecipeGroup(L10n.t("explore.browse"), results.recipes, explore, account)

        is Search.Results.Matches -> MatchGroups(results.ingredients, results.recipes, explore, account)

        is Search.Results.None -> {
            StatusText(L10n.t("explore.noMatches", mapOf("query" to query.trim())), "explore.noMatches")
            if (results.ingredients.isNotEmpty() || results.recipes.isNotEmpty()) {
                GroupHeading(L10n.t("explore.closeMatches"))
                MatchGroups(results.ingredients, results.recipes, explore, account)
            }
            RecipeGroup(L10n.t("explore.browse"), results.browse, explore, account)
        }
    }
}

@Composable
private fun MatchGroups(
    ingredients: List<LibraryIngredient>,
    recipes: List<LibraryRecipe>,
    explore: ExploreViewModel,
    account: AccountViewModel
) {
    if (ingredients.isNotEmpty()) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            GroupHeading(L10n.t("ingredients.title"))
            for (item in ingredients) IngredientResult(item, explore.list)
        }
    }
    if (recipes.isNotEmpty()) RecipeGroup(L10n.t("recipes.title"), recipes, explore, account)
}

@Composable
private fun RecipeGroup(
    title: String,
    recipes: List<LibraryRecipe>,
    explore: ExploreViewModel,
    account: AccountViewModel
) {
    val list = explore.list
    // the rows read the list and the open rows, so this group redraws when either changes
    list.state.collectAsState().value
    explore.rows.openIds.collectAsState().value
    Column(Modifier.padding(4.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        GroupHeading(title)
        for (recipe in recipes) {
            RecipeRow(
                recipe = recipe,
                scope = "explore",
                lines = Copies.used(explore.originalLines(recipe)),
                picked = list.isPicked(recipe.id),
                open = explore.rows.isOpen(recipe.id),
                seeRecipe = true,
                recessed = false,
                tone = { list.library.tone(Chips.startSection(it)) },
                onPick = { list.togglePicked(recipe.id) },
                onOpen = { explore.rows.toggle(recipe.id) }
            ) { OriginalDetails(recipe, explore, account) }
        }
    }
}

/** An ingredient result: adds it to Extra, or opens its chip when it is on the list. */
@Composable
private fun IngredientResult(item: LibraryIngredient, list: ShoppingList) {
    val colors = LocalIngreColors.current
    list.state.collectAsState().value
    val onList = list.hasChip(item.id)
    val name = capitaliseFirst(item.name)
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Column(
            Modifier
                .fillMaxWidth()
                .touchTarget()
                .surface(Depth.Raised, colors, RoundedCornerShape(Dimens.controlRadius))
                .testTag("explore.ingredient.${item.id}")
                .clickable(role = Role.Button) { list.pick(item) }
                .clearAndSetSemantics {
                    contentDescription =
                        L10n.t(
                            if (onList) "explore.onListLabel" else "explore.add",
                            mapOf("name" to if (onList) name else item.name)
                        )
                }
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Text(
                L10n.t(if (onList) "explore.onListName" else "explore.addName", mapOf("name" to name)),
                color = colors.text,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                if (onList) {
                    L10n.t(
                        "explore.categoryOnList",
                        mapOf("category" to item.section.label)
                    )
                } else {
                    item.section.label
                },
                color = colors.secondary,
                style = MaterialTheme.typography.labelMedium
            )
        }
        AllergenTags(item.allergens)
    }
}

/** An open Explore row: the library original at 2 portions, read-only, with the heart. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun OriginalDetails(recipe: LibraryRecipe, explore: ExploreViewModel, account: AccountViewModel) {
    val colors = LocalIngreColors.current
    val lines = Copies.used(explore.originalLines(recipe))
    val claims by account.claims.collectAsState()
    val saved by account.saved.collectAsState()
    val saveError by account.saveError.collectAsState()
    if (claims != null) {
        SaveButton(
            recipe,
            saved.any {
                it.libraryId == recipe.id
            }
        ) { account.toggleSaved(recipe.id, explore.saveInput(recipe)) }
        StatusText(saveError, "save.status")
    }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        GroupHeading(L10n.t("ingredients.title"))
        FlowRow(
            Modifier.padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            for (line in lines) {
                val ink = colors.ink(explore.list.library.tone(Chips.startSection(line.item)))
                val amount = Units.amountText(line.quantity, line.measure, line.item)
                Column(
                    Modifier
                        .surface(Depth.Chip, colors, RoundedCornerShape(50), ink)
                        .clearAndSetSemantics { contentDescription = "${line.displayName}, $amount" }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        line.displayName,
                        color = ink,
                        fontWeight = FontWeight.SemiBold,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(amount, color = ink, style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
    MethodAndNotes(recipe, Copies.notes(lines))
}

/** Recipes (#179, #182): the raised section with the picked copies recessed into it. */
@Composable
fun RecipesSection(recipes: RecipesViewModel, account: AccountViewModel) {
    val colors = LocalIngreColors.current
    val entries by recipes.entries.collectAsState()
    val open by recipes.sectionOpen.collectAsState()
    val openIds by recipes.rows.openIds.collectAsState()
    val list = recipes.list
    SectionCard("recipes.section") {
        HeaderRow(L10n.t("recipes.title"), open, "recipes.header", summary = recipes.summary(entries)) {
            recipes.sectionOpen.value = !open
        }
        if (open) {
            if (entries.isEmpty()) {
                Text(L10n.t("recipes.empty"), color = colors.secondary)
            } else {
                for (entry in entries) {
                    RecipeRow(
                        recipe = entry.recipe,
                        scope = "recipes",
                        lines = recipes.closedNames(entry),
                        picked = true,
                        open = entry.recipe.id in openIds,
                        seeRecipe = false,
                        recessed = true,
                        tone = { list.library.tone(Chips.startSection(it)) },
                        onPick = { list.togglePicked(entry.recipe.id) },
                        onOpen = { recipes.rows.toggle(entry.recipe.id) }
                    ) { RecipeDetails(entry, recipes, account) }
                }
            }
        }
    }
}

/** An open Recipes row: the heart, portions, the copy's editable chips with the plus, the customisations, method and notes. */
@Composable
private fun RecipeDetails(entry: CopyEntry, recipes: RecipesViewModel, account: AccountViewModel) {
    val colors = LocalIngreColors.current
    val list = recipes.list
    val scope = ChipScope.row(entry.recipe.id)
    val claims by account.claims.collectAsState()
    val saved by account.saved.collectAsState()
    val saveError by account.saveError.collectAsState()
    val addingTo by recipes.addingTo.collectAsState()
    list.state.collectAsState().value
    if (claims != null) {
        SaveButton(entry.recipe, saved.any { it.libraryId == entry.recipe.id }) {
            account.toggleSaved(entry.recipe.id, Copies.saveInput(entry.recipe, entry.copy, list.library))
        }
        StatusText(saveError, "save.status")
    }
    Row(
        Modifier.clearAndSetSemantics {
            contentDescription = L10n.t("row.portions")
            stateDescription = L10n.t("row.portionsValue", mapOf("count" to entry.copy.portions.toString()))
        },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("${L10n.t("row.portions")}: ${entry.copy.portions}", Modifier.weight(1f), color = colors.text)
        InkButton(
            "−",
            "recipes.portions.less.${entry.recipe.id}",
            enabled =
                entry.copy.portions > RecipeCopy.MIN_PORTIONS
        ) {
            list.setPortions(entry.recipe.id, entry.copy.portions - 1)
        }
        InkButton(
            "+",
            "recipes.portions.more.${entry.recipe.id}",
            enabled =
                entry.copy.portions < RecipeCopy.MAX_PORTIONS
        ) {
            list.setPortions(entry.recipe.id, entry.copy.portions + 1)
        }
    }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        GroupHeading(L10n.t("ingredients.title"))
        val chips = recipes.chips(entry)
        ChipGroups(
            listOf(ChipGroup(ShopSection.Other, chips)),
            scope,
            list,
            showHeadings = false,
            onlyRecipe = entry.recipe.id
        )
        val addLabel = L10n.t("plus.addTo", mapOf("recipe" to entry.label))
        if (addingTo == entry.recipe.id) {
            PlusArea(
                addLabel,
                "recipes.plus.${entry.recipe.id}",
                list,
                mark = { item -> if (chips.any { it.id == item.id }) L10n.t("plus.inRecipe") else null },
                onPick = { recipes.add(it, entry) },
                onClose = { recipes.toggleAdding(entry.recipe.id) }
            )
        } else {
            InkButton("+", "recipes.add.${entry.recipe.id}", description = addLabel) {
                recipes.toggleAdding(entry.recipe.id)
            }
        }
    }
    val bullets = recipes.bullets(entry)
    if (bullets.isNotEmpty()) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            GroupHeading(L10n.t("row.customisations"))
            for (bullet in bullets) Text("• $bullet", color = colors.text)
        }
    }
    MethodAndNotes(entry.recipe, recipes.notes(entry))
}

/** Ingredients (#179, #182): every chip by shop section, Refresh with its question inline (no dialog). */
@Composable
fun IngredientsSection(ingredients: IngredientsViewModel) {
    val colors = LocalIngreColors.current
    val ui by ingredients.ui.collectAsState()
    val open by ingredients.ingredientsOpen.collectAsState()
    val asking by ingredients.askingRefresh.collectAsState()
    val message by ingredients.list.message.collectAsState()
    val state by ingredients.list.state.collectAsState()
    SectionCard("ingredients.section") {
        HeaderRow(L10n.t("ingredients.title"), open, "ingredients.header", summary = ui.summary) {
            ingredients.ingredientsOpen.value = !open
        }
        if (open) {
            if (ui.chips.isEmpty()) {
                Text(L10n.t("ingredients.empty"), color = colors.secondary)
            } else {
                if (asking) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(L10n.t("ingredients.refreshQuestion"), color = colors.text)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            InkButton(L10n.t("chip.yes"), "ingredients.refresh.yes") { ingredients.refresh() }
                            InkButton(L10n.t("chip.no"), "ingredients.refresh.no") { ingredients.askRefresh(false) }
                        }
                    }
                } else if (state.copies.isNotEmpty()) {
                    InkButton(L10n.t("ingredients.refresh"), "ingredients.refresh") { ingredients.askRefresh(true) }
                }
                ChipGroups(ui.groups, ChipScope.ingredients, ingredients.list)
            }
            StatusText(message, "ingredients.status")
        }
    }
}

/** Extra (#181): staples and anything else, added from the plus area's category tabs. */
@Composable
fun ExtraSection(ingredients: IngredientsViewModel) {
    val colors = LocalIngreColors.current
    val ui by ingredients.ui.collectAsState()
    val open by ingredients.extraOpen.collectAsState()
    val adding by ingredients.addingExtra.collectAsState()
    val list = ingredients.list
    val extraCount = ui.chips.count { it.extra != null }
    SectionCard("extra.section") {
        HeaderRow(L10n.t("extra.title"), open, "extra.header", summary = Units.formatItemCount(extraCount)) {
            ingredients.extraOpen.value = !open
        }
        if (open) {
            if (extraCount == 0) {
                Text(L10n.t("extra.empty"), color = colors.secondary)
            } else {
                ChipGroups(ui.extraGroups, ChipScope.extra, list)
            }
            if (adding) {
                PlusArea(
                    L10n.t("plus.add"),
                    "extra.plus",
                    list,
                    mark = { if (list.hasChip(it.id)) L10n.t("plus.onList") else null },
                    onPick = { list.pick(it) },
                    onClose = { ingredients.toggleAddingExtra() }
                )
            } else {
                InkButton("+ " + L10n.t("plus.add"), "extra.add", description = L10n.t("plus.add")) {
                    ingredients.toggleAddingExtra()
                }
            }
        }
    }
}
