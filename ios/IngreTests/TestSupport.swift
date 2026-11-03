import Foundation

@testable import Ingre

/// The repo root, from this file's path (ios/IngreTests/TestSupport.swift).
let repoRoot = URL(fileURLWithPath: #filePath).resolvingSymlinksInPath().deletingLastPathComponent()
    .deletingLastPathComponent()
    .deletingLastPathComponent()

/// The string catalog, read from the source file, so wording tests run hosted or not.
@MainActor
enum TestSupport {
    static let catalog: [String: String] = {
        let url = repoRoot.appendingPathComponent("ios/Ingre/Resources/Localizable.xcstrings")
        guard let data = try? Data(contentsOf: url),
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let strings = json["strings"] as? [String: [String: Any]]
        else { return [:] }
        var result: [String: String] = [:]
        for (key, entry) in strings {
            let en = (entry["localizations"] as? [String: Any])?["en"] as? [String: Any]
            if let value = (en?["stringUnit"] as? [String: Any])?["value"] as? String { result[key] = value }
        }
        return result
    }()

    static func useCatalog() {
        let strings = catalog
        L10n.lookup = { strings[$0] ?? $0 }
    }

    /// The same JSON the web client bundles (client/src/data), read from the repo.
    static func library() throws -> Library {
        let data = repoRoot.appendingPathComponent("client/src/data")
        return try Library.parse(
            ingredients: Data(contentsOf: data.appendingPathComponent("ingredients.json")),
            recipes: Data(contentsOf: data.appendingPathComponent("recipes.json"))
        )
    }
}

/// A scripted API: every call is recorded, and each answer can be swapped per test.
final class FakeAPI: IngreAPI, @unchecked Sendable {
    private let lock = NSLock()
    private var _calls: [String] = []
    var calls: [String] { lock.withLock { _calls } }

    var loginResult: Result<(token: String, user: UserProfile), APIError> = .failure(.noData)
    var user = UserProfile(id: "u1", email: "ann@example.com", firstName: "Ann", pro: false)
    var saved: [SavedRecipeSummary] = []
    var saveFails = false
    var session: Result<String?, APIError> = .success("cs_test_123")
    var proResult = true
    var savedInputs: [RecipeInputValue] = []
    /// Called inside checkoutSession, so a test can tap again while one is in flight.
    var duringCheckout: (@Sendable () async -> Void)?

    private func record(_ call: String) {
        lock.withLock { _calls.append(call) }
    }

    func login(email: String, password: String) async throws -> (token: String, user: UserProfile) {
        record("login")
        return try loginResult.get()
    }

    func currentUser() async throws -> UserProfile {
        record("getUser")
        return user
    }

    func savedRecipes() async throws -> [SavedRecipeSummary] {
        record("getSavedRecipes")
        return saved
    }

    func saveRecipe(_ input: RecipeInputValue) async throws -> SavedRecipeSummary {
        record("saveRecipe")
        if saveFails { throw APIError.http(500) }
        savedInputs.append(input)
        let recipe = SavedRecipeSummary(id: "s\(savedInputs.count)", libraryId: input.libraryId)
        saved.append(recipe)
        return recipe
    }

    func removeRecipe(id: String) async throws -> Bool {
        record("removeRecipe")
        saved.removeAll { $0.id == id }
        return true
    }

    func checkoutSession() async throws -> String? {
        record("checkout")
        await duringCheckout?()
        return try session.get()
    }

    func makeUserPro() async throws -> Bool {
        record("makeUserPro")
        return proResult
    }
}

/// A JWT the server could have signed (the signature is not checked on the device).
func makeToken(firstName: String = "Ann", exp: Double = 4_102_444_800) -> String {
    func part(_ json: String) -> String {
        Data(json.utf8).base64EncodedString().replacingOccurrences(of: "=", with: "")
            .replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_")
    }
    let payload =
        #"{"data":{"_id":"u1","email":"ann@example.com","firstName":"\#(firstName)","pro":false},"exp":\#(Int(exp))}"#
    return "\(part(#"{"alg":"HS256","typ":"JWT"}"#)).\(part(payload)).sig"
}

/// Records the checkout URL and answers as told.
final class RecordingOpener: CheckoutOpener, @unchecked Sendable {
    var opened: [URL] = []
    var answer: CheckoutReturn = .cancel

    @MainActor func open(_ url: URL) async -> CheckoutReturn {
        opened.append(url)
        return answer
    }
}
