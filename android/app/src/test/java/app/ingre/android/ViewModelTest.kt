package app.ingre.android

import app.cash.turbine.test
import app.ingre.android.account.AccountViewModel
import app.ingre.android.account.Clock
import app.ingre.android.core.ApiException
import app.ingre.android.core.CheckoutReturn
import app.ingre.android.core.ChipSource
import app.ingre.android.core.Copies
import app.ingre.android.core.CustomisationsValue
import app.ingre.android.core.ListStorage
import app.ingre.android.core.MemoryStore
import app.ingre.android.core.MemoryTokenStore
import app.ingre.android.core.RecipeCopy
import app.ingre.android.core.SavedRecipeSummary
import app.ingre.android.core.StorageKey
import app.ingre.android.explore.ExploreViewModel
import app.ingre.android.ingredients.IngredientsViewModel
import app.ingre.android.ingredients.ShoppingList
import app.ingre.android.recipes.RecipesViewModel
import app.ingre.android.upgrade.UpgradeViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@OptIn(ExperimentalCoroutinesApi::class)
abstract class ViewModelTestBase {
    @BeforeEach
    fun setUpMain() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
        TestSupport.useStrings()
    }

    @AfterEach
    fun tearDownMain() = Dispatchers.resetMain()

    val library = TestSupport.library

    fun makeList(store: MemoryStore = MemoryStore()) = ShoppingList(library, ListStorage(store))

    val config = AppConfig("https://mock.test/graphql", "https://web.test", "https://checkout.example.test/c/pay/")
    val clock = Clock { 1_800_000_000.0 }
}

class ShoppingListTest : ViewModelTestBase() {
    @Test
    fun pickingARecipeAddsItsCopyAndChips() {
        val store = MemoryStore()
        val list = makeList(store)
        list.togglePicked("spaghetti-bolognese")
        assertEquals(setOf("spaghetti-bolognese"), list.pickedIds())
        assertTrue(list.hasChip("spaghetti"))
        // kept on the device under the web key, and read back on the next launch
        assertNotNull(store.read(StorageKey.Copies))
        assertEquals(setOf("spaghetti-bolognese"), makeList(store).pickedIds())
        list.togglePicked("spaghetti-bolognese")
        assertTrue(list.chips().isEmpty())
    }

    @Test
    fun addingAnIngredientGoesToExtra() {
        val list = makeList()
        val milk = library.item("full-cream-milk")!!
        assertFalse(list.pick(milk))
        assertEquals("Full cream milk added to Extra", list.message.value)
        assertEquals(listOf("full-cream-milk"), list.extraChips().map { it.id })
        list.setSource(ChipSource.ExtraAmount(1.0), "full-cream-milk", 2.6)
        assertEquals(3, list.extraChips().first().extra)
        // picking it again opens its chip instead
        assertTrue(list.pick(milk))
        assertEquals("full-cream-milk", list.openPanels.value["chip"])
        list.removeExtra("full-cream-milk")
        assertTrue(list.extraChips().isEmpty())
    }

    @Test
    fun crossingOffAndRefresh() = runTest {
        val list = makeList()
        val ingredients = IngredientsViewModel(list)
        ingredients.ui.test {
            assertEquals("0 items", awaitItem().summary)
            list.togglePicked("spaghetti-bolognese")
            val picked = awaitItem()
            assertEquals("${picked.chips.size} items", picked.summary)
            list.toggleCrossed("spaghetti")
            val crossed = awaitItem()
            assertTrue(crossed.chips.first { it.id == "spaghetti" }.crossed)
            assertTrue(crossed.summary.endsWith("1 crossed off"))
            cancelAndIgnoreRemainingEvents()
        }
        list.setPortions("spaghetti-bolognese", 5)
        list.setAmount("spaghetti-bolognese", "parmesan", 0.0)
        ingredients.askRefresh(true)
        ingredients.refresh()
        assertFalse(ingredients.askingRefresh.value)
        assertEquals(RecipeCopy("spaghetti-bolognese"), list.copyFor("spaghetti-bolognese"))
    }

    @Test
    fun recipeRowsListEveryUsedIngredientByName() = runTest {
        val list = makeList()
        val recipes = RecipesViewModel(list)
        recipes.entries.test {
            assertEquals(emptyList<Any>(), awaitItem())
            list.togglePicked("spaghetti-bolognese")
            val entry = awaitItem().single()
            assertEquals(
                listOf(
                    "Spaghetti", "Beef mince", "Brown onion", "Carrot", "Celery", "Garlic",
                    "Canned crushed tomatoes", "Tomato paste", "Olive oil", "Parmesan"
                ),
                recipes.closedNames(entry).map { it.displayName }
            )
            list.setAmount("spaghetti-bolognese", "parmesan", 0.0)
            assertFalse(recipes.closedNames(awaitItem().single()).any { it.ingredientId == "parmesan" })
            cancelAndIgnoreRemainingEvents()
        }
        val entry = recipes.entries.value.single()
        recipes.add(library.item("full-cream-milk")!!, entry)
        assertNull(recipes.addingTo.value)
        assertEquals("full-cream-milk", list.openPanels.value["row-spaghetti-bolognese"])
        assertTrue(recipes.bullets(recipes.entries.value.single()).contains("Parmesan removed"))
    }
}

class ExploreViewModelTest : ViewModelTestBase() {
    @Test
    fun openWhenTheListIsEmptyCollapsedOtherwise() = runTest {
        val store = MemoryStore()
        val empty = ExploreViewModel(makeList(store))
        assertTrue(empty.expanded.value)
        empty.list.togglePicked("spaghetti-bolognese")
        val next = ExploreViewModel(makeList(store))
        next.expanded.test {
            assertFalse(awaitItem())
            next.toggle()
            assertTrue(awaitItem())
            next.collapse()
            assertFalse(awaitItem())
            // typing a search opens it
            next.setQuery("dahl")
            assertTrue(awaitItem())
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun savingFromExploreStoresTheListCopyWhenPicked() {
        val list = makeList()
        val explore = ExploreViewModel(list)
        val recipe = library.recipe("spaghetti-bolognese")!!
        assertEquals(CustomisationsValue(), explore.saveInput(recipe).customisations)
        list.togglePicked(recipe.id)
        list.setAmount(recipe.id, "parmesan", 0.0)
        assertEquals(1, explore.saveInput(recipe).customisations.removed.size)
        // Explore still shows the original
        assertTrue(explore.originalLines(recipe).first { it.ingredientId == "parmesan" }.quantity > 0)
    }
}

class AccountViewModelTest : ViewModelTestBase() {
    @Test
    fun loginStoresTheTokenAndLoadsHearts() = runTest {
        val api = FakeApi()
        api.loginResult = Result.success(makeToken() to api.user)
        api.saved = mutableListOf(SavedRecipeSummary("s1", "pad-thai"))
        val tokens = MemoryTokenStore()
        val account = AccountViewModel(api, tokens, clock)
        account.setEmail("ann@example.com")
        account.setPassword("secret")
        account.claims.test {
            assertNull(awaitItem())
            account.login()
            assertEquals("Ann", awaitItem()?.data?.firstName)
            account.logout()
            assertNull(awaitItem())
        }
        assertNull(tokens.read())
        assertEquals(listOf("login", "getSavedRecipes"), api.calls)
    }

    @Test
    fun loginKeepsTheTokenAndHearts() = runTest {
        val api = FakeApi()
        api.loginResult = Result.success(makeToken() to api.user)
        api.saved = mutableListOf(SavedRecipeSummary("s1", "pad-thai"))
        val tokens = MemoryTokenStore()
        val account = AccountViewModel(api, tokens, clock)
        account.setEmail("ann@example.com")
        account.setPassword("secret")
        account.login()
        assertEquals(makeToken(), tokens.read())
        assertEquals(setOf("pad-thai"), account.savedIds)
        assertEquals("", account.form.value.password)
    }

    @Test
    fun validationAndFailure() = runTest {
        val api = FakeApi()
        val account = AccountViewModel(api, MemoryTokenStore(), clock)
        account.login()
        assertEquals("Please enter an email address.", account.form.value.validation)
        account.setEmail("a@b.c")
        account.login()
        assertEquals("Please enter a password.", account.form.value.validation)
        account.setPassword("x")
        for (error in listOf(ApiException.Http(500), ApiException.Http(404), ApiException.NoData())) {
            api.loginResult = Result.failure(error)
            account.retryLogin()
            account.login()
            assertTrue(account.form.value.failed)
            assertFalse(account.loggedIn)
        }
    }

    @Test
    fun expiredTokensAreDropped() {
        val tokens = MemoryTokenStore(makeToken(exp = 1))
        val account = AccountViewModel(FakeApi(), tokens, clock)
        assertFalse(account.loggedIn)
        assertNull(tokens.read())
    }

    @Test
    fun heartTogglesAndReportsFailure() = runTest {
        val api = FakeApi()
        val account = AccountViewModel(api, MemoryTokenStore(makeToken()), clock)
        assertTrue(account.loggedIn)
        val recipe = library.recipe("spaghetti-bolognese")!!
        val input = Copies.saveInput(recipe, RecipeCopy(recipe.id), library)
        account.toggle(recipe.id, input)
        assertTrue(account.isSaved(recipe.id))
        account.toggle(recipe.id, input)
        assertFalse(account.isSaved(recipe.id))
        api.saveFails = true
        account.toggle(recipe.id, input)
        assertEquals("Couldn't update your saved recipes. Try again.", account.saveError.value)
    }
}

class UpgradeViewModelTest : ViewModelTestBase() {
    @Test
    fun doubleTapStartsOneCheckout() = runTest {
        val api = FakeApi()
        val opener = RecordingOpener()
        val upgrade = UpgradeViewModel(api, opener, config)
        var sawStarting = false
        api.duringCheckout = {
            sawStarting = upgrade.ui.value.starting
            upgrade.startCheckout() // the second tap, while the first is in flight
        }
        upgrade.startCheckout()
        assertTrue(sawStarting)
        assertTrue(upgrade.ui.value.cancelled)
        assertFalse(upgrade.ui.value.starting)
        assertEquals(1, upgrade.ui.value.attempts)
        assertEquals(1, api.calls.count { it == "checkout" })
        assertTrue(opener.opened.single().startsWith("https://checkout.example.test/c/pay/cs_test_123#"))
    }

    @Test
    fun successMakesTheUserPro() = runTest {
        val api = FakeApi()
        val upgrade = UpgradeViewModel(api, RecordingOpener(CheckoutReturn.Success), config)
        upgrade.startCheckout()
        assertTrue(upgrade.ui.value.pro)
        assertTrue(upgrade.ui.value.succeeded)
        assertTrue("makeUserPro" in api.calls)
    }

    @Test
    fun serverErrorsShowTheFailure() = runTest {
        for (error in listOf(ApiException.Http(500), ApiException.Http(404))) {
            val api = FakeApi()
            api.session = Result.failure(error)
            val opener = RecordingOpener()
            val upgrade = UpgradeViewModel(api, opener, config)
            upgrade.startCheckout()
            assertTrue(upgrade.ui.value.failed)
            assertFalse(upgrade.ui.value.starting)
            assertTrue(opener.opened.isEmpty())
        }
    }

    @Test
    fun noSessionIsAFailure() = runTest {
        val api = FakeApi()
        api.session = Result.success(null)
        val upgrade = UpgradeViewModel(api, RecordingOpener(), config)
        upgrade.startCheckout()
        assertTrue(upgrade.ui.value.failed)
    }

    @Test
    fun aDismissedTabChangesNothingAndAllowsAnotherTry() = runTest {
        val api = FakeApi()
        val upgrade = UpgradeViewModel(api, RecordingOpener(CheckoutReturn.Dismissed), config)
        upgrade.startCheckout()
        assertFalse(upgrade.ui.value.cancelled || upgrade.ui.value.failed || upgrade.ui.value.starting)
        upgrade.startCheckout()
        assertEquals(2, upgrade.ui.value.attempts)
    }
}
