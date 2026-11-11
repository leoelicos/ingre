package com.leoelicos.ingre.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// From client/src/styles/theme.css
val Cream = Color(0xFFFFF8F0)
val White = Color(0xFFFFFFFF)
val Green = Color(0xFF2F7D4F)
val Coral = Color(0xFFE8553D)
val Ink = Color(0xFF2B2B2B)
val Stone = Color(0xFF6B6460)

private val IngreColors = lightColorScheme(
    primary = Green,
    onPrimary = White,
    secondary = Coral,
    onSecondary = White,
    background = Cream,
    onBackground = Ink,
    surface = White,
    onSurface = Ink,
    surfaceVariant = Color(0xFFE6F2EA),
    onSurfaceVariant = Stone
)

@Composable
fun IngreTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = IngreColors,
        content = content
    )
}
