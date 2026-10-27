package app.ingre.android.ui

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.drawOutline
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import app.ingre.android.core.Chip
import app.ingre.android.core.ChipGroup
import app.ingre.android.core.ChipSource
import app.ingre.android.core.Chips
import app.ingre.android.core.L10n
import app.ingre.android.core.LibraryIngredient
import app.ingre.android.core.ShopSection
import app.ingre.android.core.Units
import app.ingre.android.core.capitaliseFirst
import app.ingre.android.ingredients.ShoppingList

private val pill = RoundedCornerShape(50)

/** How a set of chips behaves (#182): Ingredients ("chip"), Extra ("extra") or a recipe row ("row-<id>"). */
data class ChipScope(val id: String, val amount: (Chip) -> String) {
    companion object {
        val ingredients = ChipScope("chip", Chips::amount)
        val extra = ChipScope("extra", Chips::extraAmount)

        fun row(recipeId: String) = ChipScope("row-$recipeId", Chips::rowAmount)
    }
}

/**
 * An editable chip (#179, #181): a raised pill outlined in its section's ink. A tap anywhere
 * crosses it off (strike-through, pressed in; never faded); the chevron opens its panel. Removed
 * from every recipe it is flat and dashed, and can't be crossed off.
 */
@Composable
fun EditableChip(chip: Chip, scope: ChipScope, list: ShoppingList, panelOpen: Boolean) {
    val colors = LocalIngreColors.current
    val ink = if (chip.greyed) colors.secondary else colors.ink(list.library.tone(chip.section))
    val amount = scope.amount(chip)
    val outline = if (chip.greyed) {
        Modifier.drawBehind {
            val stroke =
                Stroke(
                    width = 2.dp.toPx(),
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(5.dp.toPx(), 4.dp.toPx()))
                )
            drawOutline(pill.createOutline(size, layoutDirection, this), colors.secondary, style = stroke)
        }
    } else {
        Modifier.surface(if (chip.crossed) Depth.PressedChip else Depth.Chip, colors, pill, ink)
    }
    Row(outline.padding(end = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        Row(
            Modifier
                .testTag("${scope.id}.chip.${chip.id}")
                .clickable(enabled = !chip.greyed, role = Role.Checkbox) { list.toggleCrossed(chip.id) }
                .clearAndSetSemantics {
                    contentDescription = Chips.accessibilityLabel(chip, amount)
                    selected = chip.crossed
                }
                .touchTarget()
                .padding(start = 12.dp, top = 4.dp, bottom = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(Modifier.size(20.dp).border(2.dp, ink, RoundedCornerShape(5.dp)), contentAlignment = Alignment.Center) {
                if (chip.crossed) {
                    Text(
                        "✓",
                        color = ink,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Column {
                Text(
                    chip.displayName,
                    color = ink,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    textDecoration = crossedDecoration(chip.crossed)
                )
                Text(
                    amount,
                    color = ink,
                    style = MaterialTheme.typography.labelMedium,
                    textDecoration = crossedDecoration(chip.crossed)
                )
            }
        }
        Box(
            Modifier
                .testTag("${scope.id}.chevron.${chip.id}")
                .clickable(role = Role.Button) { list.togglePanel(scope.id, chip.id) }
                .clearAndSetSemantics {
                    contentDescription = L10n.t("chip.details", mapOf("name" to chip.displayName))
                    stateDescription = expandedText(panelOpen)
                }
                .touchTarget(),
            contentAlignment = Alignment.Center
        ) { Chevron(panelOpen) }
    }
}

/** Chips by section, with each open chip's panel inline under its group (never a sheet). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ChipGroups(
    groups: List<ChipGroup>,
    scope: ChipScope,
    list: ShoppingList,
    showHeadings: Boolean = true,
    onlyRecipe: String? = null
) {
    val panels by list.openPanels.collectAsState()
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        for (group in groups) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if (showHeadings) GroupHeading(group.section.label)
                FlowRow(
                    Modifier.padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    for (chip in group.chips) EditableChip(chip, scope, list, panels[scope.id] == chip.id)
                }
                group.chips.firstOrNull { panels[scope.id] == it.id }?.let { ChipPanel(it, scope, list, onlyRecipe) }
            }
        }
    }
}

/**
 * A chip's panel (#182): a number box per source (recipe or Extra), each with its remove
 * question, then the total, allergens and the category.
 */
@Composable
fun ChipPanel(chip: Chip, scope: ChipScope, list: ShoppingList, onlyRecipe: String?) {
    val colors = LocalIngreColors.current
    val sources = if (onlyRecipe ==
        null
    ) {
        chip.sources
    } else {
        chip.sources.filter { it is ChipSource.Recipe && it.recipeId == onlyRecipe }
    }
    var asking by remember(chip.id) { mutableStateOf<String?>(null) }
    var categories by remember { mutableStateOf(false) }
    Column(
        Modifier
            .fillMaxWidth()
            .surface(Depth.Recessed, colors, outline = colors.ink(list.library.tone(chip.section)))
            .padding(12.dp)
            .testTag("${scope.id}.panel.${chip.id}"),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        for (source in sources) {
            SourceField(chip, source, scope, list, asking == source.key, { asking = it })
        }
        Text(
            L10n.t("chip.total", mapOf("amount" to Chips.amount(chip))),
            color = colors.text,
            fontWeight = FontWeight.SemiBold
        )
        AllergenTags(chip.item?.allergens ?: emptyList())
        Box {
            InkButton(
                "${L10n.t("chip.category")}: ${chip.section.label}",
                "${scope.id}.category.${chip.id}"
            ) { categories = true }
            DropdownMenu(expanded = categories, onDismissRequest = { categories = false }) {
                for (section in ShopSection.entries) {
                    DropdownMenuItem(
                        text = { Text(section.label) },
                        onClick = {
                            categories = false
                            list.setCategory(chip.id, section)
                        },
                        modifier = Modifier.touchTarget()
                    )
                }
            }
        }
    }
}

/** One source's number box: whole numbers for Extra, the recipe's own unit for a recipe. */
@Composable
private fun SourceField(
    chip: Chip,
    source: ChipSource,
    scope: ChipScope,
    list: ShoppingList,
    asking: Boolean,
    setAsking: (String?) -> Unit
) {
    val colors = LocalIngreColors.current
    var text by remember(source.key) { mutableStateOf(Units.formatNumber(source.quantity)) }
    var focused by remember { mutableStateOf(false) }
    LaunchedEffect(source.quantity) { if (!focused) text = Units.formatNumber(source.quantity) }
    val question = L10n.t("chip.removeQuestion", mapOf("name" to chip.displayName, "source" to source.label))
    fun commit() {
        val value = text.replace(',', '.').toDoubleOrNull() ?: source.quantity
        if (value == source.quantity) return
        if (value <= 0) {
            setAsking(source.key)
            text = Units.formatNumber(source.quantity)
        } else {
            list.setSource(source, chip.id, value)
        }
    }
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(source.label, color = colors.text, fontWeight = FontWeight.SemiBold)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            BasicTextField(
                text,
                { text = it },
                Modifier
                    .widthIn(min = 72.dp, max = 120.dp)
                    .touchTarget()
                    .surface(Depth.Recessed, colors, RoundedCornerShape(Dimens.controlRadius))
                    .padding(horizontal = 10.dp, vertical = 12.dp)
                    .onFocusChanged {
                        if (focused && !it.isFocused) commit()
                        focused = it.isFocused
                    }
                    .semantics { contentDescription = Chips.sourceAccessibilityLabel(source, chip) }
                    .testTag("${scope.id}.source.${chip.id}.${source.key}"),
                textStyle = TextStyle(color = colors.text, fontSize = MaterialTheme.typography.bodyLarge.fontSize),
                cursorBrush = SolidColor(colors.text),
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = if (source.isRecipe) KeyboardType.Decimal else KeyboardType.Number,
                    imeAction = ImeAction.Done
                ),
                keyboardActions = KeyboardActions(onDone = { commit() })
            )
            Text(Chips.sourceUnit(source, chip), color = colors.text)
            Spacer(Modifier.weight(1f))
            InkButton(L10n.t("chip.remove"), "${scope.id}.remove.${chip.id}.${source.key}", description = question) {
                setAsking(source.key)
            }
        }
        if (asking) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(question, Modifier.weight(1f, fill = false), color = colors.text)
                InkButton(L10n.t("chip.yes"), "${scope.id}.yes.${chip.id}") {
                    setAsking(null)
                    list.removeSource(source, chip.id)
                }
                InkButton(L10n.t("chip.no"), "${scope.id}.no.${chip.id}") { setAsking(null) }
            }
        }
    }
}

/** The plus area (#181): the catalogue in category tabs, inline under its section. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PlusArea(
    title: String,
    tag: String,
    list: ShoppingList,
    mark: (LibraryIngredient) -> String?,
    onPick: (LibraryIngredient) -> Unit,
    onClose: () -> Unit
) {
    val colors = LocalIngreColors.current
    val tabs = list.plusTabs
    var tab by remember { mutableStateOf(ShopSection.FruitVeg) }
    val items = (tabs.firstOrNull { it.first == tab } ?: tabs.firstOrNull())?.second ?: emptyList()
    Column(
        Modifier
            .fillMaxWidth()
            .surface(Depth.Recessed, colors)
            .padding(12.dp)
            .testTag(tag),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(title, Modifier.weight(1f), color = colors.text, style = MaterialTheme.typography.titleMedium)
            Box(
                Modifier
                    .clickable(role = Role.Button, onClick = onClose)
                    .clearAndSetSemantics { contentDescription = L10n.t("plus.close") }
                    .touchTarget(),
                contentAlignment = Alignment.Center
            ) { Text("✕", color = colors.text) }
        }
        Row(
            Modifier.horizontalScroll(rememberScrollState()).padding(6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            for ((section, _) in tabs) {
                val ink = colors.ink(list.library.tone(section))
                Box(
                    Modifier
                        .touchTarget()
                        .surface(if (tab == section) Depth.PressedChip else Depth.Chip, colors, pill, ink)
                        .semantics { selected = tab == section }
                        .clickable(role = Role.Tab) { tab = section }
                        .padding(horizontal = 12.dp),
                    contentAlignment = Alignment.Center
                ) { Text(section.label, color = ink, fontWeight = FontWeight.SemiBold) }
            }
        }
        FlowRow(
            Modifier.padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            for (item in items) {
                val marked = mark(item)
                val name = capitaliseFirst(item.name)
                Box(
                    Modifier
                        .touchTarget()
                        .surface(Depth.Chip, colors, pill)
                        .testTag("plus.item.${item.id}")
                        .clickable(role = Role.Button) { onPick(item) }
                        .clearAndSetSemantics {
                            contentDescription =
                                marked?.let { L10n.t("plus.marked", mapOf("name" to name, "mark" to it)) } ?: name
                        }
                        .padding(horizontal = 12.dp),
                    contentAlignment = Alignment.Center
                ) { Text((if (marked == null) "" else "✓ ") + name, color = colors.text) }
            }
        }
    }
}
