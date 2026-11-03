package app.ingre.android.ui

import android.provider.Settings
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.sizeIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.dropShadow
import androidx.compose.ui.draw.innerShadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.shadow.Shadow
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.DpOffset
import androidx.compose.ui.unit.dp
import app.ingre.android.core.SectionTone

/**
 * The web theme (client/src/styles/theme.css) in Compose (#195). Neumorphic hierarchy: the
 * Recipes section is raised, its rows are recessed into it, and chips are raised again. No fills
 * or gradients: every surface is the page colour, and every level has an outline of at least
 * 3:1 against it, so depth never depends on the shadows alone.
 */
@Immutable
data class IngreColors(
    val background: Color,
    val text: Color,
    val secondary: Color,
    /** outlines: stone on cream is 5.6:1, the dark border on night 4.9:1 */
    val border: Color,
    val primary: Color,
    val allergen: Color,
    val shadowDark: Color,
    val shadowLight: Color,
    val dark: Boolean
) {
    /** Section inks (#154): text and outline colour per shop section, at least 6.7:1 on cream. */
    fun ink(tone: SectionTone): Color = when (tone) {
        SectionTone.Produce -> if (dark) Color(0xFFA6E0BB) else Color(0xFF1F5A36)
        SectionTone.Meat -> if (dark) Color(0xFFFFC2B8) else Color(0xFF8A2318)
        SectionTone.Dairy -> if (dark) Color(0xFFB5D3F7) else Color(0xFF1D4F8A)
        SectionTone.Deli -> if (dark) Color(0xFFF8C9A3) else Color(0xFF7A3A0B)
        SectionTone.Bakery -> if (dark) Color(0xFFF0D999) else Color(0xFF674708)
        SectionTone.Pantry -> if (dark) Color(0xFFDCC3F2) else Color(0xFF5B2F7A)
        SectionTone.Frozen -> if (dark) Color(0xFFA3E3EE) else Color(0xFF0B5864)
        SectionTone.Neutral -> if (dark) Color(0xFFDCD7D3) else Color(0xFF4A4542)
    }

    companion object {
        val light = IngreColors(
            Color(0xFFFFF8F0), Color(0xFF2B2B2B), Color(0xFF6B6460), Color(0xFF6B6460),
            Color(0xFF2F7D4F), Color(0xFFB45309), Color(0xFF2B2B2B), Color(0xFFFFFFFF), false
        )
        val dark = IngreColors(
            Color(0xFF141815), Color(0xFFF2EDE7), Color(0xFFBDB5AE), Color(0xFF8A827C),
            Color(0xFF74C995), Color(0xFFF5B041), Color(0xFF000000), Color(0x33FFFFFF), true
        )
    }
}

val LocalIngreColors = staticCompositionLocalOf { IngreColors.light }

/** The system's "Remove animations" setting: on, nothing animates (Reduce Motion). */
val LocalReduceMotion = staticCompositionLocalOf { false }

object Dimens {
    val cardRadius = 12.dp
    val controlRadius = 8.dp

    /** 48 dp touch targets (#195). */
    val minTarget = 48.dp
}

@Composable
fun IngreTheme(content: @Composable () -> Unit) {
    val colors = if (isSystemInDarkTheme()) IngreColors.dark else IngreColors.light
    val context = LocalContext.current
    val reduceMotion =
        Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f
    val scheme = if (colors.dark) {
        darkColorScheme(
            background = colors.background,
            surface = colors.background,
            onBackground = colors.text,
            onSurface = colors.text,
            primary = colors.primary
        )
    } else {
        lightColorScheme(
            background = colors.background,
            surface = colors.background,
            onBackground = colors.text,
            onSurface = colors.text,
            primary = colors.primary
        )
    }
    CompositionLocalProvider(LocalIngreColors provides colors, LocalReduceMotion provides reduceMotion) {
        MaterialTheme(colorScheme = scheme, content = content)
    }
}

/** The depths of the hierarchy, after --shadow-section, --shadow-raised, --shadow-recessed and --shadow-chip. */
enum class Depth(val offset: Float, val blur: Float, val inset: Boolean) {
    Section(8f, 20f, false),
    Raised(5f, 12f, false),
    Recessed(3f, 6f, true),
    Chip(2f, 4f, false),
    PressedChip(2f, 3f, true)
}

/** A neumorphic surface: the page colour, its shadows (outside, or inside when recessed) and an outline. */
fun Modifier.surface(
    depth: Depth,
    colors: IngreColors,
    shape: Shape = RoundedCornerShape(Dimens.cardRadius),
    outline: Color = colors.border
): Modifier {
    val dark = colors.shadowDark.copy(alpha = if (depth.inset) 0.18f else 0.16f)
    val light = colors.shadowLight.copy(alpha = if (colors.dark) 0.2f else 0.9f)
    val near = DpOffset(depth.offset.dp, depth.offset.dp)
    val far = DpOffset(-depth.offset.dp, -depth.offset.dp)
    val shaded = if (depth.inset) {
        background(colors.background, shape)
            .innerShadow(shape, Shadow(radius = depth.blur.dp, color = dark, offset = near))
            .innerShadow(shape, Shadow(radius = depth.blur.dp, color = light, offset = far))
    } else {
        dropShadow(shape, Shadow(radius = depth.blur.dp, color = dark, offset = near))
            .dropShadow(shape, Shadow(radius = depth.blur.dp, color = light, offset = far))
            .background(colors.background, shape)
    }
    return then(shaded).border(1.dp, outline, shape)
}

/** At least 48 × 48 dp to tap. */
fun Modifier.touchTarget(): Modifier = sizeIn(minWidth = Dimens.minTarget, minHeight = Dimens.minTarget)

/** A tween that turns into a jump when animations are off. */
fun <T> motion(reduceMotion: Boolean, millis: Int = 200) = tween<T>(durationMillis = if (reduceMotion) 0 else millis)
