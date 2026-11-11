import Foundation
import IngreCore
import StoreKit

/// #314: StoreKit 2 behind IngreCore's `StoreGateway`. Only transactions StoreKit verified on
/// the device are passed on; the server verifies each one again with Apple.
struct StoreKitGateway: StoreGateway {
    func products(_ ids: [String]) async throws -> [StoreProductInfo] {
        try await Product.products(for: ids).map {
            StoreProductInfo(productId: $0.id, displayPrice: $0.displayPrice)
        }
    }

    func purchase(_ productId: String, appAccountToken: UUID?) async -> PurchaseOutcome {
        do {
            guard let product = try await Product.products(for: [productId]).first else {
                return .failed("This plan isn't available right now.")
            }
            var options: Set<Product.PurchaseOption> = []
            if let appAccountToken { options.insert(.appAccountToken(appAccountToken)) }
            switch try await product.purchase(options: options) {
            case .success(let result):
                guard let info = Self.info(result) else {
                    return .failed("The App Store couldn't check this purchase.")
                }
                return .purchased(info)
            case .pending:
                return .pending
            case .userCancelled:
                return .cancelled
            @unknown default:
                return .failed("The purchase didn't go through. Try again.")
            }
        } catch {
            return .failed("The purchase didn't go through. Try again.")
        }
    }

    func currentEntitlements() async -> [StoreTransactionInfo] {
        var found: [StoreTransactionInfo] = []
        for await result in Transaction.currentEntitlements {
            if let info = Self.info(result) { found.append(info) }
        }
        return found
    }

    func sync() async throws {
        try await AppStore.sync()
    }

    func finish(_ transactionId: UInt64) async {
        for await result in Transaction.unfinished {
            if case .verified(let transaction) = result, transaction.id == transactionId {
                await transaction.finish()
            }
        }
    }

    /// A verified transaction as IngreCore sees it; nil for anything StoreKit couldn't verify.
    static func info(_ result: VerificationResult<Transaction>) -> StoreTransactionInfo? {
        guard case .verified(let transaction) = result else { return nil }
        return StoreTransactionInfo(
            id: transaction.id,
            productId: transaction.productID,
            signedTransaction: result.jwsRepresentation,
            revoked: transaction.revocationDate != nil,
            upgraded: transaction.isUpgraded
        )
    }

    /// Transaction.updates: renewals, refunds, Ask to Buy approvals and purchases made on
    /// another device. Started once at launch, only with the `tiers` flag.
    static func listen(_ model: PlansModel) -> Task<Void, Never> {
        Task.detached {
            for await result in Transaction.updates {
                if let info = info(result) { await model.handle(info) }
            }
        }
    }
}
