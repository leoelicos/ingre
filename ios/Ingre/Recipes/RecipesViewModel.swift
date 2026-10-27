import Foundation
import Observation

/// Which recipe rows are open, in Recipes and in Explore (#195). Each list has its own.
@MainActor
@Observable
final class RowsViewModel {
    private(set) var openIds: Set<String> = []

    func isOpen(_ id: String) -> Bool {
        openIds.contains(id)
    }

    func toggle(_ id: String) {
        if openIds.contains(id) {
            openIds.remove(id)
        } else {
            openIds.insert(id)
        }
    }
}

/// Recipes (#182): the picked copies, with open rows showing the editable copy.
@MainActor
@Observable
final class RecipesViewModel {
    let list: ShoppingListViewModel
    let rows = RowsViewModel()
    var sectionOpen = true
    /// The plus area is open in this recipe row.
    var addingTo: String?

    init(list: ShoppingListViewModel) {
        self.list = list
    }

    var summary: String {
        L10n.t("recipes.picked", ["recipes": Units.formatRecipeCount(list.entries.count)])
    }

    /// A closed row's names: the ingredients the copy uses, every one of them.
    func closedNames(_ entry: CopyEntry) -> [CopyLine] {
        Copies.used(entry.lines)
    }

    func chips(_ entry: CopyEntry) -> [Chip] {
        Chips.rowChips(entry, list.chipState)
    }

    func bullets(_ entry: CopyEntry) -> [String] {
        Copies.bullets(entry.lines, entry.copy)
    }

    func notes(_ entry: CopyEntry) -> [String] {
        Copies.notes(entry.lines)
    }

    /// Adds an ingredient to this copy at 1 of its unit, unless the row has its chip already.
    func add(_ item: LibraryIngredient, to entry: CopyEntry) {
        addingTo = nil
        if !entry.lines.contains(where: { $0.ingredientId == item.id }) {
            list.setAmount(recipeId: entry.recipe.id, ingredientId: item.id, quantity: 1)
        }
        list.openPanels["row-\(entry.recipe.id)"] = item.id
    }
}
