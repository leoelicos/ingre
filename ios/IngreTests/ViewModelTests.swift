import Foundation
import Testing
@testable import Ingre

@MainActor
@Suite struct ShoppingListViewModelTests {
    let library: Library
    init() throws {
        TestSupport.useCatalog()
        library = try TestSupport.library()
    }

    func makeList(_ store: MemoryStore = MemoryStore()) -> ShoppingListViewModel {
        ShoppingListViewModel(library: library, storage: ListStorage(store: store))
    }

    @Test func pickingARecipeAddsItsCopyAndChips() {
        let store = MemoryStore()
        let list = makeList(store)
        list.togglePicked("spaghetti-bolognese")
        #expect(list.pickedIds == ["spaghetti-bolognese"])
        #expect(list.hasChip("spaghetti"))
        #expect(list.summary == "\(list.chips.count) items")
        // kept on the device under the web key, and read back on the next launch
        #expect(store.read(.copies) != nil)
        #expect(makeList(store).pickedIds == ["spaghetti-bolognese"])
        list.togglePicked("spaghetti-bolognese")
        #expect(list.chips.isEmpty)
    }

    @Test func addingAnIngredientGoesToExtra() throws {
        let list = makeList()
        let milk = try #require(library.item("full-cream-milk"))
        #expect(list.pick(milk) == false)
        #expect(list.message == "Full cream milk added to Extra")
        #expect(list.extraChips.map(\.id) == ["full-cream-milk"])
        list.setSource(.extra(quantity: 1), chipId: "full-cream-milk", value: 2.6)
        #expect(list.extraChips.first?.extra == 3)
        // picking it again opens its chip instead
        #expect(list.pick(milk) == true)
        #expect(list.openPanels["chip"] == "full-cream-milk")
        list.removeExtra("full-cream-milk")
        #expect(list.extraChips.isEmpty)
    }

    @Test func crossingOffAndRefresh() {
        let list = makeList()
        list.togglePicked("spaghetti-bolognese")
        list.toggleCrossed("spaghetti")
        #expect(list.chips.first { $0.id == "spaghetti" }?.crossed == true)
        #expect(list.summary.hasSuffix("1 crossed off"))
        list.setPortions(recipeId: "spaghetti-bolognese", portions: 5)
        list.setAmount(recipeId: "spaghetti-bolognese", ingredientId: "parmesan", quantity: 0)
        list.refresh()
        #expect(list.copy(for: "spaghetti-bolognese") == RecipeCopy(recipeId: "spaghetti-bolognese"))
    }
}

@MainActor
@Suite struct ExploreViewModelTests {
    let library: Library
    init() throws {
        TestSupport.useCatalog()
        library = try TestSupport.library()
    }

    @Test func openWhenTheListIsEmptyCollapsedOtherwise() {
        let store = MemoryStore()
        let empty = ExploreViewModel(list: ShoppingListViewModel(library: library, storage: ListStorage(store: store)))
        #expect(empty.expanded)
        empty.list.togglePicked("spaghetti-bolognese")
        let next = ExploreViewModel(list: ShoppingListViewModel(library: library, storage: ListStorage(store: store)))
        #expect(!next.expanded)
        next.toggle()
        #expect(next.expanded)
        next.collapse()
        #expect(!next.expanded)
    }

    @Test func savingFromExploreStoresTheListCopyWhenPicked() {
        let list = ShoppingListViewModel(library: library, storage: ListStorage(store: MemoryStore()))
        let explore = ExploreViewModel(list: list)
        let recipe = library.recipe("spaghetti-bolognese")!
        #expect(explore.saveInput(recipe).customisations == CustomisationsValue())
        list.togglePicked(recipe.id)
        list.setAmount(recipeId: recipe.id, ingredientId: "parmesan", quantity: 0)
        #expect(explore.saveInput(recipe).customisations.removed.count == 1)
        // Explore still shows the original
        #expect(explore.originalLines(recipe).first { $0.ingredientId == "parmesan" }?.quantity ?? 0 > 0)
    }
}

@MainActor
@Suite struct AccountViewModelTests {
    init() { TestSupport.useCatalog() }

    @Test func loginStoresTheTokenAndLoadsHearts() async {
        let api = FakeAPI()
        api.loginResult = .success((makeToken(), api.user))
        api.saved = [SavedRecipeSummary(id: "s1", libraryId: "pad-thai")]
        let tokens = MemoryTokenStore()
        let account = AccountViewModel(api: api, tokens: tokens)
        account.email = "ann@example.com"
        account.password = "secret"
        await account.submitLogin()
        #expect(account.loggedIn)
        #expect(account.firstName == "Ann")
        #expect(tokens.read() == makeToken())
        #expect(account.savedIds == ["pad-thai"])
        account.logout()
        #expect(tokens.read() == nil)
        #expect(!account.loggedIn)
    }

    @Test func validationAndFailure() async {
        let api = FakeAPI()
        let account = AccountViewModel(api: api, tokens: MemoryTokenStore())
        await account.submitLogin()
        #expect(account.validation == "Please enter an email address.")
        account.email = "a@b.c"
        await account.submitLogin()
        #expect(account.validation == "Please enter a password.")
        account.password = "x"
        await account.submitLogin()
        #expect(account.loginFailed)
        #expect(!account.loggedIn)
    }

    @Test func expiredTokensAreDropped() {
        let tokens = MemoryTokenStore(makeToken(exp: 1))
        let account = AccountViewModel(api: FakeAPI(), tokens: tokens)
        #expect(!account.loggedIn)
        #expect(tokens.read() == nil)
    }

    @Test func heartTogglesAndReportsFailure() async throws {
        let api = FakeAPI()
        let account = AccountViewModel(api: api, tokens: MemoryTokenStore(makeToken()))
        let library = try TestSupport.library()
        let recipe = try #require(library.recipe("spaghetti-bolognese"))
        let input = Copies.saveInput(recipe, RecipeCopy(recipeId: recipe.id), library)
        await account.toggleSaved(libraryId: recipe.id, input: input)
        #expect(account.isSaved(recipe.id))
        await account.toggleSaved(libraryId: recipe.id, input: input)
        #expect(!account.isSaved(recipe.id))
        api.saveFails = true
        await account.toggleSaved(libraryId: recipe.id, input: input)
        #expect(account.saveError == "Couldn't update your saved recipes. Try again.")
    }
}

@MainActor
@Suite struct UpgradeViewModelTests {
    init() { TestSupport.useCatalog() }

    let base = URL(string: "https://checkout.example.test/c/pay/")!

    @Test func doubleTapStartsOneCheckout() async {
        let api = FakeAPI()
        let opener = RecordingOpener()
        let upgrade = UpgradeViewModel(api: api, opener: opener, checkoutBase: base)
        var sawStarting = false
        api.duringCheckout = { @MainActor in
            sawStarting = upgrade.starting
            await upgrade.startCheckout() // the second tap, while the first is in flight
        }
        await upgrade.startCheckout()
        #expect(sawStarting)
        #expect(upgrade.attempts == 1)
        #expect(api.calls.filter { $0 == "checkout" }.count == 1)
        #expect(opener.opened.map(\.absoluteString).first?.hasPrefix("https://checkout.example.test/c/pay/cs_test_123#") == true)
        #expect(upgrade.cancelled)
        #expect(!upgrade.starting)
    }

    @Test func successMakesTheUserPro() async {
        let api = FakeAPI()
        let opener = RecordingOpener()
        opener.answer = .success
        let upgrade = UpgradeViewModel(api: api, opener: opener, checkoutBase: base)
        await upgrade.startCheckout()
        #expect(upgrade.pro)
        #expect(upgrade.succeeded)
        #expect(api.calls.contains("makeUserPro"))
    }

    @Test func serverErrorsShowTheFailure() async {
        for error in [APIError.http(500), .http(404)] {
            let api = FakeAPI()
            api.session = .failure(error)
            let opener = RecordingOpener()
            let upgrade = UpgradeViewModel(api: api, opener: opener, checkoutBase: base)
            await upgrade.startCheckout()
            #expect(upgrade.failed)
            #expect(opener.opened.isEmpty)
        }
    }

    @Test func noSessionIsAFailure() async {
        let api = FakeAPI()
        api.session = .success(nil)
        let upgrade = UpgradeViewModel(api: api, opener: RecordingOpener(), checkoutBase: base)
        await upgrade.startCheckout()
        #expect(upgrade.failed)
    }
}
