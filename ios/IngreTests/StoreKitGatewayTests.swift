import IngreCore
import StoreKit
import StoreKitTest
import XCTest
@testable import Ingre

/// #314: the real StoreKit 2 path against Ingre.storekit, in the simulator, with no App Store.
@MainActor
final class StoreKitGatewayTests: XCTestCase {
    private var session: SKTestSession?

    override func setUp() async throws {
        let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Ingre", withExtension: "storekit"))
        let session = try SKTestSession(contentsOf: url)
        session.resetToDefaultState()
        session.disableDialogs = true
        session.clearTransactions()
        self.session = session
        // StoreKit testing needs a working local StoreKit daemon. Hosted CI simulators often
        // refuse SKTestSession (SKInternalErrorDomain 3) and return no products; skip there
        // instead of failing. These run in Xcode on a Mac (Product > Test).
        if try await Product.products(for: Tier.productIds).isEmpty {
            throw XCTSkip("StoreKit testing is unavailable in this environment (no products from Ingre.storekit)")
        }
    }

    override func tearDown() async throws {
        session?.clearTransactions()
        session = nil
    }

    func testTheThreeTiersAreMonthlySubscriptionsInOneGroup() async throws {
        let products = try await Product.products(for: Tier.productIds)
        XCTAssertEqual(Set(products.map(\.id)), Set(Tier.productIds))
        XCTAssertEqual(Set(products.compactMap { $0.subscription?.subscriptionGroupID }).count, 1)
        for product in products {
            XCTAssertEqual(product.type, .autoRenewable)
            XCTAssertEqual(product.subscription?.subscriptionPeriod.unit, .month)
            XCTAssertEqual(product.subscription?.subscriptionPeriod.value, 1)
        }
        let prices = try await StoreKitGateway().products(Tier.productIds)
        XCTAssertEqual(prices.count, 3)
        XCTAssertTrue(prices.allSatisfy { !$0.displayPrice.isEmpty })
    }

    func testBuyingThenUpgradingInTheGroup() async throws {
        let gateway = StoreKitGateway()
        let token = appAccountToken(userId: "65a1b2c3d4e5f60718293a4b")
        guard case .purchased(let first) = await gateway.purchase(Tier.explorer.productId, appAccountToken: token) else {
            return XCTFail("Explorer should be bought")
        }
        XCTAssertEqual(first.productId, Tier.explorer.productId)
        XCTAssertEqual(first.signedTransaction.split(separator: ".").count, 3, "a JWS for the server")
        await gateway.finish(first.id)
        var entitled = await gateway.currentEntitlements()
        XCTAssertEqual(entitledTier(entitled), .explorer)

        guard case .purchased(let upgrade) = await gateway.purchase(Tier.leader.productId, appAccountToken: token) else {
            return XCTFail("Leader should be bought")
        }
        await gateway.finish(upgrade.id)
        entitled = await gateway.currentEntitlements()
        XCTAssertEqual(entitledTier(entitled), .leader)
    }

    func testThePlansModelWithStoreKitAndAServerThatAgrees() async throws {
        let model = PlansModel(store: StoreKitGateway(), submitter: AgreeingServer()) { "65a1b2c3d4e5f60718293a4b" }
        await model.load()
        XCTAssertTrue(model.state.available)
        XCTAssertEqual(model.state.prices.count, 3)
        await model.choose(.manager)
        XCTAssertEqual(model.state.current, .manager)
        XCTAssertEqual(model.state.message, "You're on Manager.")
    }
}

/// Server stand-in: confirms whatever StoreKit verified (the real server checks with Apple).
private struct AgreeingServer: PurchaseSubmitter {
    func submit(productId: String, signedTransaction: String) async throws -> VerifiedPurchase {
        VerifiedPurchase(tier: Tier(productId: productId), active: true, status: "active")
    }
}
