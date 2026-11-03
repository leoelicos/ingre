package app.ingre.android.ui

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import app.ingre.android.core.CopyLine
import app.ingre.android.core.L10n
import app.ingre.android.core.LibraryIngredient
import app.ingre.android.core.LibraryRecipe
import app.ingre.android.core.SectionTone

/**
 * One recipe row (#179, #191), shared by Recipes and Explore. A tap on the title picks or
 * unpicks it (TalkBack reads "selected"); the chevron opens it inline.
 *
 * Closed, the row shows its name and EVERY ingredient it uses as a plain name-only chip: no
 * checkbox, no quantity, no chevron, nothing to tap. Never a three-ingredient preview, never
 * three-letter badges. Open, the details (editable chips in Recipes, the original in Explore)
 * replace the names.
 */
@Composable
fun RecipeRow(
    recipe: LibraryRecipe,
    scope: String,
    lines: List<CopyLine>,
    picked: Boolean,
    open: Boolean,
    seeRecipe: Boolean,
    recessed: Boolean,
    tone: (LibraryIngredient?) -> SectionTone,
    onPick: () -> Unit,
    onOpen: () -> Unit,
    details: @Composable () -> Unit
) {
    val colors = LocalIngreColors.current
    val shape = RoundedCornerShape(Dimens.cardRadius)
    Column(
        Modifier
            .fillMaxWidth()
            .surface(
                if (recessed ||
                    picked
                ) {
                    Depth.Recessed
                } else {
                    Depth.Raised
                },
                colors,
                shape,
                if (picked) colors.primary else colors.border
            )
            .border(2.dp, if (picked) colors.primary else Color.Transparent, shape)
            .testTag("$scope.row.${recipe.id}")
    ) {
        Row(verticalAlignment = Alignment.Top) {
            Row(
                Modifier
                    .weight(1f)
                    .testTag("$scope.pick.${recipe.id}")
                    .clickable(role = Role.Checkbox, onClick = onPick)
                    .clearAndSetSemantics {
                        contentDescription = recipe.title
                        stateDescription = L10n.t(if (picked) "row.picked" else "row.notPicked")
                        selected = picked
                    }
                    .touchTarget()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                CheckMark(picked)
                Text(
                    recipe.title,
                    color = colors.text,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }
            Row(
                Modifier
                    .testTag("$scope.open.${recipe.id}")
                    .clickable(role = Role.Button, onClick = onOpen)
                    .clearAndSetSemantics {
                        contentDescription =
                            L10n.t(
                                if (seeRecipe) "row.seeRecipeLabel" else "row.details",
                                mapOf("title" to recipe.title)
                            )
                        stateDescription = expandedText(open)
                    }
                    .touchTarget()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                if (seeRecipe) Text(L10n.t("row.seeRecipe"), color = colors.text, fontWeight = FontWeight.SemiBold)
                Chevron(open)
            }
        }
        if (open) {
            HorizontalDivider(Modifier.height(1.dp), color = colors.border)
            Column(
                Modifier
                    .padding(16.dp)
                    .testTag("$scope.details.${recipe.id}"),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) { details() }
        } else {
            IngredientNames(
                lines,
                recipe.title,
                tone,
                Modifier
                    .padding(start = 16.dp, end = 16.dp, bottom = 16.dp)
                    .testTag("$scope.names.${recipe.id}")
            )
        }
    }
}

/**
 * A closed row's ingredients (#191): all of them, as plain name-only chips that do nothing.
 * Flat outlines in the section's ink, so they never read as the raised editable chips. One
 * TalkBack stop: "Ingredients in Spaghetti Bolognese: Spaghetti, Beef mince, …".
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun IngredientNames(
    lines: List<CopyLine>,
    title: String,
    tone: (LibraryIngredient?) -> SectionTone,
    modifier: Modifier = Modifier
) {
    val colors = LocalIngreColors.current
    FlowRow(
        modifier
            .fillMaxWidth()
            .semantics(mergeDescendants = true) {
                contentDescription = L10n.t("row.ingredientsIn", mapOf("title" to title))
            },
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        for (line in lines) {
            val ink = colors.ink(tone(line.item))
            Text(
                line.displayName,
                Modifier
                    .testTag("name-chip")
                    .border(1.dp, ink, RoundedCornerShape(50))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                color = ink,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

/** Method and Notes under an open row. */
@Composable
fun MethodAndNotes(recipe: LibraryRecipe, notes: List<String>) {
    val colors = LocalIngreColors.current
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        GroupHeading(L10n.t("row.method"))
        recipe.method.forEachIndexed { index, step ->
            Row(Modifier.semantics(mergeDescendants = true) {}, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("${index + 1}.", color = colors.text)
                Text(step, color = colors.text)
            }
        }
    }
    if (notes.isNotEmpty()) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            GroupHeading(L10n.t("row.notes"))
            for (note in notes) Text(note, color = colors.text, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

/** The heart (signed in only): saves the recipe with the user's changes, or unsaves it. */
@Composable
fun SaveButton(recipe: LibraryRecipe, saved: Boolean, onClick: () -> Unit) {
    InkButton(
        (if (saved) "♥ " else "♡ ") + L10n.t(if (saved) "saved.saved" else "saved.save"),
        "save.${recipe.id}",
        description = L10n.t(if (saved) "saved.unsaveRecipe" else "saved.saveRecipe", mapOf("name" to recipe.title)),
        onClick = onClick
    )
}

@Composable
fun Labelled(label: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            label,
            Modifier.clearAndSetSemantics {
            },
            color = LocalIngreColors.current.text,
            fontWeight = FontWeight.SemiBold
        )
        Box { content() }
    }
}
