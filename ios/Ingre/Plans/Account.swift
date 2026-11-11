import Foundation
import IngreCore
import Observation

private let api = URL(string: "https://ingre-backend.onrender.com/graphql")

/// #314: the signed-in user, for Plans only. The token is kept in memory for this session.
@MainActor
@Observable
final class AccountSession {
    var token: String?
    var error: String?
    var busy = false

    func login(email: String, password: String) async {
        guard let api else { return }
        busy = true
        error = nil
        var request = URLRequest(url: api)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = Data(loginBody(email: email, password: password).utf8)
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            token = loginToken(from: data)
            if token == nil { error = "Wrong email or password." }
        } catch {
            self.error = "Couldn't reach ingre. Try again."
        }
        busy = false
    }
}

/// Sends each signed transaction to `submitStorePurchase`, as the signed-in user.
struct ServerSubmitter: PurchaseSubmitter {
    let account: AccountSession

    func submit(productId: String, signedTransaction: String) async throws -> VerifiedPurchase {
        guard let token = await account.token, let api else { throw SubmitError.notSignedIn }
        var request = URLRequest(url: api)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = submitPurchaseBody(productId: productId, signedTransaction: signedTransaction)
        let (data, _) = try await URLSession.shared.data(for: request)
        return try parseSubmitResponse(data)
    }
}
