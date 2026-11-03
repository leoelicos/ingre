import Foundation
import Observation

/// Explore (#181, #195): always on the page, collapsible to its header row. On launch it is
/// open when nothing is on the list, collapsed otherwise. Rows show the library original.
@MainActor
@Observable
final class ExploreViewModel {
    let list: ShoppingListViewModel
    let rows = RowsViewModel()
    var expanded: Bool
    var query = ""
    var savedOnly = false

    init(list: ShoppingListViewModel) {
        self.list = list
        expanded = list.entries.isEmpty
    }

    func toggle() {
        expanded.toggle()
    }

    func collapse() {
        expanded = false
    }

    func show() {
        expanded = true
    }

    /// The Saved account item: Explore open with only hearted recipes.
    func showSaved() {
        savedOnly = true
        expanded = true
    }

    func results(savedIds: Set<String>) -> Search.Results {
        Search.results(query, list.library, savedOnly: savedOnly, savedIds: savedIds)
    }

    /// The original at 2 portions, as Explore's open row shows it.
    func originalLines(_ recipe: LibraryRecipe) -> [CopyLine] {
        Copies.lines(recipe, RecipeCopy(recipeId: recipe.id), list.library)
    }

    /// What the heart saves from Explore: the list's copy (customisations included) when the
    /// recipe is on the list, else the original.
    func saveInput(_ recipe: LibraryRecipe) -> RecipeInputValue {
        Copies.saveInput(recipe, list.copy(for: recipe.id) ?? RecipeCopy(recipeId: recipe.id), list.library)
    }
}
