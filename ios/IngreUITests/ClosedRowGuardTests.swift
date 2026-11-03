import XCTest

/// FIXED OWNER REQUIREMENT (#191, #195): a closed row shows its name and ALL its ingredients
/// as plain name-only chips: no checkbox, no quantity, no chevron, nothing to tap. Never a
/// three-ingredient preview, never three-letter badges. Open rows show the editable chips.
@MainActor
final class ClosedRowGuardTests: XCTestCase {
    static let bolognese = [
        "Spaghetti", "Beef mince", "Brown onion", "Carrot", "Celery", "Garlic",
        "Canned crushed tomatoes", "Tomato paste", "Olive oil", "Parmesan",
    ]
    static let friedRice = [
        "Jasmine rice", "Eggs", "Tinned peas", "Carrot", "Spring onions", "Garlic", "Soy sauce",
        "Sesame oil", "Vegetable oil",
    ]

    override func setUp() {
        continueAfterFailure = false
    }

    private func assertClosed(
        _ app: XCUIApplication, scope: String, id: String, names: [String],
        file: StaticString = #filePath, line: UInt = #line
    ) {
        let row = app.otherElements["\(scope).row.\(id)"]
        let list = app.otherElements["\(scope).names.\(id)"]
        XCTAssertTrue(list.exists, "closed row shows its names", file: file, line: line)
        let chips = list.staticTexts.matching(identifier: "name-chip")
        // every ingredient, in order: not a preview of three
        XCTAssertEqual(chips.allElementsBoundByIndex.map(\.label), names, file: file, line: line)
        XCTAssertGreaterThan(chips.count, 3, file: file, line: line)
        for label in chips.allElementsBoundByIndex.map(\.label) {
            XCTAssertNil(
                label.range(of: "[0-9½¼¾]", options: .regularExpression), "no quantity in \(label)", file: file,
                line: line)
            XCTAssertNil(
                label.range(of: "^[A-Z]{3}$", options: .regularExpression), "no badge \(label)", file: file, line: line)
        }
        // nothing to tap in the names: no checkbox, no chevron
        XCTAssertEqual(list.buttons.count, 0, file: file, line: line)
        XCTAssertEqual(list.switches.count, 0, file: file, line: line)
        // the row's only controls are its pick and its open buttons
        XCTAssertEqual(row.buttons.count, 2, file: file, line: line)
    }

    func testClosedRecipesRowsShowEveryIngredientByNameOnly() {
        let app = launchApp(seed: ["spaghetti-bolognese", "egg-fried-rice"])
        app.otherElements["recipes.names.egg-fried-rice"].scrolledTo(in: app)
        assertClosed(app, scope: "recipes", id: "spaghetti-bolognese", names: Self.bolognese)
        assertClosed(app, scope: "recipes", id: "egg-fried-rice", names: Self.friedRice)
    }

    func testOpenRowShowsEditableChips() {
        let app = launchApp(seed: ["spaghetti-bolognese"])
        app.buttons["recipes.open.spaghetti-bolognese"].scrolledTo(in: app).tap()
        let details = app.otherElements["recipes.details.spaghetti-bolognese"]
        XCTAssertTrue(details.waitForExistence(timeout: 5))
        for id in ["spaghetti", "beef-mince", "parmesan"] {
            let chip = app.buttons["row-spaghetti-bolognese.chip.\(id)"]
            XCTAssertTrue(chip.exists, id)
            XCTAssertNotNil(chip.label.range(of: "[0-9½¼¾]", options: .regularExpression), "quantity in \(chip.label)")
            XCTAssertTrue(app.buttons["row-spaghetti-bolognese.chevron.\(id)"].exists, id)
        }
    }

    func testClosedExploreRowsShowEveryIngredientByNameOnly() {
        let app = launchApp()
        app.otherElements["explore.names.spaghetti-bolognese"].scrolledTo(in: app)
        assertClosed(app, scope: "explore", id: "spaghetti-bolognese", names: Self.bolognese)
    }
}
