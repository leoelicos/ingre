package app.ingre.android.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.ingre.android.core.L10n

fun expandedText(open: Boolean) = L10n.t(if (open) "header.expanded" else "header.collapsed")

/**
 * A section's header row: the title, a summary and the chevron that collapses it (#179). One
 * button, so TalkBack reads "Recipes, 2 recipes picked, expanded".
 */
@Composable
fun HeaderRow(
    title: String,
    open: Boolean,
    tag: String,
    modifier: Modifier = Modifier,
    summary: String = "",
    toggle: () -> Unit
) {
    val colors = LocalIngreColors.current
    Row(
        modifier
            .touchTarget()
            .testTag(tag)
            .clickable(role = Role.Button, onClick = toggle)
            .clearAndSetSemantics {
                heading()
                contentDescription = if (summary.isEmpty()) title else "$title, $summary"
                stateDescription = expandedText(open)
            },
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = colors.text)
            if (summary.isNotEmpty()) {
                Text(
                    summary,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.secondary
                )
            }
        }
        Spacer(Modifier.width(8.dp))
        Chevron(open)
    }
}

/** ⌄ that turns to ⌃ when open; it jumps with animations off. */
@Composable
fun Chevron(open: Boolean, modifier: Modifier = Modifier) {
    val colors = LocalIngreColors.current
    val angle by animateFloatAsState(if (open) 180f else 0f, motion(LocalReduceMotion.current), label = "chevron")
    Text(
        "⌄",
        modifier.rotate(angle).clearAndSetSemantics { },
        color = colors.text,
        fontSize = 22.sp,
        fontWeight = FontWeight.Bold
    )
}

/** The tick in a ring: a primary ring and tick once picked, an empty ring before. No fill. */
@Composable
fun CheckMark(picked: Boolean) {
    val colors = LocalIngreColors.current
    Box(
        Modifier
            .size(28.dp)
            .border(2.dp, if (picked) colors.primary else colors.secondary, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        if (picked) Text("✓", color = colors.primary, fontWeight = FontWeight.Bold)
    }
}

/** A heading inside a section ("Fruit & Veg", "Method"). */
@Composable
fun GroupHeading(text: String) {
    val colors = LocalIngreColors.current
    Text(
        text.uppercase(),
        Modifier.semantics {
            heading()
            contentDescription = text
        },
        style = MaterialTheme.typography.labelMedium,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 0.5.sp,
        color = colors.secondary
    )
}

/** Allergen tags, outlined. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AllergenTags(allergens: List<String>) {
    if (allergens.isEmpty()) return
    val colors = LocalIngreColors.current
    FlowRow(
        Modifier.clearAndSetSemantics {
            contentDescription = L10n.tOr("allergens.label", "Allergens") + ": " + allergens.joinToString(", ")
        },
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        for (allergen in allergens) {
            Text(
                allergen,
                Modifier
                    .border(1.dp, colors.border, RoundedCornerShape(50))
                    .padding(horizontal = 8.dp, vertical = 2.dp),
                style = MaterialTheme.typography.labelMedium,
                color = colors.text
            )
        }
    }
}

/** A status line TalkBack announces when it changes. */
@Composable
fun StatusText(text: String, tag: String) {
    if (text.isEmpty()) return
    Text(
        text,
        Modifier
            .semantics { liveRegion = LiveRegionMode.Polite }
            .testTag(tag),
        style = MaterialTheme.typography.bodyMedium,
        color = LocalIngreColors.current.text
    )
}

/** A plain button: the page colour and the ink, raised, pressed in while held. No fill. */
@Composable
fun InkButton(
    text: String,
    tag: String,
    modifier: Modifier = Modifier,
    depth: Depth = Depth.Raised,
    enabled: Boolean = true,
    description: String? = null,
    onClick: () -> Unit
) {
    val colors = LocalIngreColors.current
    Box(
        modifier
            .touchTarget()
            .surface(depth, colors, RoundedCornerShape(Dimens.controlRadius))
            .testTag(tag)
            .semantics {
                if (description != null) contentDescription = description
            }
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(text, color = colors.text, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
    }
}

/** Strike-through for crossed-off text; never faded. */
fun crossedDecoration(crossed: Boolean) = if (crossed) TextDecoration.LineThrough else TextDecoration.None
