package app.ingre

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import org.junit.Rule
import org.junit.Test

/** The phone page shows every section, and never a badge or a key-ingredient preview. */
class PhoneScreenTest {
    @get:Rule
    val rule = createAndroidComposeRule<MainActivity>()

    @Test
    fun sectionsStayOnThePageAndThereAreNoBadges() {
        rule.onNodeWithText("Explore").assertIsDisplayed()
        rule.onNodeWithText("Ingredients").assertIsDisplayed()
        rule.onNodeWithText("Recipes").assertIsDisplayed()
        rule.onNodeWithText("Extra").assertIsDisplayed()
        rule.onNodeWithText("Search ingredients and recipes").assertIsDisplayed()
        rule.onNodeWithText("Red lentil dahl").assertIsDisplayed()
        rule.onNodeWithText("onion").assertIsDisplayed()
        rule.onNodeWithText("garlic").assertIsDisplayed()
        rule.onNodeWithTag("badge").assertDoesNotExist()
        rule.onNodeWithTag("key-preview").assertDoesNotExist()
        assert(!SHOWS_BADGES)
        assert(!SHOWS_KEY_INGREDIENT_PREVIEW)
    }
}
