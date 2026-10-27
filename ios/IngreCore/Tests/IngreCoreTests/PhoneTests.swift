import XCTest
@testable import IngreCore

final class PhoneTests: XCTestCase {
    let dahl = StoredRecipe(
        id: "dahl",
        name: "Red lentil dahl",
        lines: [
            Line(ingredientId: "onion", name: "onion", quantity: 0.25, measure: "whole"),
            Line(ingredientId: "garlic", name: "garlic", quantity: 1, measure: "clove")
        ]
    )

    func testPhoneOrderAndExplore() {
        XCTAssertEqual(phoneSections(), [.explore, .ingredients, .recipes, .extra])
        XCTAssertEqual(phoneSections()[phoneSections().firstIndex(of: .extra)! - 1], .recipes)
        XCTAssertTrue(exploreStartsOpen(pickedCount: 0, savedRequested: false))
        XCTAssertFalse(exploreStartsOpen(pickedCount: 2, savedRequested: false))
        XCTAssertTrue(exploreStartsOpen(pickedCount: 2, savedRequested: true))
    }

    func testClosedRowsAreNamesOnly() {
        XCTAssertEqual(closedChips(["onion", "garlic"]), [NameChip(name: "onion"), NameChip(name: "garlic")])
        XCTAssertFalse(showsKeyIngredientPreview)
        XCTAssertFalse(showsBadges)
    }

    func testEditingACopyLeavesTheOriginal() {
        let picked = pickRecipe(ListMemory(), dahl)
        let edited = editCopy(picked, "dahl", [Line(ingredientId: "onion", name: "onion", quantity: 1, measure: "whole")])
        XCTAssertEqual(exploreRecipe(edited, "dahl")?.lines.first?.quantity, 0.25)
        XCTAssertEqual(recipeCopies(edited).first?.lines.first?.quantity, 1)
        XCTAssertNil(exploreRecipe(ListMemory(), "missing"))
        XCTAssertEqual(pickRecipe(picked, dahl), picked)
        XCTAssertEqual(editCopy(picked, "missing", []), picked)
    }

    func testTitlesAndUpgrade() {
        let split = splitTitle("Shaking beef (bò lúc lắc)")
        XCTAssertEqual(split.0, "Shaking beef")
        XCTAssertEqual(split.1, "bò lúc lắc")
        XCTAssertNil(splitTitle("Red lentil dahl").1)
        let upgrade = UpgradeStarter()
        XCTAssertTrue(upgrade.start())
        XCTAssertFalse(upgrade.start())
        XCTAssertTrue(upgrade.starting)
        XCTAssertEqual(upgradeStarting, "Starting the Stripe checkout…")
    }

    func testLoginBody() {
        let body = loginBody(email: "a@b.c", password: "p\"x")
        XCTAssertTrue(body.contains("mutation Login"))
        XCTAssertTrue(body.contains(#""email":"a@b.c""#))
        XCTAssertTrue(body.contains(#""password":"p\"x""#))
    }
}
