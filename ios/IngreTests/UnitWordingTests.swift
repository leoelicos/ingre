import Foundation
import Testing
@testable import Ingre

/// Unit wording must read exactly like the web helper (client/src/i18n/__tests__).
@MainActor
@Suite struct UnitWordingTests {
    init() { TestSupport.useCatalog() }

    @Test func numbersKeepTwoDecimalsAndNoGrouping() {
        #expect(Units.formatNumber(37.5) == "37.5")
        #expect(Units.formatNumber(1250) == "1250")
        #expect(Units.formatNumber(1.0 / 3.0) == "0.33")
        #expect(Units.formatNumber(2) == "2")
    }

    @Test func quartersAreGlyphs() {
        #expect(Units.formatFraction(0.5) == "½")
        #expect(Units.formatFraction(1.25) == "1¼")
        #expect(Units.formatFraction(0.75) == "¾")
        #expect(Units.formatFraction(0.3) == "0.3")
        #expect(Units.formatFraction(3) == "3")
    }

    @Test func halfQuantitiesReadSingular() {
        #expect(Units.formatQuantity(0.5, "clove") == "½ clove")
        #expect(Units.formatQuantity(1, "clove") == "1 clove")
        #expect(Units.formatQuantity(1.5, "clove") == "1½ cloves")
        #expect(Units.formatQuantity(0.5, "cup") == "½ cup")
        #expect(Units.formatQuantity(2, "cup") == "2 cups")
        #expect(Units.formatCount(0.5, nil) == "½ item")
        #expect(Units.formatCount(0, nil) == "0 items")
    }

    @Test func measuresThatNeverPluralise() {
        #expect(Units.formatQuantity(37.5, "g") == "37.5 g")
        #expect(Units.formatQuantity(0.5, "tbsp") == "½ tbsp")
        #expect(Units.formatQuantity(400, "g tin") == "400 g tin")
        #expect(Units.formatQuantity(2, "pinch") == "2 pinch")
    }

    @Test func wholeTakesTheItemsCountUnit() throws {
        let library = try TestSupport.library()
        let garlic = try #require(library.item("garlic"))
        #expect(Units.amountText(1, "whole", garlic) == "1 head")
        #expect(Units.amountText(2, "whole", garlic) == "2 heads")
        #expect(Units.amountText(0.5, "whole", nil) == "½ item")
    }

    @Test func massesBecomeKilosAndLitres() {
        #expect(Units.formatMass(250, .g) == "250 g")
        #expect(Units.formatMass(1000, .g) == "1 kg")
        #expect(Units.formatMass(1500, .ml) == "1.5 L")
    }

    @Test func garlicReadsInClovesUntilWhole() throws {
        let library = try TestSupport.library()
        let garlic = try #require(library.item("garlic"))
        // 6 g cloves in a 60 g head: 0.3 head is 3 cloves, 1 head is a head.
        #expect(Units.formatAmount(Amount(amount: 0.3, unit: .count), garlic) == "3 cloves")
        #expect(Units.formatAmount(Amount(amount: 0.05, unit: .count), garlic) == "½ clove")
        #expect(Units.formatAmount(Amount(amount: 1, unit: .count), garlic) == "1 head")
        #expect(Units.formatAmount(Amount(amount: 2, unit: .count), garlic) == "2 heads")
    }

    @Test func recipeAndItemCounts() {
        #expect(Units.formatRecipeCount(1) == "1 recipe")
        #expect(Units.formatRecipeCount(2) == "2 recipes")
        #expect(Units.formatItemCount(0) == "0 items")
        #expect(Units.formatItemCount(1) == "1 item")
    }

    @Test func pluralRulesAreEnglish() {
        #expect(PluralRules.english(1) == "one")
        #expect(PluralRules.english(0) == "other")
        #expect(PluralRules.english(1.5) == "other")
        #expect(Units.pluralCount(0.25) == 1)
        #expect(Units.pluralCount(0) == 0)
    }
}
