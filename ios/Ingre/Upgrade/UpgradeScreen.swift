import SwiftUI

/// Upgrade (#195): the web's /upgrade. Signed out: "You need to be logged in…". Pro: "You are
/// pro". Otherwise why to upgrade and "Checkout with Stripe", one attempt at a time.
struct UpgradeScreen: View {
    @Bindable var model: AppModel

    var upgrade: UpgradeViewModel { model.upgrade }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if upgrade.succeeded {
                    Text(L10n.t("success.title")).font(.title2.weight(.bold)).foregroundStyle(Theme.text)
                    Text(L10n.t("success.thanks")).foregroundStyle(Theme.text).accessibilityIdentifier(
                        "upgrade.success")
                } else if !model.account.loggedIn {
                    Text(L10n.t("notLoggedIn.message")).foregroundStyle(Theme.text).accessibilityIdentifier(
                        "upgrade.notLoggedIn")
                } else if upgrade.pro {
                    Text(L10n.t("upgrade.pro")).font(.title2.weight(.bold)).foregroundStyle(Theme.text)
                        .accessibilityIdentifier("upgrade.pro")
                } else {
                    offer
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Theme.background.ignoresSafeArea())
        .navigationTitle(L10n.t("upgrade.title"))
        .task { if model.account.loggedIn { await upgrade.loadUser() } }
    }

    @ViewBuilder private var offer: some View {
        Text(L10n.t("upgrade.why")).font(.title3.weight(.semibold)).foregroundStyle(Theme.text)
            .accessibilityAddTraits(.isHeader)
        VStack(alignment: .leading, spacing: 6) {
            ForEach(["upgrade.instructions", "upgrade.price", "upgrade.secure"], id: \.self) { key in
                Text("• \(L10n.t(key))").foregroundStyle(Theme.text)
            }
        }
        Button {
            Task { await upgrade.startCheckout() }
        } label: {
            Text(L10n.t("upgrade.checkout"))
        }
        .buttonStyle(InkButtonStyle())
        .accessibilityIdentifier("upgrade.checkout")
        if upgrade.starting {
            StatusText(text: L10n.t("upgrade.starting"), identifier: "upgrade.starting")
        }
        if upgrade.failed {
            StatusText(text: L10n.t("upgrade.failed"), identifier: "upgrade.failed")
        }
        if upgrade.cancelled {
            StatusText(text: L10n.t("upgrade.cancelled"), identifier: "upgrade.cancelled")
        }
        if let mock = model.mockOpener, let url = mock.lastURL {
            // UI tests only: the checkout page the app would have opened, and how many times.
            Text(url.absoluteString).font(.caption2).foregroundStyle(Theme.secondary)
                .accessibilityIdentifier("upgrade.mockCheckoutURL")
            Text("\(mock.opens)").font(.caption2).foregroundStyle(Theme.secondary)
                .accessibilityIdentifier("upgrade.mockCheckoutCount")
        }
    }
}
