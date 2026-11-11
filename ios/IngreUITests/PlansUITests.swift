import XCTest

/// #314: Plans appear only with the `tiers` flag, and ask for a login before buying.
final class PlansUITests: XCTestCase {
    func testNoPlansByDefault() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.staticTexts["Extra"].waitForExistence(timeout: 5))
        XCTAssertFalse(app.staticTexts["Plans"].exists)
        XCTAssertFalse(app.buttons["Choose Explorer"].exists)
    }

    func testPlansWithTheFlag() {
        let app = XCUIApplication()
        app.launchArguments = ["-IngreTiers", "YES"]
        app.launch()
        let leader = app.buttons["Choose Leader"]
        for _ in 0..<8 where !leader.exists {
            app.swipeUp()
        }
        XCTAssertTrue(leader.waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts["Plans"].exists)
        XCTAssertTrue(app.buttons["Choose Explorer"].exists)
        XCTAssertTrue(app.buttons["Choose Manager"].exists)
        XCTAssertTrue(app.staticTexts["Log in to choose a plan."].exists)
        // nothing can be bought before logging in
        XCTAssertFalse(leader.isEnabled)
        XCTAssertTrue(app.buttons["Restore purchases"].exists)
    }
}
