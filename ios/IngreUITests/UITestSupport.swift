import XCTest

/// Launches the app on canned GraphQL (INGRE_MOCK) with a fresh list in memory.
@MainActor
func launchApp(
    mock: String = "success", seed: [String] = [], signedIn: Bool = false,
    extra: [String: String] = [:]
) -> XCUIApplication {
    let app = XCUIApplication()
    app.launchEnvironment["INGRE_MOCK"] = mock
    app.launchEnvironment["INGRE_SEED"] = seed.joined(separator: ",")
    if signedIn { app.launchEnvironment["INGRE_SIGNED_IN"] = "1" }
    for (key, value) in extra { app.launchEnvironment[key] = value }
    app.launch()
    return app
}

extension XCUIElement {
    /// Scrolls the list until this element is on screen.
    @MainActor
    @discardableResult
    func scrolledTo(
        in app: XCUIApplication, maxSwipes: Int = 12, file: StaticString = #filePath, line: UInt = #line
    ) -> XCUIElement {
        var swipes = 0
        while !(exists && isHittable) && swipes < maxSwipes {
            app.swipeUp(velocity: .slow)
            swipes += 1
        }
        XCTAssertTrue(exists, "\(self) never appeared", file: file, line: line)
        return self
    }
}

/// Saves a screenshot as a test attachment and, when SCREENSHOT_DIR is set (CI), as a PNG.
@MainActor
func capture(_ name: String, _ app: XCUIApplication, in test: XCTestCase) {
    let shot = app.screenshot()
    let attachment = XCTAttachment(screenshot: shot)
    attachment.name = name
    attachment.lifetime = .keepAlways
    test.add(attachment)
    if let dir = ProcessInfo.processInfo.environment["SCREENSHOT_DIR"], !dir.isEmpty {
        let url = URL(fileURLWithPath: dir).appendingPathComponent("\(name).png")
        try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        try? shot.pngRepresentation.write(to: url)
    }
}
