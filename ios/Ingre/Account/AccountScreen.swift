import SwiftUI

/// Account (#195): a pushed page, not a sheet. Signed out it is the Log in form (as the web's
/// /login); signed in it offers Saved, Upgrade and Log out.
struct AccountScreen: View {
    @Bindable var model: AppModel

    var account: AccountViewModel { model.account }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if account.loggedIn {
                    Text(L10n.t("account.signedIn", ["name": account.firstName]))
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(Theme.text)
                        .accessibilityIdentifier("account.signedIn")
                    Button(L10n.t("account.saved")) { model.showSaved() }
                        .buttonStyle(InkButtonStyle())
                        .accessibilityIdentifier("account.saved")
                    Button(L10n.t("account.upgrade")) { model.path.append(.upgrade) }
                        .buttonStyle(InkButtonStyle())
                        .accessibilityIdentifier("account.upgrade")
                    Button(L10n.t("account.logOut")) { account.logout() }
                        .buttonStyle(InkButtonStyle())
                        .accessibilityIdentifier("account.logOut")
                } else {
                    Text(L10n.t("account.signedOut")).foregroundStyle(Theme.secondary)
                    LoginForm(account: account)
                    Button(L10n.t("account.upgrade")) { model.path.append(.upgrade) }
                        .buttonStyle(InkButtonStyle())
                        .accessibilityIdentifier("account.upgrade")
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Theme.background.ignoresSafeArea())
        .navigationTitle(account.loggedIn ? L10n.t("account.label") : L10n.t("auth.logIn"))
    }
}

/// The web's Log in form: email, password with Show/Hide, its two messages, Loading, and
/// "Couldn't log you in." on failure.
struct LoginForm: View {
    @Bindable var account: AccountViewModel
    @FocusState private var field: Field?

    enum Field { case email, password }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            if account.loginFailed {
                StatusText(text: L10n.t("auth.loginFailed"), identifier: "auth.failed")
                Button(L10n.t("auth.logIn")) { account.retryLogin() }
                    .buttonStyle(InkButtonStyle())
                    .accessibilityIdentifier("auth.retry")
            } else {
                labelled(L10n.t("auth.email")) {
                    TextField("", text: $account.email)
                        .textContentType(.username)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .focused($field, equals: .email)
                        .accessibilityLabel(L10n.t("auth.email"))
                        .accessibilityIdentifier("auth.email")
                }
                labelled(L10n.t("auth.password")) {
                    HStack {
                        Group {
                            if account.showPassword {
                                TextField("", text: $account.password)
                            } else {
                                SecureField("", text: $account.password)
                            }
                        }
                        .textContentType(.password)
                        .textInputAutocapitalization(.never)
                        .focused($field, equals: .password)
                        .accessibilityLabel(L10n.t("auth.password"))
                        .accessibilityIdentifier("auth.password")
                        Button(L10n.t(account.showPassword ? "auth.hide" : "auth.show")) {
                            account.showPassword.toggle()
                        }
                        .foregroundStyle(Theme.text)
                        .touchTarget()
                        .accessibilityLabel(L10n.t(account.showPassword ? "auth.hidePassword" : "auth.showPassword"))
                    }
                }
                if let validation = account.validation {
                    StatusText(text: validation, identifier: "auth.validation")
                }
                if account.loggingIn {
                    StatusText(text: L10n.t("auth.wakingServer"), identifier: "auth.loading")
                }
                Button {
                    field = nil
                    Task { await account.submitLogin() }
                } label: {
                    Text(account.loggingIn ? L10n.t("auth.loading") : L10n.t("auth.logIn"))
                }
                .buttonStyle(InkButtonStyle())
                .disabled(account.loggingIn)
                .accessibilityIdentifier("auth.submit")
            }
        }
        .padding(16)
        .surface(.raised)
    }

    private func labelled<Field: View>(_ label: String, @ViewBuilder field: () -> Field) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.text).accessibilityHidden(true)
            field()
                .padding(.horizontal, 12)
                .frame(minHeight: Theme.minTarget)
                .surface(.recessed, radius: Theme.controlRadius)
        }
    }
}
