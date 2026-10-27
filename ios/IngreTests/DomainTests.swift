import Foundation
import Testing

@testable import Ingre

@MainActor
@Suite struct CopiesTests {
    let library: Library
    init() throws {
        TestSupport.useCatalog()
        library = try TestSupport.library()
    }

    var bolognese: LibraryRecipe { library.recipe("spaghetti-bolognese")! }

    @Test func linesScaleWithPortions() {
        let lines = Copies.lines(bolognese, RecipeCopy(recipeId: bolognese.id, portions: 2), library)
        let spaghetti = lines.first { $0.ingredientId == "spaghetti" }
        #expect(spaghetti?.quantity == 200)
        #expect(spaghetti?.original == 200)
        let garlic = lines.first { $0.ingredientId == "garlic" }
        #expect(garlic.map { Units.amountText($0.quantity, $0.measure, $0.item) } == "1 clove")
    }

    @Test func amountsAreStoredPerServe() {
        var copy = RecipeCopy(recipeId: bolognese.id)
        copy = Copies.withAmount(copy, bolognese, "spaghetti", 300)
        #expect(copy.amounts == ["spaghetti": 150])
        copy = Copies.withPortions(copy, 4)
        let spaghetti = Copies.lines(bolognese, copy, library).first { $0.ingredientId == "spaghetti" }
        #expect(spaghetti?.quantity == 600)
        // the original amount clears the edit
        copy = Copies.withAmount(copy, bolognese, "spaghetti", 400)
        #expect(copy.amounts.isEmpty)
        #expect(Copies.withPortions(copy, 40).portions == 12)
        #expect(Copies.withPortions(copy, 0).portions == 1)
    }

    @Test func addedIngredientsUseTheirBaseUnitAndZeroTakesThemOff() {
        var copy = Copies.withAmount(RecipeCopy(recipeId: bolognese.id), bolognese, "full-cream-milk", 100)
        let milk = Copies.lines(bolognese, copy, library).last
        #expect(milk?.ingredientId == "full-cream-milk")
        #expect(milk?.original == nil)
        #expect(milk?.item?.id == "full-cream-milk")
        #expect(milk?.measure == Copies.addedMeasure(library.item("full-cream-milk")))
        copy = Copies.withAmount(copy, bolognese, "full-cream-milk", 0)
        #expect(copy.amounts.isEmpty)
    }

    @Test func customisationsAndBullets() {
        var copy = RecipeCopy(recipeId: bolognese.id)
        copy = Copies.withAmount(copy, bolognese, "parmesan", 0)
        copy = Copies.withAmount(copy, bolognese, "beef-mince", 300)
        copy = Copies.withPortions(copy, 4)
        let lines = Copies.lines(bolognese, copy, library)
        let custom = Copies.customisations(lines, copy)
        #expect(custom.removed == [.init(ingredientId: "parmesan", from: 50)])
        #expect(custom.changed == [.init(ingredientId: "beef-mince", from: 500, to: 600)])
        #expect(custom.portions == .init(from: 2, to: 4))
        #expect(Copies.bullets(lines, copy) == ["Parmesan removed", "Beef mince 500 g → 600 g", "Portions 2 → 4"])
    }

    @Test func saveInputIsTheCopyWithItsChanges() {
        let copy = Copies.withAmount(RecipeCopy(recipeId: bolognese.id), bolognese, "parmesan", 0)
        let input = Copies.saveInput(bolognese, copy, library)
        #expect(input.libraryId == "spaghetti-bolognese")
        #expect(input.portions == 2)
        #expect(!input.ingredients.contains { $0.ingredientId == "parmesan" })
        #expect(input.customisations.removed.count == 1)
        let original = Copies.saveInput(bolognese, RecipeCopy(recipeId: bolognese.id), library)
        #expect(original.customisations == CustomisationsValue())
        #expect(original.ingredients.count == bolognese.ingredients.count)
    }

    @Test func notesListAllergens() {
        let notes = Copies.notes(Copies.lines(bolognese, RecipeCopy(recipeId: bolognese.id), library))
        #expect(notes.first?.hasPrefix("Contains: ") == true)
    }
}

@MainActor
@Suite struct ChipsTests {
    let library: Library
    init() throws {
        TestSupport.useCatalog()
        library = try TestSupport.library()
    }

    @Test func chipsBalanceRecipesAndExtra() throws {
        let copies = [RecipeCopy(recipeId: "spaghetti-bolognese")]
        let garlic = try #require(library.item("garlic"))
        let entries = Chips.entries(copies, library)
        let chips = Chips.build(entries, [.catalogue(garlic)], ChipState(crossedIds: ["garlic"]), library)
        let chip = try #require(chips.first { $0.id == "garlic" })
        #expect(chip.sources.count == 2)
        #expect(chip.crossed)
        #expect(Chips.usedInSummary(chip) == "in 1 recipe and Extra")
        // 1 clove (6 g of a 60 g head) plus 1 head
        #expect(Chips.amount(chip) == "1.1 heads" || Chips.amount(chip) == "11 cloves")
        #expect(Chips.accessibilityLabel(chip, amount: "x").hasSuffix("crossed off"))
        #expect(Chips.ingredientsSummary(chips) == "\(chips.count) items, 1 crossed off")
    }

    @Test func groupsFollowShopOrder() {
        let chips = Chips.build(
            Chips.entries([RecipeCopy(recipeId: "spaghetti-bolognese")], library), [], ChipState(), library)
        let sections = Chips.groups(chips).map(\.section)
        #expect(sections == ShopSection.allCases.filter { sections.contains($0) })
        #expect(sections.first == .fruitVeg)
    }

    @Test func removedEverywhereIsGreyed() throws {
        let recipe = try #require(library.recipe("spaghetti-bolognese"))
        let copy = Copies.withAmount(RecipeCopy(recipeId: recipe.id), recipe, "parmesan", 0)
        let chips = Chips.build(Chips.entries([copy], library), [], ChipState(), library)
        let parmesan = try #require(chips.first { $0.id == "parmesan" })
        #expect(parmesan.greyed)
        #expect(parmesan.customised)
        #expect(Chips.usedInSummary(parmesan) == "removed from every recipe")
    }

    @Test func repeatedNamesGetANumber() {
        #expect(Chips.sourceLabel(["Pad thai"], "Pad thai") == "Pad thai (2)")
        #expect(Chips.sourceLabel([], "Pad thai") == "Pad thai")
    }
}

@MainActor
@Suite struct SearchTests {
    let library: Library
    init() throws {
        TestSupport.useCatalog()
        library = try TestSupport.library()
    }

    @Test func normalisesToSingular() {
        #expect(Search.normalise(" Tomatoes Chillies ") == "tomato chilli")
        #expect(Search.normalise("eggs") == "egg")
        #expect(Search.normalise("hummus") == "hummus")
        #expect(Search.normalise("glass") == "glass")
    }

    @Test func blankBrowsesAlphabetically() {
        guard case let .browse(recipes) = Search.results("  ", library, savedOnly: false, savedIds: []) else {
            Issue.record("expected browse")
            return
        }
        #expect(
            recipes.map(\.name) == library.recipes.map(\.name).sorted { $0.localizedCompare($1) == .orderedAscending })
    }

    @Test func matchesRankByTier() {
        guard
            case let .matches(ingredients, recipes) = Search.results(
                "spaghetti", library, savedOnly: false, savedIds: [])
        else {
            Issue.record("expected matches")
            return
        }
        #expect(ingredients.first?.id == "spaghetti")
        #expect(recipes.first?.id == "spaghetti-bolognese")
        #expect(Search.tier("Spaghetti bolognese", "spag") == 0)
        #expect(Search.tier("Beef spaghetti", "spag") == 1)
        #expect(Search.tier("Xspaghetti", "spag") == 2)
    }

    @Test func noMatchOffersCloseOnesThenBrowse() {
        guard
            case let .none(ingredients, _, browse) = Search.results("spagetti", library, savedOnly: false, savedIds: [])
        else {
            Issue.record("expected none")
            return
        }
        #expect(ingredients.first?.id == "spaghetti")
        #expect(browse.count == library.recipes.count)
    }

    @Test func savedShowsOnlyHearted() {
        guard
            case let .browse(recipes) = Search.results("", library, savedOnly: true, savedIds: ["spaghetti-bolognese"])
        else {
            Issue.record("expected browse")
            return
        }
        #expect(recipes.map(\.id) == ["spaghetti-bolognese"])
    }

    @Test func checkoutURLCarriesTheSessionAndKey() throws {
        let url = CheckoutURL.make(sessionId: "cs_test_1")
        #expect(url.absoluteString.hasPrefix("https://checkout.stripe.com/c/pay/cs_test_1#"))
        let fragment = try #require(url.fragment)
        let decoded = try #require(Data(base64Encoded: fragment.removingPercentEncoding ?? fragment))
        #expect(
            String(decoding: decoded.map { $0 ^ 5 }, as: UTF8.self) == #"{"apiKey":"pk_test_TYooMQauvdEDq54NiTphI7jx"}"#
        )
    }

    @Test func returnURLs() {
        #expect(CheckoutReturn(url: URL(string: "ingre://upgrade/success")!) == .success)
        #expect(CheckoutReturn(url: URL(string: "ingre://upgrade/cancel")!) == .cancel)
        #expect(CheckoutReturn(url: URL(string: "ingre://other/cancel")!) == nil)
    }
}
