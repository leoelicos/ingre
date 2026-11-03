import Foundation
import Observation

/// Sign-in and hearts (#195): the JWT from the login mutation in the token store (the Keychain
/// in the app), and the saved recipes read back with getSavedRecipes.
@MainActor
@Observable
final class AccountViewModel {
    private let api: any IngreAPI
    private let tokens: any TokenStore
    private let now: @Sendable () -> Date

    private(set) var claims: JWTClaims?
    private(set) var saved: [SavedRecipeSummary] = []
    /// "Couldn't update your saved recipes. Try again." after a failed heart.
    private(set) var saveError = ""

    // Log in form
    var email = ""
    var password = ""
    var showPassword = false
    private(set) var loggingIn = false
    private(set) var loginFailed = false
    private(set) var validation: String?

    init(api: any IngreAPI, tokens: any TokenStore, now: @escaping @Sendable () -> Date = { Date() }) {
        self.api = api
        self.tokens = tokens
        self.now = now
        restore()
    }

    var loggedIn: Bool { claims != nil }
    var firstName: String { claims?.data.firstName ?? "" }
    var savedIds: Set<String> { Set(saved.compactMap(\.libraryId)) }

    /// The stored token, unless it has expired (then it is dropped, as on the web).
    private func restore() {
        guard let token = tokens.read() else { return }
        guard let claims = JWTClaims.decode(token), !claims.isExpired(now: now()) else {
            tokens.write(nil)
            return
        }
        self.claims = claims
    }

    func submitLogin() async {
        validation = nil
        if email.trimmingCharacters(in: .whitespaces).isEmpty {
            validation = L10n.t("auth.enterEmail")
            return
        }
        if password.isEmpty {
            validation = L10n.t("auth.enterPassword")
            return
        }
        loggingIn = true
        loginFailed = false
        defer { loggingIn = false }
        do {
            let result = try await api.login(email: email, password: password)
            guard let claims = JWTClaims.decode(result.token) else { throw APIError.noData }
            tokens.write(result.token)
            self.claims = claims
            password = ""
            await loadSaved()
        } catch {
            loginFailed = true
        }
    }

    /// Back to the form after "Couldn't log you in."
    func retryLogin() {
        loginFailed = false
    }

    func logout() {
        tokens.write(nil)
        claims = nil
        saved = []
        saveError = ""
    }

    func loadSaved() async {
        guard loggedIn else { return }
        if let recipes = try? await api.savedRecipes() { saved = recipes }
    }

    func isSaved(_ libraryId: String) -> Bool {
        savedIds.contains(libraryId)
    }

    /// The heart: saves the recipe (original plus changes), or removes every saved copy of it.
    func toggleSaved(libraryId: String, input: RecipeInputValue) async {
        saveError = ""
        do {
            if isSaved(libraryId) {
                for recipe in saved where recipe.libraryId == libraryId {
                    _ = try await api.removeRecipe(id: recipe.id)
                    saved.removeAll { $0.id == recipe.id }
                }
            } else {
                saved.append(try await api.saveRecipe(input))
            }
        } catch {
            saveError = L10n.t("saved.failed")
        }
    }
}
