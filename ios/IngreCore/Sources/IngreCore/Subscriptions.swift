import Foundation
import Observation

// #314: the three tiers (#208, #312) as App Store auto-renewable subscriptions, one group.
// Everything here is plain Swift so it is tested on Linux; StoreKit lives in the app target
// behind `StoreGateway`.

public enum Tier: String, CaseIterable, Sendable {
    case explorer = "EXPLORER"
    case manager = "MANAGER"
    case leader = "LEADER"

    /// Same ids as the Stripe lookup keys and the Google Play products.
    public var productId: String {
        switch self {
        case .explorer: "ingre_explorer_monthly"
        case .manager: "ingre_manager_monthly"
        case .leader: "ingre_leader_monthly"
        }
    }

    public var label: String {
        switch self {
        case .explorer: "Explorer"
        case .manager: "Manager"
        case .leader: "Leader"
        }
    }

    public var usdPerMonth: Int {
        switch self {
        case .explorer: 4
        case .manager: 8
        case .leader: 16
        }
    }

    /// Level in the subscription group: 1 is the highest (Apple's rule).
    public var groupLevel: Int {
        switch self {
        case .leader: 1
        case .manager: 2
        case .explorer: 3
        }
    }

    /// Shown until the App Store gives the local price.
    public var fallbackPrice: String { "\(usdPerMonth) USD a month" }

    /// What the tier adds (docs/TIERS.md). Each tier includes the one below.
    public var adds: String {
        switch self {
        case .explorer: "Suggestions, capture support, triage"
        case .manager: "Budget, calendar, composed menus, guest profiles, risk handling"
        case .leader: "Precise execution, multi-day prep, dietary separation, HACCP, exact technique"
        }
    }

    public init?(productId: String) {
        guard let tier = Tier.allCases.first(where: { $0.productId == productId }) else { return nil }
        self = tier
    }

    public static var productIds: [String] { allCases.map(\.productId) }
}

/// The App Store subscription group all three tiers sit in.
public let subscriptionGroupName = "ingre plans"

/// The `tiers` flag (#208): off unless launched with `-IngreTiers YES` or built with INGRE_TIERS.
public func tiersEnabled(arguments: [String], compiledIn: Bool = false) -> Bool {
    if compiledIn { return true }
    guard let index = arguments.firstIndex(of: "-IngreTiers"), index + 1 < arguments.count else { return false }
    return ["YES", "1", "true"].contains(arguments[index + 1])
}

public enum PlanAction: Equatable, Sendable { case choose, upgrade, downgrade, current }

public func planAction(current: Tier?, tier: Tier) -> PlanAction {
    guard let current else { return .choose }
    if current == tier { return .current }
    return tier.groupLevel < current.groupLevel ? .upgrade : .downgrade
}

/// The button text for a tier: plain and literal.
public func planButtonLabel(current: Tier?, tier: Tier) -> String {
    switch planAction(current: current, tier: tier) {
    case .choose: "Choose \(tier.label)"
    case .upgrade: "Switch up to \(tier.label)"
    case .downgrade: "Switch down to \(tier.label)"
    case .current: "\(tier.label) is your plan"
    }
}

/// StoreKit's appAccountToken: the user's ObjectId zero padded to a UUID (the server reverses it).
public func appAccountToken(userId: String) -> UUID? {
    guard userId.count == 24, userId.allSatisfy(\.isHexDigit) else { return nil }
    let hex = userId.lowercased() + "00000000"
    let chars = Array(hex)
    func part(_ from: Int, _ to: Int) -> String { String(chars[from..<to]) }
    return UUID(uuidString: "\(part(0, 8))-\(part(8, 12))-\(part(12, 16))-\(part(16, 20))-\(part(20, 32))")
}

/// The user id (`data._id`) inside the app's JWT, or nil.
public func userId(fromJWT jwt: String?) -> String? {
    guard let jwt else { return nil }
    let parts = jwt.split(separator: ".", omittingEmptySubsequences: false)
    guard parts.count == 3 else { return nil }
    var base64 = parts[1].replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
    while base64.count % 4 != 0 { base64 += "=" }
    guard let data = Data(base64Encoded: base64),
          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let user = json["data"] as? [String: Any],
          let id = user["_id"] as? String,
          id.count == 24, id.allSatisfy(\.isHexDigit) else { return nil }
    return id
}

public let submitStorePurchaseMutation = "mutation SubmitStorePurchase($platform: StorePlatform!, $productId: String!, $purchaseToken: String!) { submitStorePurchase(platform: $platform, productId: $productId, purchaseToken: $purchaseToken) { tier status active } }"

/// The request body that sends a signed transaction (JWS) to the server.
public func submitPurchaseBody(productId: String, signedTransaction: String) -> Data {
    let body: [String: Any] = [
        "query": submitStorePurchaseMutation,
        "variables": ["platform": "APPLE", "productId": productId, "purchaseToken": signedTransaction]
    ]
    return (try? JSONSerialization.data(withJSONObject: body, options: [.sortedKeys])) ?? Data()
}

/// What the server says after checking a purchase with Apple.
public struct VerifiedPurchase: Equatable, Sendable {
    public let tier: Tier?
    public let active: Bool
    public let status: String
    public init(tier: Tier?, active: Bool, status: String) {
        self.tier = tier
        self.active = active
        self.status = status
    }
}

public enum SubmitError: Error, Equatable, Sendable {
    case notSignedIn
    case server(String)
}

/// The server's answer to submitPurchaseBody: the result, or the first error's message.
public func parseSubmitResponse(_ data: Data) throws -> VerifiedPurchase {
    guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        throw SubmitError.server("unreadable response")
    }
    if let errors = json["errors"] as? [[String: Any]], let first = errors.first {
        throw SubmitError.server(first["message"] as? String ?? "error")
    }
    guard let result = (json["data"] as? [String: Any])?["submitStorePurchase"] as? [String: Any],
          let active = result["active"] as? Bool,
          let status = result["status"] as? String else {
        throw SubmitError.server("unreadable response")
    }
    return VerifiedPurchase(tier: (result["tier"] as? String).flatMap(Tier.init(rawValue:)), active: active, status: status)
}

/// The token in the server's answer to `loginBody`, or nil (wrong password, or an error).
public func loginToken(from data: Data) -> String? {
    guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let login = (json["data"] as? [String: Any])?["login"] as? [String: Any],
          let token = login["token"] as? String, !token.isEmpty else { return nil }
    return token
}

// MARK: - The purchase flow, without StoreKit types

public struct StoreProductInfo: Equatable, Sendable {
    public let productId: String
    public let displayPrice: String
    public init(productId: String, displayPrice: String) {
        self.productId = productId
        self.displayPrice = displayPrice
    }
}

/// A transaction StoreKit has already verified on the device.
public struct StoreTransactionInfo: Equatable, Sendable {
    public let id: UInt64
    public let productId: String
    /// Transaction.jwsRepresentation, which the server verifies again with Apple
    public let signedTransaction: String
    public let revoked: Bool
    public let upgraded: Bool
    public init(id: UInt64, productId: String, signedTransaction: String, revoked: Bool = false, upgraded: Bool = false) {
        self.id = id
        self.productId = productId
        self.signedTransaction = signedTransaction
        self.revoked = revoked
        self.upgraded = upgraded
    }
}

public enum PurchaseOutcome: Equatable, Sendable {
    case purchased(StoreTransactionInfo)
    /// Ask to Buy or a payment that needs action: nothing yet
    case pending
    case cancelled
    case failed(String)
}

public protocol StoreGateway: Sendable {
    func products(_ ids: [String]) async throws -> [StoreProductInfo]
    func purchase(_ productId: String, appAccountToken: UUID?) async -> PurchaseOutcome
    /// Transaction.currentEntitlements, verified on the device
    func currentEntitlements() async -> [StoreTransactionInfo]
    /// AppStore.sync(), for "Restore purchases"
    func sync() async throws
    func finish(_ transactionId: UInt64) async
}

public protocol PurchaseSubmitter: Sendable {
    func submit(productId: String, signedTransaction: String) async throws -> VerifiedPurchase
}

public struct PlansState: Equatable, Sendable {
    public var loading = true
    public var available = true
    public var prices: [Tier: String] = [:]
    public var current: Tier?
    public var busy = false
    public var message: String?
    public init() {}
}

/// The highest tier among live entitlements (an upgraded or revoked one doesn't count).
public func entitledTier(_ entitlements: [StoreTransactionInfo]) -> Tier? {
    entitlements
        .filter { !$0.revoked && !$0.upgraded }
        .compactMap { Tier(productId: $0.productId) }
        .min { $0.groupLevel < $1.groupLevel }
}

/// #314: buying, restoring and switching tiers. A transaction only counts once the server has
/// checked it with Apple; it is finished after that, so StoreKit offers an unconfirmed one
/// again (Transaction.updates / currentEntitlements) instead of losing it.
@MainActor
@Observable
public final class PlansModel {
    public private(set) var state = PlansState()
    private let store: StoreGateway
    private let submitter: PurchaseSubmitter
    private let accountId: @MainActor () -> String?

    public init(store: StoreGateway, submitter: PurchaseSubmitter, accountId: @escaping @MainActor () -> String?) {
        self.store = store
        self.submitter = submitter
        self.accountId = accountId
    }

    public static let unavailable = "The App Store isn't available right now."

    /// Reads prices and quietly confirms a plan bought before.
    public func load() async {
        state.loading = true
        do {
            let products = try await store.products(Tier.productIds)
            var prices: [Tier: String] = [:]
            for product in products {
                if let tier = Tier(productId: product.productId) { prices[tier] = product.displayPrice }
            }
            state.prices = prices
            state.available = !prices.isEmpty
            if prices.isEmpty { state.message = Self.unavailable }
        } catch {
            state.available = false
            state.message = Self.unavailable
        }
        state.loading = false
        await confirm(await store.currentEntitlements(), announce: false)
    }

    /// Buys `tier`. In one group StoreKit upgrades at once and downgrades at the next renewal.
    public func choose(_ tier: Tier) async {
        guard planAction(current: state.current, tier: tier) != .current else { return }
        guard state.prices[tier] != nil else {
            state.message = "\(tier.label) isn't available right now."
            return
        }
        state.busy = true
        state.message = nil
        let token = accountId().flatMap(appAccountToken(userId:))
        switch await store.purchase(tier.productId, appAccountToken: token) {
        case .purchased(let transaction):
            await confirm([transaction], announce: true)
        case .pending:
            state.message = "Waiting for the purchase to be approved."
        case .cancelled:
            break
        case .failed(let message):
            state.message = message
        }
        state.busy = false
    }

    /// A transaction from Transaction.updates (renewals, purchases made elsewhere, Ask to Buy).
    public func handle(_ transaction: StoreTransactionInfo) async {
        await confirm([transaction], announce: true)
    }

    /// "Restore purchases".
    public func restore() async {
        state.busy = true
        state.message = nil
        do {
            try await store.sync()
        } catch {
            state.message = "Couldn't reach the App Store. Try again."
            state.busy = false
            return
        }
        let entitlements = await store.currentEntitlements()
        if entitledTier(entitlements) == nil {
            state.message = "No plan to restore on this Apple Account."
        } else {
            await confirm(entitlements, announce: true)
        }
        state.busy = false
    }

    private func confirm(_ transactions: [StoreTransactionInfo], announce: Bool) async {
        var message: String?
        for transaction in transactions where Tier(productId: transaction.productId) != nil {
            if transaction.revoked || transaction.upgraded {
                await store.finish(transaction.id)
                continue
            }
            do {
                let verified = try await submitter.submit(
                    productId: transaction.productId,
                    signedTransaction: transaction.signedTransaction
                )
                await store.finish(transaction.id)
                if verified.active, let tier = verified.tier {
                    state.current = tier
                    message = "You're on \(tier.label)."
                } else {
                    message = "The App Store says this plan isn't active (\(verified.status))."
                }
            } catch SubmitError.notSignedIn {
                message = "Log in to choose a plan."
            } catch SubmitError.server(let reason) {
                message = "Couldn't confirm the purchase: \(reason)."
            } catch {
                message = "Couldn't confirm the purchase. Try again."
            }
        }
        if announce, let message { state.message = message }
    }
}
