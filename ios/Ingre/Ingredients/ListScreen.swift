import SwiftUI

/// The phone list page (#195): the header, then Explore, Recipes, Ingredients and Extra in one
/// scrolling column, as the web shows them on a phone.
struct ListScreen: View {
    @Bindable var model: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                HeaderBar(model: model)
                ExploreSection(explore: model.explore, account: model.account)
                RecipesSection(recipes: model.recipes, account: model.account)
                IngredientsSection(list: model.list)
                ExtraSection(list: model.list)
            }
            .padding(16)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Theme.background.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
    }
}

/// The logo, search and the account button.
struct HeaderBar: View {
    @Bindable var model: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(L10n.t("app.name"))
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(Theme.primary)
                    .accessibilityAddTraits(.isHeader)
                Spacer()
                Button {
                    model.path.append(.account)
                } label: {
                    Image(systemName: model.account.loggedIn ? "person.crop.circle.fill" : "person.crop.circle")
                        .font(.title2)
                        .foregroundStyle(Theme.text)
                        .touchTarget()
                }
                .buttonStyle(.plain)
                .accessibilityLabel(L10n.t("account.label"))
                .accessibilityValue(
                    model.account.loggedIn
                        ? L10n.t("account.signedIn", ["name": model.account.firstName]) : ""
                )
                .accessibilityIdentifier("account.open")
            }
            SearchField(explore: model.explore)
        }
    }
}

/// Search filters Explore, and opens it.
struct SearchField: View {
    @Bindable var explore: ExploreViewModel

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass").foregroundStyle(Theme.secondary).accessibilityHidden(true)
            TextField(L10n.t("search.placeholder"), text: $explore.query)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .submitLabel(.search)
                .foregroundStyle(Theme.text)
                .accessibilityLabel(L10n.t("search.label"))
                .accessibilityIdentifier("search.field")
                .onChange(of: explore.query) { _, query in
                    if !query.isEmpty { explore.show() }
                }
            if !explore.query.isEmpty {
                Button {
                    explore.query = ""
                } label: {
                    Image(systemName: "xmark.circle").foregroundStyle(Theme.text).touchTarget()
                }
                .buttonStyle(.plain)
                .accessibilityLabel(L10n.t("search.clear"))
            }
        }
        .padding(.horizontal, 12)
        .frame(minHeight: Theme.minTarget)
        .surface(.recessed, radius: Theme.controlRadius)
    }
}
