import Foundation
import Observation

/// Pushed screens. Account and Upgrade are pages in the stack, never sheets (#195).
enum Route: Hashable {
    case account
    case upgrade
}

/// Settings from the build configuration (Config/*.xcconfig → Info.plist).
struct AppConfig {
    var graphQLURL: URL
    var webOrigin: String
    var checkoutBase: URL

    static func fromBundle(_ bundle: Bundle = .main) -> AppConfig {
        func value(_ key: String, _ fallback: String) -> String {
            let raw = bundle.object(forInfoDictionaryKey: key) as? String ?? ""
            return raw.isEmpty ? fallback : raw
        }
        return AppConfig(
            graphQLURL: URL(string: value("IngreGraphQLURL", "https://ingre-backend.onrender.com/graphql"))!,
            webOrigin: value("IngreWebOrigin", "https://ingre.vercel.app"),
            checkoutBase: URL(string: value("IngreCheckoutBaseURL", "https://checkout.stripe.com/c/pay/"))!
        )
    }
}

/// Everything the screens share, built once at launch.
@MainActor
@Observable
final class AppModel {
    let list: ShoppingListViewModel
    let recipes: RecipesViewModel
    let explore: ExploreViewModel
    let account: AccountViewModel
    let upgrade: UpgradeViewModel
    /// Set in UI tests: the checkout URL the app would have opened.
    let mockOpener: MockCheckoutOpener?
    var path: [Route] = []

    init(
        library: Library, storage: ListStorage, api: any IngreAPI, tokens: any TokenStore,
        opener: any CheckoutOpener, checkoutBase: URL, mockOpener: MockCheckoutOpener? = nil
    ) {
        list = ShoppingListViewModel(library: library, storage: storage)
        recipes = RecipesViewModel(list: list)
        explore = ExploreViewModel(list: list)
        account = AccountViewModel(api: api, tokens: tokens)
        upgrade = UpgradeViewModel(api: api, opener: opener, checkoutBase: checkoutBase)
        self.mockOpener = mockOpener
    }

    /// The real app, or with INGRE_MOCK set (UI tests): canned GraphQL through the real Apollo
    /// client, a recorded checkout, and a fresh list in memory seeded from INGRE_SEED.
    static func launch(_ environment: [String: String] = ProcessInfo.processInfo.environment) throws -> AppModel {
        let library = try Library.load()
        let config = AppConfig.fromBundle()
        guard let raw = environment["INGRE_MOCK"], let mode = MockMode(rawValue: raw) else {
            let tokens = KeychainTokenStore()
            return AppModel(
                library: library, storage: ListStorage(store: FileStore()),
                api: ApolloIngreAPI(
                    endpoint: config.graphQLURL, webOrigin: config.webOrigin, tokens: tokens, session: .shared),
                tokens: tokens, opener: WebCheckoutOpener(), checkoutBase: config.checkoutBase
            )
        }
        MockURLProtocol.mode = mode
        MockURLProtocol.delay = Double(environment["INGRE_MOCK_DELAY"] ?? "") ?? 0
        let tokens = MemoryTokenStore(environment["INGRE_SIGNED_IN"] == "1" ? MockURLProtocol.token : nil)
        let store = MemoryStore()
        let storage = ListStorage(store: store)
        if let seed = environment["INGRE_SEED"], !seed.isEmpty {
            var state = ListState()
            state.copies = seed.split(separator: ",").map { RecipeCopy(recipeId: String($0)) }
            storage.save(state)
        }
        let answer: CheckoutReturn =
            switch environment["INGRE_CHECKOUT"] {
            case "success": .success
            case "dismissed": .dismissed
            default: .cancel
            }
        let opener = MockCheckoutOpener(answer: answer)
        return AppModel(
            library: library, storage: storage,
            api: ApolloIngreAPI(
                endpoint: URL(string: "https://mock.ingre.test/graphql")!, webOrigin: config.webOrigin,
                tokens: tokens, session: MockURLProtocol.session()
            ),
            tokens: tokens, opener: opener, checkoutBase: URL(string: "https://checkout.mock.ingre.test/c/pay/")!,
            mockOpener: opener
        )
    }

    /// The Saved account item: back to the list with Explore showing only hearted recipes.
    func showSaved() {
        path = []
        explore.showSaved()
    }

    /// `ingre://upgrade/success` or `/cancel` opened the app (Stripe's return).
    func handle(_ url: URL) async {
        guard let result = CheckoutReturn(url: url) else { return }
        path = [.upgrade]
        await upgrade.finish(result)
    }
}
