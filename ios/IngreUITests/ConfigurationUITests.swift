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
        assertWindow(app, isLandscape: true)
        assertCoreLabels(in: app, hittable: true)
        XCUIDevice.shared.orientation = .portrait
        assertWindow(app, isLandscape: false)
        assertCoreLabels(in: app, hittable: true)
    }

    override func tearDown() {
        XCUIDevice.shared.orientation = .portrait
        super.tearDown()
    }

    private func assertWindow(_ app: XCUIApplication, isLandscape: Bool, timeout: TimeInterval = 5) {
        let window = app.windows.firstMatch
        let deadline = Date().addingTimeInterval(timeout)
        while Date() < deadline {
            let frame = window.frame
            let matches = isLandscape ? frame.width > frame.height : frame.height > frame.width
            if matches {
                break
            }
            RunLoop.current.run(until: Date().addingTimeInterval(0.1))
        }
        let frame = window.frame
        if isLandscape {
            XCTAssertGreaterThan(frame.width, frame.height, "expected landscape window, got \(frame)")
        } else {
            XCTAssertGreaterThan(frame.height, frame.width, "expected portrait window, got \(frame)")
        }
    }

    private func assertCoreLabels(in app: XCUIApplication, hittable: Bool = false) {
        for label in ["Explore", "Ingredients", "Recipes", "Extra"] {
            let element = app.staticTexts[label]
            XCTAssertTrue(element.waitForExistence(timeout: 5))
            if hittable {
                XCTAssertTrue(element.isHittable)
            }
        }
    }
}
