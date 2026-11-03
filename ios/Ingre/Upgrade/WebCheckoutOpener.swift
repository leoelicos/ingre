import AuthenticationServices
import Foundation
import UIKit

/// Opens Stripe's checkout in ASWebAuthenticationSession (#195) and waits for the
/// `ingre://upgrade/success` or `ingre://upgrade/cancel` callback.
@MainActor
final class WebCheckoutOpener: NSObject, CheckoutOpener, ASWebAuthenticationPresentationContextProviding {
    private var session: ASWebAuthenticationSession?

    func open(_ url: URL) async -> CheckoutReturn {
        await withCheckedContinuation { continuation in
            let done: @Sendable (URL?, (any Error)?) -> Void = { callback, error in
                if let callback, let result = CheckoutReturn(url: callback) {
                    continuation.resume(returning: result)
                } else if let error = error as? ASWebAuthenticationSessionError, error.code == .canceledLogin {
                    continuation.resume(returning: .dismissed)
                } else {
                    continuation.resume(returning: error == nil ? .dismissed : .failed)
                }
            }
            let session: ASWebAuthenticationSession
            if #available(iOS 17.4, *) {
                session = ASWebAuthenticationSession(
                    url: url, callback: .customScheme("ingre"), completionHandler: done)
            } else {
                session = ASWebAuthenticationSession(url: url, callbackURLScheme: "ingre", completionHandler: done)
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = true
            self.session = session
            if !session.start() { continuation.resume(returning: .failed) }
        }
    }

    nonisolated func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        MainActor.assumeIsolated {
            UIApplication.shared.connectedScenes.compactMap { ($0 as? UIWindowScene)?.keyWindow }.first
                ?? ASPresentationAnchor()
        }
    }
}

/// UI tests: records the checkout URL instead of opening Stripe, then answers as told
/// (INGRE_CHECKOUT=success, cancel or dismissed).
@MainActor
@Observable
final class MockCheckoutOpener: CheckoutOpener {
    private(set) var lastURL: URL?
    private(set) var opens = 0
    let answer: CheckoutReturn

    nonisolated init(answer: CheckoutReturn) {
        self.answer = answer
    }

    func open(_ url: URL) async -> CheckoutReturn {
        lastURL = url
        opens += 1
        return answer
    }
}
