import SwiftUI

/// Explore (#181, #195): always on the page as an inline raised card that pushes the list down
/// (never an overlay or a sheet). Its header row expands and collapses it; ✕ collapses it too.
/// Collapsed, only the header row shows.
struct ExploreSection: View {
    @Bindable var explore: ExploreViewModel
    @Bindable var account: AccountViewModel
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var list: ShoppingListViewModel { explore.list }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                HeaderRow(title: L10n.t("explore.title"), open: explore.expanded, identifier: "explore.toggle") {
                    MotionAware(reduceMotion: reduceMotion).run { explore.toggle() }
                }
                if explore.expanded {
                    Button {
                        MotionAware(reduceMotion: reduceMotion).run { explore.collapse() }
                    } label: {
                        Image(systemName: "xmark").font(.body.weight(.bold)).foregroundStyle(Theme.text)
                            .touchTarget()
                            .chipSurface(.chip, outline: Theme.border)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(L10n.t("explore.hide"))
                    .accessibilityIdentifier("explore.hide")
                }
            }
            if explore.expanded {
                content(savedIds: account.savedIds)
                    .accessibilityElement(children: .contain)
                    .accessibilityIdentifier("explore.content")
            }
        }
        .padding(12)
        .surface(.raised)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("explore.section")
    }

    @ViewBuilder private func content(savedIds: Set<String>) -> some View {
        if account.loggedIn {
            Button {
                explore.savedOnly.toggle()
            } label: {
                Label(L10n.t("saved.filter"), systemImage: explore.savedOnly ? "heart.fill" : "heart")
            }
            .buttonStyle(InkButtonStyle(depth: explore.savedOnly ? .recessed : .raised))
            .accessibilityLabel(L10n.t(explore.savedOnly ? "saved.filterOn" : "saved.filterOff"))
            .accessibilityIdentifier("explore.saved")
        }
        if explore.savedOnly && savedIds.isEmpty {
            Text(L10n.t("saved.empty")).foregroundStyle(Theme.secondary)
        } else {
            switch explore.results(savedIds: savedIds) {
            case let .browse(recipes):
                recipeGroup(L10n.t("explore.browse"), recipes)
            case let .matches(ingredients, recipes):
                groups(ingredients, recipes)
            case let .none(ingredients, recipes, browse):
                StatusText(
                    text: L10n.t("explore.noMatches", ["query": explore.query.trimmingCharacters(in: .whitespaces)]),
                    identifier: "explore.noMatches")
                if !ingredients.isEmpty || !recipes.isEmpty {
                    GroupHeading(text: L10n.t("explore.closeMatches"))
                    groups(ingredients, recipes)
                }
                recipeGroup(L10n.t("explore.browse"), browse)
            }
        }
    }

    @ViewBuilder private func groups(_ ingredients: [LibraryIngredient], _ recipes: [LibraryRecipe]) -> some View {
        if !ingredients.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                GroupHeading(text: L10n.t("ingredients.title"))
                ForEach(ingredients) { item in IngredientResult(item: item, list: list) }
            }
        }
        if !recipes.isEmpty { recipeGroup(L10n.t("recipes.title"), recipes) }
    }

    private func recipeGroup(_ title: String, _ recipes: [LibraryRecipe]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            GroupHeading(text: title)
            ForEach(recipes) { recipe in
                RecipeRowView(
                    recipe: recipe, scope: "explore", lines: Copies.used(explore.originalLines(recipe)),
                    picked: list.isPicked(recipe.id), open: explore.rows.isOpen(recipe.id), seeRecipe: true,
                    recessed: false, tone: { list.library.tone(Chips.startSection($0)) },
                    onPick: { MotionAware(reduceMotion: reduceMotion).run { list.togglePicked(recipe.id) } },
                    onOpen: { MotionAware(reduceMotion: reduceMotion).run { explore.rows.toggle(recipe.id) } },
                    details: { OriginalDetails(recipe: recipe, explore: explore, account: account) }
                )
            }
        }
        .padding(4)
    }
}

/// An ingredient result: adds it to Extra, or opens its chip when it is on the list.
private struct IngredientResult: View {
    let item: LibraryIngredient
    @Bindable var list: ShoppingListViewModel

    var body: some View {
        let onList = list.hasChip(item.id)
        let name = capitaliseFirst(item.name)
        VStack(alignment: .leading, spacing: 4) {
            Button {
                list.pick(item)
            } label: {
                VStack(alignment: .leading, spacing: 2) {
                    Text(L10n.t(onList ? "explore.onListName" : "explore.addName", ["name": name]))
                        .font(.body.weight(.semibold))
                    Text(
                        onList ? L10n.t("explore.categoryOnList", ["category": item.section.label]) : item.section.label
                    )
                    .font(.caption)
                    .foregroundStyle(Theme.secondary)
                }
                .foregroundStyle(Theme.text)
                .padding(.horizontal, 12)
                .padding(.vertical, 4)
                .frame(maxWidth: .infinity, minHeight: Theme.minTarget, alignment: .leading)
                .surface(.raised, radius: Theme.controlRadius)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(
                L10n.t(onList ? "explore.onListLabel" : "explore.add", ["name": onList ? name : item.name])
            )
            .accessibilityIdentifier("explore.ingredient.\(item.id)")
            AllergenTags(allergens: item.allergens)
        }
    }
}

/// An open Explore row: the library original at 2 portions, read-only, with the heart.
private struct OriginalDetails: View {
    let recipe: LibraryRecipe
    @Bindable var explore: ExploreViewModel
    @Bindable var account: AccountViewModel

    var body: some View {
        let lines = Copies.used(explore.originalLines(recipe))
        if account.loggedIn {
            SaveButton(recipe: recipe, saved: account.isSaved(recipe.id)) {
                Task { await account.toggleSaved(libraryId: recipe.id, input: explore.saveInput(recipe)) }
            }
            StatusText(text: account.saveError, identifier: "save.status")
        }
        VStack(alignment: .leading, spacing: 8) {
            GroupHeading(text: L10n.t("ingredients.title"))
            FlowLayout(spacing: 8) {
                ForEach(lines, id: \.ingredientId) { line in
                    let ink = Theme.ink(explore.list.library.tone(Chips.startSection(line.item)))
                    let amount = Units.amountText(line.quantity, line.measure, line.item)
                    VStack(alignment: .leading, spacing: 0) {
                        Text(line.displayName).font(.subheadline.weight(.semibold))
                        Text(amount).font(.caption)
                    }
                    .foregroundStyle(ink)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .chipSurface(.chip, outline: ink)
                    .accessibilityElement(children: .combine)
                }
            }
            .padding(4)
        }
        MethodAndNotes(recipe: recipe, notes: Copies.notes(lines))
    }
}
