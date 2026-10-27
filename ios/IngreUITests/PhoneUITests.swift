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
        XCTAssertTrue(app.staticTexts["Search ingredients and recipes"].exists)
        XCTAssertEqual(app.otherElements["badge"].exists, false)
        XCTAssertEqual(app.otherElements["key-preview"].exists, false)
    }
}
