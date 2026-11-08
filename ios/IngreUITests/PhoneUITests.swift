import XCTest

/// The phone page keeps every section on screen, and never shows a badge.
final class PhoneUITests: XCTestCase {
    func testSectionsAndNoBadges() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.staticTexts["Explore"].exists)
        XCTAssertTrue(app.staticTexts["Ingredients"].exists)
        XCTAssertTrue(app.staticTexts["Recipes"].exists)
        XCTAssertTrue(app.staticTexts["Extra"].exists)
        // The search field can surface as a text field or as static text, depending on the iOS version.
        let searchName = "Search ingredients and recipes"
        let search = app.descendants(matching: .any).matching(
            NSPredicate(
                format: "(elementType == %d OR elementType == %d) AND (identifier == %@ OR label == %@)",
                XCUIElement.ElementType.staticText.rawValue,
                XCUIElement.ElementType.textField.rawValue,
                searchName,
                searchName
            )
        ).firstMatch
        XCTAssertTrue(search.waitForExistence(timeout: 5))
        XCTAssertEqual(app.otherElements["badge"].exists, false)
        XCTAssertEqual(app.otherElements["key-preview"].exists, false)
    }
}
