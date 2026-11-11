import IngreCore
import StoreKit
import SwiftUI

/// #314: Plans, the last section of the phone page, only with the `tiers` flag. Monthly
/// App Store subscriptions in one group; each plan includes the one below.
struct PlansSection: View {
    let model: PlansModel
    @Bindable var account: AccountSession
    @State private var email = ""
    @State private var password = ""
    @State private var managing = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Plans").font(.title2).accessibilityAddTraits(.isHeader)
            Text("Monthly, through the App Store. Each plan includes the one below. Cancel any time in Settings.")
            if account.token == nil {
                Text("Log in to choose a plan.")
                TextField("Email", text: $email)
                    .textContentType(.username)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .frame(minHeight: 44)
                SecureField("Password", text: $password)
                    .textContentType(.password)
                    .frame(minHeight: 44)
                Button("Log in") { Task { await account.login(email: email, password: password) } }
                    .disabled(account.busy || email.isEmpty || password.isEmpty)
                    .frame(minHeight: 44)
                if let error = account.error { Text(error) }
            }
            if let message = model.state.message { Text(message) }
            ForEach(Tier.allCases, id: \.self) { tier in
                VStack(alignment: .leading, spacing: 4) {
                    Text(tier.label).font(.headline).accessibilityAddTraits(.isHeader)
                    Text(model.state.prices[tier].map { "\($0) a month" } ?? tier.fallbackPrice)
                    Text(tier.adds).font(.footnote)
                    switch planAction(current: model.state.current, tier: tier) {
                    case .current:
                        // text, not colour, says which plan is yours
                        Text("Your plan")
                    case let action:
                        Button(planButtonLabel(current: model.state.current, tier: tier)) {
                            Task { await model.choose(tier) }
                        }
                        .disabled(account.token == nil || !model.state.available || model.state.busy)
                        .frame(minHeight: 44)
                        if action == .downgrade {
                            Text("Starts when your current month ends.").font(.footnote)
                        }
                    }
                }
            }
            Button("Restore purchases") { Task { await model.restore() } }
                .disabled(account.token == nil || model.state.busy)
                .frame(minHeight: 44)
            Button("Manage subscription") { managing = true }
                .frame(minHeight: 44)
        }
        .manageSubscriptionsSheet(isPresented: $managing)
        .task { await model.load() }
    }
}
