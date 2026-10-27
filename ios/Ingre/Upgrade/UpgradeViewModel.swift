import Foundation
import Observation

/// How a checkout in the browser ended: Stripe sent the user to `ingre://upgrade/success` or
/// `ingre://upgrade/cancel`, or they closed the browser.
enum CheckoutReturn: Equatable, Sendable {
    case success
    case cancel
    case dismissed
    case failed

    /// `ingre://upgrade/success` and `ingre://upgrade/cancel`; anything else is nil.
    init?(url: URL) {
        guard url.scheme == "ingre", url.host == "upgrade" else { return nil }
        switch url.path {
        case "/success": self = .success
        case "/cancel": self = .cancel
        default: return nil
        }
    }
}

/// Opens Stripe's checkout page and waits for it to return (ASWebAuthenticationSession / a
/// Custom Tab in the apps, a recorder in UI tests).
protocol CheckoutOpener: Sendable {
    @MainActor func open(_ url: URL) async -> CheckoutReturn
}

/// Upgrade (#195): a port of client/src/pages/Admin/useUpgrade.ts. One attempt at a time: a
/// second tap while one is starting does nothing, and "Starting the Stripe checkout…" shows.
@MainActor
@Observable
final class UpgradeViewModel {
    private let api: any IngreAPI
    private let opener: any CheckoutOpener
    private let checkoutBase: URL

    private(set) var pro = false
    private(set) var starting = false
    private(set) var failed = false
    private(set) var cancelled = false
    private(set) var succeeded = false
    /// How many checkout attempts actually started (a double tap starts one).
    private(set) var attempts = 0

    init(api: any IngreAPI, opener: any CheckoutOpener, checkoutBase: URL) {
        self.api = api
        self.opener = opener
        self.checkoutBase = checkoutBase
    }

    func loadUser() async {
        if let user = try? await api.currentUser() { pro = user.pro }
    }

    /// Each tap starts an attempt, unless one is already in flight (then it is a no-op).
    func startCheckout() async {
        guard !starting else { return }
        attempts += 1
        starting = true
        failed = false
        cancelled = false
        defer { starting = false }
        guard let session = try? await api.checkoutSession(), !session.isEmpty else {
            failed = true
            return
        }
        let url = CheckoutURL.make(sessionId: session, base: checkoutBase)
        await finish(opener.open(url))
    }

    /// Back from Stripe: success makes the user pro (as the web's Success page does).
    func finish(_ result: CheckoutReturn) async {
        switch result {
        case .success:
            if (try? await api.makeUserPro()) == true {
                pro = true
                succeeded = true
            } else {
                failed = true
            }
        case .cancel:
            cancelled = true
        case .dismissed:
            break
        case .failed:
            failed = true
        }
    }
}
