import Foundation
import XCTest
@testable import IngreCore

/// #314: tiers, the flag, the server call, and the purchase flow against a fake App Store.
final class SubscriptionsTests: XCTestCase {
    let user = "65a1b2c3d4e5f60718293a4b"

    func testProductIdsMatchGooglePlayAndTheServer() {
        XCTAssertEqual(Tier.productIds, ["ingre_explorer_monthly", "ingre_manager_monthly", "ingre_leader_monthly"])
        XCTAssertEqual(Tier(productId: "ingre_leader_monthly"), .leader)
        XCTAssertNil(Tier(productId: "coins"))
        XCTAssertEqual(Tier.manager.fallbackPrice, "8 USD a month")
        XCTAssertEqual(Tier.allCases.map(\.groupLevel), [3, 2, 1])
        XCTAssertFalse(Tier.leader.adds.isEmpty)
    }

    func testTiersAreOffByDefault() {
        XCTAssertFalse(tiersEnabled(arguments: ["Ingre"]))
        XCTAssertFalse(tiersEnabled(arguments: ["Ingre", "-IngreTiers"]))
        XCTAssertFalse(tiersEnabled(arguments: ["Ingre", "-IngreTiers", "NO"]))
        XCTAssertTrue(tiersEnabled(arguments: ["Ingre", "-IngreTiers", "YES"]))
        XCTAssertTrue(tiersEnabled(arguments: [], compiledIn: true))
    }

    func testButtonsSayWhatHappens() {
        XCTAssertEqual(planButtonLabel(current: nil, tier: .explorer), "Choose Explorer")
        XCTAssertEqual(planButtonLabel(current: .manager, tier: .leader), "Switch up to Leader")
        XCTAssertEqual(planButtonLabel(current: .manager, tier: .explorer), "Switch down to Explorer")
        XCTAssertEqual(planButtonLabel(current: .manager, tier: .manager), "Manager is your plan")
    }

    func testAppAccountTokenIsTheUserIdAsAUUID() {
        XCTAssertEqual(appAccountToken(userId: user)?.uuidString.lowercased(), "65a1b2c3-d4e5-f607-1829-3a4b00000000")
        XCTAssertNil(appAccountToken(userId: "cook@example.com"))
    }

    func testUserIdFromTheAppToken() {
        func jwt(_ payload: String) -> String {
            let b64 = Data(payload.utf8).base64EncodedString()
                .replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_")
                .replacingOccurrences(of: "=", with: "")
            return "x.\(b64).y"
        }
        XCTAssertEqual(userId(fromJWT: jwt(#"{"data":{"_id":"65a1b2c3d4e5f60718293a4b"}}"#)), user)
        XCTAssertNil(userId(fromJWT: jwt(#"{"data":{"_id":"nope"}}"#)))
        XCTAssertNil(userId(fromJWT: jwt("not json")))
        XCTAssertNil(userId(fromJWT: "nodots"))
        XCTAssertNil(userId(fromJWT: nil))
    }

    func testTheMutationSendsTheSignedTransaction() throws {
        let body = try XCTUnwrap(
            JSONSerialization.jsonObject(with: submitPurchaseBody(productId: "ingre_manager_monthly", signedTransaction: "eyJ.jws.sig")) as? [String: Any]
        )
        let variables = try XCTUnwrap(body["variables"] as? [String: String])
        XCTAssertEqual(variables, ["platform": "APPLE", "productId": "ingre_manager_monthly", "purchaseToken": "eyJ.jws.sig"])
        XCTAssertTrue((body["query"] as? String)?.contains("submitStorePurchase(platform:") ?? false)
    }

    func testTheServerAnswer() throws {
        let ok = Data(#"{"data":{"submitStorePurchase":{"tier":"LEADER","status":"active","active":true}}}"#.utf8)
        XCTAssertEqual(try parseSubmitResponse(ok), VerifiedPurchase(tier: .leader, active: true, status: "active"))
        let none = Data(#"{"data":{"submitStorePurchase":{"tier":null,"status":"incomplete","active":false}}}"#.utf8)
        XCTAssertEqual(try parseSubmitResponse(none), VerifiedPurchase(tier: nil, active: false, status: "incomplete"))
        let refused = Data(#"{"errors":[{"message":"App Store purchases are not set up on this server"}]}"#.utf8)
        XCTAssertThrowsError(try parseSubmitResponse(refused)) {
            XCTAssertEqual($0 as? SubmitError, .server("App Store purchases are not set up on this server"))
        }
        XCTAssertThrowsError(try parseSubmitResponse(Data("<html>".utf8)))
        XCTAssertThrowsError(try parseSubmitResponse(Data(#"{"data":{}}"#.utf8)))
    }

    func testLoginToken() {
        XCTAssertEqual(loginToken(from: Data(#"{"data":{"login":{"token":"eyJ.a.b"}}}"#.utf8)), "eyJ.a.b")
        XCTAssertNil(loginToken(from: Data(#"{"data":{"login":null}}"#.utf8)))
        XCTAssertNil(loginToken(from: Data(#"{"errors":[{"message":"Incorrect credentials"}]}"#.utf8)))
        XCTAssertNil(loginToken(from: Data("nope".utf8)))
    }

    func testEntitledTierIsTheHighestLiveOne() {
        let explorer = StoreTransactionInfo(id: 1, productId: Tier.explorer.productId, signedTransaction: "a")
        let leader = StoreTransactionInfo(id: 2, productId: Tier.leader.productId, signedTransaction: "b")
        let upgradedAway = StoreTransactionInfo(id: 3, productId: Tier.leader.productId, signedTransaction: "c", upgraded: true)
        let refunded = StoreTransactionInfo(id: 4, productId: Tier.manager.productId, signedTransaction: "d", revoked: true)
        XCTAssertEqual(entitledTier([explorer, leader]), .leader)
        XCTAssertEqual(entitledTier([explorer, upgradedAway, refunded]), .explorer)
        XCTAssertNil(entitledTier([]))
    }
}

// MARK: - The purchase flow

actor FakeAppStore: StoreGateway {
    var offered: [StoreProductInfo] = Tier.allCases.map { StoreProductInfo(productId: $0.productId, displayPrice: "A$\($0.usdPerMonth).99") }
    var loadFails = false
    var syncFails = false
    var nextOutcome: PurchaseOutcome = .cancelled
    var entitlements: [StoreTransactionInfo] = []
    private(set) var finished: [UInt64] = []
    private(set) var purchases: [(String, UUID?)] = []

    func set(outcome: PurchaseOutcome) { nextOutcome = outcome }
    func set(entitlements: [StoreTransactionInfo]) { self.entitlements = entitlements }
    func set(offered: [StoreProductInfo]) { self.offered = offered }
    func set(loadFails: Bool, syncFails: Bool = false) {
        self.loadFails = loadFails
        self.syncFails = syncFails
    }
    func purchaseCount() -> Int { purchases.count }
    func lastToken() -> UUID? { purchases.last?.1 }

    func products(_ ids: [String]) async throws -> [StoreProductInfo] {
        if loadFails { throw URLError(.notConnectedToInternet) }
        return offered.filter { ids.contains($0.productId) }
    }
    func purchase(_ productId: String, appAccountToken: UUID?) async -> PurchaseOutcome {
        purchases.append((productId, appAccountToken))
        return nextOutcome
    }
    func currentEntitlements() async -> [StoreTransactionInfo] { entitlements }
    func sync() async throws { if syncFails { throw URLError(.timedOut) } }
    func finish(_ transactionId: UInt64) async { finished.append(transactionId) }
}

actor FakeServer: PurchaseSubmitter {
    var known: [String: VerifiedPurchase] = [:]
    var signedIn = true
    private(set) var submitted: [String] = []
    func knows(_ jws: String, _ tier: Tier, active: Bool = true) {
        known[jws] = VerifiedPurchase(tier: tier, active: active, status: active ? "active" : "canceled")
    }
    func signOut() { signedIn = false }
    func submit(productId: String, signedTransaction: String) async throws -> VerifiedPurchase {
        submitted.append(signedTransaction)
        guard signedIn else { throw SubmitError.notSignedIn }
        guard let verified = known[signedTransaction] else { throw SubmitError.server("STORE_VERIFICATION_FAILED") }
        return verified
    }
}

@MainActor
final class PlansModelTests: XCTestCase {
    let user = "65a1b2c3d4e5f60718293a4b"
    func make(_ store: FakeAppStore, _ server: FakeServer) -> PlansModel {
        PlansModel(store: store, submitter: server) { self.user }
    }
    func transaction(_ id: UInt64, _ tier: Tier) -> StoreTransactionInfo {
        StoreTransactionInfo(id: id, productId: tier.productId, signedTransaction: "jws-\(id)")
    }

    func testLoadShowsAppStorePrices() async {
        let model = make(FakeAppStore(), FakeServer())
        await model.load()
        XCTAssertFalse(model.state.loading)
        XCTAssertTrue(model.state.available)
        XCTAssertEqual(model.state.prices[.manager], "A$8.99")
        XCTAssertNil(model.state.current)
    }

    func testWithoutTheAppStoreNothingCanBeBought() async {
        let store = FakeAppStore()
        await store.set(loadFails: true)
        let model = make(store, FakeServer())
        await model.load()
        XCTAssertFalse(model.state.available)
        XCTAssertEqual(model.state.message, PlansModel.unavailable)
        await model.choose(.explorer)
        XCTAssertEqual(model.state.message, "Explorer isn't available right now.")
        let none = FakeAppStore()
        await none.set(offered: [])
        let empty = make(none, FakeServer())
        await empty.load()
        XCTAssertFalse(empty.state.available)
    }

    func testAPurchaseCountsOnlyAfterTheServerConfirmsItThenIsFinished() async {
        let store = FakeAppStore()
        let server = FakeServer()
        await store.set(outcome: .purchased(transaction(7, .manager)))
        await server.knows("jws-7", .manager)
        let model = make(store, server)
        await model.load()
        await model.choose(.manager)
        XCTAssertEqual(model.state.current, .manager)
        XCTAssertEqual(model.state.message, "You're on Manager.")
        XCTAssertFalse(model.state.busy)
        let finished = await store.finished
        XCTAssertEqual(finished, [7])
        let token = await store.lastToken()
        XCTAssertEqual(token, appAccountToken(userId: user))
    }

    func testARefusedPurchaseIsNeitherGrantedNorFinished() async {
        let store = FakeAppStore()
        await store.set(outcome: .purchased(transaction(8, .leader)))
        let model = make(store, FakeServer())
        await model.load()
        await model.choose(.leader)
        XCTAssertNil(model.state.current)
        XCTAssertEqual(model.state.message, "Couldn't confirm the purchase: STORE_VERIFICATION_FAILED.")
        let finished = await store.finished
        XCTAssertTrue(finished.isEmpty)
    }

    func testSignedOutIsAskedToLogIn() async {
        let store = FakeAppStore()
        let server = FakeServer()
        await server.signOut()
        await store.set(outcome: .purchased(transaction(9, .explorer)))
        let model = make(store, server)
        await model.load()
        await model.choose(.explorer)
        XCTAssertEqual(model.state.message, "Log in to choose a plan.")
    }

    func testPendingCancelledAndFailedPurchases() async {
        let store = FakeAppStore()
        let model = make(store, FakeServer())
        await model.load()
        await store.set(outcome: .pending)
        await model.choose(.explorer)
        XCTAssertEqual(model.state.message, "Waiting for the purchase to be approved.")
        await store.set(outcome: .cancelled)
        await model.choose(.explorer)
        XCTAssertNil(model.state.message)
        await store.set(outcome: .failed("The purchase didn't go through."))
        await model.choose(.explorer)
        XCTAssertEqual(model.state.message, "The purchase didn't go through.")
        XCTAssertFalse(model.state.busy)
    }

    func testTheCurrentPlanIsNotBoughtAgainAndSwitchingBuysInTheGroup() async {
        let store = FakeAppStore()
        let server = FakeServer()
        await store.set(entitlements: [transaction(1, .manager)])
        await server.knows("jws-1", .manager)
        let model = make(store, server)
        await model.load()
        XCTAssertEqual(model.state.current, .manager)
        XCTAssertNil(model.state.message, "the quiet check on load says nothing")
        await model.choose(.manager)
        var count = await store.purchaseCount()
        XCTAssertEqual(count, 0)
        await store.set(outcome: .purchased(transaction(2, .leader)))
        await server.knows("jws-2", .leader)
        await model.choose(.leader)
        count = await store.purchaseCount()
        XCTAssertEqual(count, 1)
        XCTAssertEqual(model.state.current, .leader)
    }

    func testUpdatesFromStoreKitAreConfirmed() async {
        let store = FakeAppStore()
        let server = FakeServer()
        await server.knows("jws-5", .explorer, active: false)
        let model = make(store, server)
        await model.handle(transaction(5, .explorer))
        XCTAssertEqual(model.state.message, "The App Store says this plan isn't active (canceled).")
        // revoked and upgraded-away transactions are finished without asking the server
        await model.handle(StoreTransactionInfo(id: 6, productId: Tier.leader.productId, signedTransaction: "x", revoked: true))
        await model.handle(StoreTransactionInfo(id: 10, productId: "coins", signedTransaction: "y"))
        let finished = await store.finished
        XCTAssertEqual(finished, [5, 6])
        let submitted = await server.submitted
        XCTAssertEqual(submitted, ["jws-5"])
    }

    func testRestore() async {
        let store = FakeAppStore()
        let server = FakeServer()
        let model = make(store, server)
        await model.load()
        await model.restore()
        XCTAssertEqual(model.state.message, "No plan to restore on this Apple Account.")
        await store.set(entitlements: [transaction(3, .leader)])
        await server.knows("jws-3", .leader)
        await model.restore()
        XCTAssertEqual(model.state.current, .leader)
        XCTAssertEqual(model.state.message, "You're on Leader.")
        await store.set(loadFails: false, syncFails: true)
        await model.restore()
        XCTAssertEqual(model.state.message, "Couldn't reach the App Store. Try again.")
        XCTAssertFalse(model.state.busy)
    }
}
