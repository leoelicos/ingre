package com.leoelicos.ingre.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Cream = Color(0xFFFFF8F0)
val Green = Color(0xFF2F7D4F)
val Coral = Color(0xFFE8553D)
val Ink = Color(0xFF2B2B2B)
val Stone = Color(0xFF6B6460)
val White = Color(0xFFFFFFFF)
val Produce = Color(0xFFDCEFE2)
val Meat = Color(0xFFFBE0DC)
val Dairy = Color(0xFFDDE9F7)
val Pantry = Color(0xFFECE4F3)

private val LightColors = lightColorScheme(
    primary = Green,
    onPrimary = White,
    secondary = Coral,
    background = Cream,
    surface = White,
    onBackground = Ink,
    onSurface = Ink
)

@Composable
fun IngreTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = LightColors, content = content)
}
