import XCTest

/// The journeys from #195, on canned GraphQL through the real Apollo client.
@MainActor
final class JourneyTests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    func testAddIngredientToExtra() {
        let app = launchApp()
        app.buttons["extra.add"].scrolledTo(in: app).tap()
        app.buttons["plus.item.garlic"].scrolledTo(in: app).tap()
        XCTAssertTrue(app.buttons["extra.chip.garlic"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["chip.chip.garlic"].exists, "the Ingredients section lists it too")
        XCTAssertEqual(app.staticTexts["ingredients.status"].label, "Garlic added to Extra")
    }

    func testAddRecipeFromExplore() {
        let app = launchApp()
        // nothing on the list: Explore starts open
        XCTAssertEqual(app.buttons["explore.toggle"].value as? String, "expanded")
        let pick = app.buttons["explore.pick.spaghetti-bolognese"].scrolledTo(in: app)
        pick.tap()
        XCTAssertEqual(pick.value as? String, "picked")
        XCTAssertTrue(app.buttons["recipes.pick.spaghetti-bolognese"].scrolledTo(in: app).exists)
        XCTAssertTrue(app.buttons["chip.chip.spaghetti"].scrolledTo(in: app).exists)
    }

    func testOpenAndCloseARecipe() {
        let app = launchApp(seed: ["spaghetti-bolognese"])
        let open = app.buttons["recipes.open.spaghetti-bolognese"].scrolledTo(in: app)
        XCTAssertEqual(open.value as? String, "collapsed")
        open.tap()
        XCTAssertEqual(open.value as? String, "expanded")
        let chip = app.buttons["row-spaghetti-bolognese.chip.spaghetti"]
        XCTAssertTrue(chip.waitForExistence(timeout: 5))
        XCTAssertFalse(app.otherElements["recipes.names.spaghetti-bolognese"].exists)
        // a tap crosses the chip off; the chevron opens its panel inline
        chip.tap()
        XCTAssertTrue(chip.label.hasSuffix("crossed off"))
        app.buttons["row-spaghetti-bolognese.chevron.spaghetti"].tap()
        XCTAssertTrue(app.otherElements["row-spaghetti-bolognese.panel.spaghetti"].waitForExistence(timeout: 5))
        open.scrolledTo(in: app).tap()
        XCTAssertEqual(open.value as? String, "collapsed")
        XCTAssertTrue(app.otherElements["recipes.names.spaghetti-bolognese"].waitForExistence(timeout: 5))
    }

    func testExploreCollapsesToItsHeaderRow() {
        let app = launchApp(seed: ["spaghetti-bolognese"])
        let toggle = app.buttons["explore.toggle"]
        // something on the list: Explore starts collapsed, header row only
        XCTAssertEqual(toggle.value as? String, "collapsed")
        XCTAssertFalse(app.buttons["explore.hide"].exists)
        XCTAssertFalse(app.otherElements["explore.content"].exists)
        XCTAssertFalse(app.buttons["explore.pick.egg-fried-rice"].exists)
        toggle.tap()
        XCTAssertEqual(toggle.value as? String, "expanded")
        XCTAssertTrue(app.buttons["explore.hide"].exists)
        XCTAssertTrue(app.buttons["explore.pick.egg-fried-rice"].waitForExistence(timeout: 5))
        app.buttons["explore.hide"].tap()
        XCTAssertEqual(toggle.value as? String, "collapsed")
        XCTAssertFalse(app.buttons["explore.pick.egg-fried-rice"].exists)
        // and the header row opens it again
        toggle.tap()
        XCTAssertEqual(toggle.value as? String, "expanded")
    }

    func testSearchOpensExploreWithMatches() {
        let app = launchApp(seed: ["spaghetti-bolognese"])
        let search = app.textFields["search.field"]
        search.tap()
        search.typeText("dahl")
        XCTAssertEqual(app.buttons["explore.toggle"].value as? String, "expanded")
        XCTAssertTrue(app.buttons["explore.pick.dahl"].waitForExistence(timeout: 5))
    }

    func testSignIn() {
        let app = launchApp()
        app.buttons["account.open"].tap()
        app.buttons["auth.submit"].tap()
        XCTAssertEqual(app.staticTexts["auth.validation"].label, "Please enter an email address.")
        app.textFields["auth.email"].tap()
        app.textFields["auth.email"].typeText("ann@example.com")
        app.buttons["auth.submit"].tap()
        XCTAssertEqual(app.staticTexts["auth.validation"].label, "Please enter a password.")
        app.secureTextFields["auth.password"].tap()
        app.secureTextFields["auth.password"].typeText("secret")
        app.buttons["auth.submit"].tap()
        XCTAssertTrue(app.staticTexts["account.signedIn"].waitForExistence(timeout: 10))
        XCTAssertEqual(app.staticTexts["account.signedIn"].label, "Signed in as Ann")
        app.buttons["account.logOut"].tap()
        XCTAssertTrue(app.buttons["auth.submit"].waitForExistence(timeout: 5))
    }

    func testSignInFailsOnServerErrors() {
        for mock in ["server-error", "not-found"] {
            let app = launchApp(mock: mock)
            app.buttons["account.open"].tap()
            app.textFields["auth.email"].tap()
            app.textFields["auth.email"].typeText("ann@example.com")
            app.secureTextFields["auth.password"].tap()
            app.secureTextFields["auth.password"].typeText("secret")
            app.buttons["auth.submit"].tap()
            XCTAssertTrue(app.staticTexts["auth.failed"].waitForExistence(timeout: 10), mock)
            XCTAssertEqual(app.staticTexts["auth.failed"].label, "Couldn't log you in.")
            app.terminate()
        }
    }

    func testUpgradeStartsOneCheckoutOnADoubleTap() {
        let app = launchApp(signedIn: true, extra: ["INGRE_MOCK_DELAY": "1.5"])
        app.buttons["account.open"].tap()
        app.buttons["account.upgrade"].tap()
        let checkout = app.buttons["upgrade.checkout"]
        XCTAssertTrue(checkout.waitForExistence(timeout: 10))
        checkout.tap()
        checkout.tap()
        XCTAssertTrue(app.staticTexts["upgrade.starting"].waitForExistence(timeout: 2))
        XCTAssertEqual(app.staticTexts["upgrade.starting"].label, "Starting the Stripe checkout…")
        let url = app.staticTexts["upgrade.mockCheckoutURL"]
        XCTAssertTrue(url.waitForExistence(timeout: 10))
        XCTAssertTrue(url.label.hasPrefix("https://checkout.mock.ingre.test/c/pay/cs_test_mock#"), url.label)
        XCTAssertEqual(app.staticTexts["upgrade.mockCheckoutCount"].label, "1")
        XCTAssertTrue(app.staticTexts["upgrade.cancelled"].exists)
    }

    func testUpgradeSuccessMakesTheUserPro() {
        let app = launchApp(signedIn: true, extra: ["INGRE_CHECKOUT": "success"])
        app.buttons["account.open"].tap()
        app.buttons["account.upgrade"].tap()
        app.buttons["upgrade.checkout"].tap()
        XCTAssertTrue(app.staticTexts["upgrade.success"].waitForExistence(timeout: 10))
    }

    func testUpgradeFailuresShowTheMessage() {
        for mock in ["server-error", "not-found"] {
            let app = launchApp(mock: mock, signedIn: true)
            app.buttons["account.open"].tap()
            app.buttons["account.upgrade"].tap()
            app.buttons["upgrade.checkout"].tap()
            XCTAssertTrue(app.staticTexts["upgrade.failed"].waitForExistence(timeout: 10), mock)
            XCTAssertFalse(app.staticTexts["upgrade.mockCheckoutURL"].exists)
            app.terminate()
        }
    }

    func testUpgradeNeedsSignIn() {
        let app = launchApp()
        app.buttons["account.open"].tap()
        app.buttons["account.upgrade"].tap()
        XCTAssertEqual(app.staticTexts["upgrade.notLoggedIn"].label, "You need to be logged in to see this page.")
    }
}
