import Foundation

/// The signed-in user, as getUser and login give it.
struct UserProfile: Equatable, Sendable {
    var id: String
    var email: String
    var firstName: String
    var pro: Bool
}

/// A saved recipe: what the heart needs to know (its server id and library id).
struct SavedRecipeSummary: Equatable, Sendable {
    var id: String
    var libraryId: String?
}

enum APIError: Error, Equatable {
    /// the server answered with this HTTP status (404, 500 …)
    case http(Int)
    /// the server answered 200 with GraphQL errors
    case graphQL([String])
    /// the server answered without the data asked for (e.g. login with wrong details)
    case noData
    /// no answer at all
    case offline
}

/// Everything the apps ask the GraphQL server (server/src/schemas/typeDefs.ts), behind a protocol
/// so view models are tested without a network. The app's implementation uses Apollo iOS.
protocol IngreAPI: Sendable {
    func login(email: String, password: String) async throws -> (token: String, user: UserProfile)
    func currentUser() async throws -> UserProfile
    func savedRecipes() async throws -> [SavedRecipeSummary]
    func saveRecipe(_ input: RecipeInputValue) async throws -> SavedRecipeSummary
    func removeRecipe(id: String) async throws -> Bool
    /// A new Stripe Checkout session id, or nil when the server gave none.
    func checkoutSession() async throws -> String?
    func makeUserPro() async throws -> Bool
}

/// Where the JWT lives: the Keychain in the app, memory in tests. Never UserDefaults.
protocol TokenStore: Sendable {
    func read() -> String?
    func write(_ token: String?)
}

final class MemoryTokenStore: TokenStore, @unchecked Sendable {
    private let lock = NSLock()
    private var token: String?

    init(_ token: String? = nil) {
        self.token = token
    }

    func read() -> String? {
        lock.withLock { token }
    }

    func write(_ token: String?) {
        lock.withLock { self.token = token }
    }
}

/// The JWT's payload, as the server signs it: `{ data: { _id, email, firstName, pro }, exp }`.
struct JWTClaims: Decodable, Equatable, Sendable {
    struct Data: Decodable, Equatable, Sendable {
        var _id: String
        var email: String
        var firstName: String
        var pro: Bool?
    }

    var data: Data
    var exp: Double

    /// The claims of a token, or nil when it isn't a readable JWT.
    static func decode(_ token: String) -> JWTClaims? {
        let parts = token.split(separator: ".")
        guard parts.count == 3 else { return nil }
        var base64 = parts[1].replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
        while base64.count % 4 != 0 { base64 += "=" }
        guard let json = Foundation.Data(base64Encoded: base64) else { return nil }
        return try? JSONDecoder().decode(JWTClaims.self, from: json)
    }

    func isExpired(now: Date = Date()) -> Bool {
        exp < now.timeIntervalSince1970
    }
}

/// Stripe's hosted checkout page for a session (#195). The server returns only the session id
/// (the web hands it to Stripe.js `redirectToCheckout`), so the apps build the page's URL the way
/// Stripe.js does: the session id in the path and the publishable key, XOR 5 and base64, in the
/// fragment.
enum CheckoutURL {
    /// The web app's publishable test key (client/src/pages/Admin/checkout.ts).
    static let publishableKey = "pk_test_TYooMQauvdEDq54NiTphI7jx"

    static func make(sessionId: String, base: URL = URL(string: "https://checkout.stripe.com/c/pay/")!,
                     key: String = publishableKey) -> URL {
        let json = #"{"apiKey":"\#(key)"}"#
        let fragment = Foundation.Data(json.utf8.map { $0 ^ 5 }).base64EncodedString()
            .addingPercentEncoding(withAllowedCharacters: .urlFragmentAllowed) ?? ""
        let url = base.appendingPathComponent(sessionId)
        return URL(string: "\(url.absoluteString)#\(fragment)") ?? url
    }
}
