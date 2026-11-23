import XCTest

/// Core labels stay on screen with large text, dark mode, and rotation.
final class ConfigurationUITests: XCTestCase {
    func testCoreLabelsExist() {
        let app = XCUIApplication()
        app.launch()
        assertCoreLabels(in: app)
    }

    func testCoreLabelsExistWithLargeTextAndDarkMode() {
        let app = XCUIApplication()
        app.launchArguments = [
            "-UIPreferredContentSizeCategoryName",
            "UICTContentSizeCategoryAccessibilityXXXL",
            "-AppleInterfaceStyle",
            "Dark"
        ]
        app.launch()
        assertCoreLabels(in: app)
    }

    func testCoreLabelsExistAfterRotation() {
        let app = XCUIApplication()
        app.launch()
        XCUIDevice.shared.orientation = .landscapeLeft
        assertCoreLabels(in: app)
        XCUIDevice.shared.orientation = .portrait
        assertCoreLabels(in: app)
    }

    override func tearDown() {
        XCUIDevice.shared.orientation = .portrait
        super.tearDown()
    }

    private func assertCoreLabels(in app: XCUIApplication) {
        for label in ["Explore", "Ingredients", "Recipes", "Extra"] {
            XCTAssertTrue(app.staticTexts[label].waitForExistence(timeout: 5))
        }
    }
}
