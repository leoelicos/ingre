import XCTest

/// The four screenshots for #195, on canned GraphQL: closed recipes, an open recipe,
/// Explore collapsed, Explore open. CI uploads them as an artifact.
@MainActor
final class ScreenshotTests: XCTestCase {
    func testScreenshots() {
        let app = launchApp(seed: ["spaghetti-bolognese", "egg-fried-rice"])
        XCTAssertEqual(app.buttons["explore.toggle"].value as? String, "collapsed")
        capture("3-explore-collapsed", app, in: self)

        app.buttons["recipes.header"].scrolledTo(in: app)
        app.swipeUp(velocity: .slow)
        capture("1-recipes-closed", app, in: self)

        app.buttons["recipes.open.spaghetti-bolognese"].scrolledTo(in: app).tap()
        XCTAssertTrue(app.buttons["row-spaghetti-bolognese.chip.spaghetti"].waitForExistence(timeout: 5))
        capture("2-recipe-open", app, in: self)

        let relaunched = launchApp(seed: ["spaghetti-bolognese", "egg-fried-rice"])
        relaunched.buttons["explore.toggle"].tap()
        XCTAssertTrue(relaunched.buttons["explore.hide"].waitForExistence(timeout: 5))
        capture("4-explore-open", relaunched, in: self)
    }
}
