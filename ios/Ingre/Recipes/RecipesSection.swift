import SwiftUI

/// Recipes (#179, #182): the raised section with the picked copies recessed into it.
struct RecipesSection: View {
    @Bindable var recipes: RecipesViewModel
    @Bindable var account: AccountViewModel
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var list: ShoppingListViewModel { recipes.list }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HeaderRow(
                title: L10n.t("recipes.title"), summary: recipes.summary, open: recipes.sectionOpen,
                identifier: "recipes.header"
            ) {
                MotionAware(reduceMotion: reduceMotion).run { recipes.sectionOpen.toggle() }
            }
            if recipes.sectionOpen {
                if list.entries.isEmpty {
                    Text(L10n.t("recipes.empty")).foregroundStyle(Theme.secondary)
                } else {
                    ForEach(list.entries, id: \.recipe.id) { entry in
                        RecipeRowView(
                            recipe: entry.recipe, scope: "recipes", lines: recipes.closedNames(entry), picked: true,
                            open: recipes.rows.isOpen(entry.recipe.id), seeRecipe: false, recessed: true,
                            tone: { list.library.tone(Chips.startSection($0)) },
                            onPick: {
                                MotionAware(reduceMotion: reduceMotion).run { list.togglePicked(entry.recipe.id) }
                            },
                            onOpen: {
                                MotionAware(reduceMotion: reduceMotion).run { recipes.rows.toggle(entry.recipe.id) }
                            },
                            details: { RecipeDetails(entry: entry, recipes: recipes, account: account) }
                        )
                    }
                }
            }
        }
        .padding(16)
        .surface(.section)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("recipes.section")
    }
}

/// An open Recipes row: the heart, portions, the copy's editable chips with the plus, the
/// customisations, method and notes.
struct RecipeDetails: View {
    let entry: CopyEntry
    @Bindable var recipes: RecipesViewModel
    @Bindable var account: AccountViewModel

    var list: ShoppingListViewModel { recipes.list }

    var body: some View {
        let scope = ChipScope.row(entry.recipe.id)
        if account.loggedIn {
            SaveButton(recipe: entry.recipe, saved: account.isSaved(entry.recipe.id)) {
                Task {
                    await account.toggleSaved(
                        libraryId: entry.recipe.id,
                        input: Copies.saveInput(entry.recipe, entry.copy, list.library))
                }
            }
            StatusText(text: account.saveError, identifier: "save.status")
        }
        Stepper(
            value: Binding(
                get: { entry.copy.portions },
                set: { list.setPortions(recipeId: entry.recipe.id, portions: $0) }
            ), in: RecipeCopy.minPortions...RecipeCopy.maxPortions
        ) {
            Text("\(L10n.t("row.portions")): \(entry.copy.portions)").foregroundStyle(Theme.text)
        }
        .frame(minHeight: Theme.minTarget)
        .accessibilityLabel(L10n.t("row.portions"))
        .accessibilityValue(L10n.t("row.portionsValue", ["count": String(entry.copy.portions)]))
        .accessibilityIdentifier("recipes.portions.\(entry.recipe.id)")

        VStack(alignment: .leading, spacing: 8) {
            GroupHeading(text: L10n.t("ingredients.title"))
            let chips = recipes.chips(entry)
            ChipGroupsView(
                groups: [ChipGroup(section: .other, chips: chips)], scope: scope, list: list,
                showHeadings: false
            ) { chip in
                ChipPanel(chip: chip, scope: scope, list: list, onlyRecipe: entry.recipe.id)
            }
            if recipes.addingTo == entry.recipe.id {
                PlusArea(
                    title: L10n.t("plus.addTo", ["recipe": entry.label]), identifier: "recipes.plus.\(entry.recipe.id)",
                    list: list,
                    mark: { item in chips.contains { $0.id == item.id } ? L10n.t("plus.inRecipe") : nil },
                    onPick: { recipes.add($0, to: entry) },
                    onClose: { recipes.addingTo = nil }
                )
            } else {
                Button {
                    recipes.addingTo = entry.recipe.id
                } label: {
                    Image(systemName: "plus").touchTarget()
                }
                .buttonStyle(InkButtonStyle())
                .accessibilityLabel(L10n.t("plus.addTo", ["recipe": entry.label]))
                .accessibilityIdentifier("recipes.add.\(entry.recipe.id)")
            }
        }

        let bullets = recipes.bullets(entry)
        if !bullets.isEmpty {
            VStack(alignment: .leading, spacing: 4) {
                GroupHeading(text: L10n.t("row.customisations"))
                ForEach(bullets, id: \.self) { Text("• \($0)").foregroundStyle(Theme.text) }
            }
            .accessibilityElement(children: .combine)
        }
        MethodAndNotes(recipe: entry.recipe, notes: recipes.notes(entry))
    }
}
