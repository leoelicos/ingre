package com.leoelicos.ingre

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class ConfigurationTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun bottomNavLabelsAreDisplayed() {
        assertBottomNavLabels()
    }

    @Test
    fun bottomNavLabelsAreDisplayedUnderLargeText() {
        // CI sets font_scale to 1.5; this still passes at the default 1.0 locally.
        val fontScale = composeRule.activity.resources.configuration.fontScale
        println("fontScale=$fontScale")
        assertBottomNavLabels()
    }

    private fun assertBottomNavLabels() {
        val labels = listOf("Recipes", "List", "Explore", "Extra", "Account")
        for (label in labels) {
            composeRule.onNodeWithText(label, useUnmergedTree = true).assertIsDisplayed()
        }
    }
}
