package app.ingre.android.explore

import androidx.lifecycle.ViewModel
import app.ingre.android.core.Copies
import app.ingre.android.core.CopyLine
import app.ingre.android.core.LibraryRecipe
import app.ingre.android.core.RecipeCopy
import app.ingre.android.core.RecipeInputValue
import app.ingre.android.core.Search
import app.ingre.android.ingredients.ShoppingList
import app.ingre.android.recipes.RowsState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Explore (#181, #195): always on the page, collapsible to its header row. On launch it is open
 * when nothing is on the list, collapsed otherwise. Rows show the library original.
 */
@HiltViewModel
class ExploreViewModel
@Inject
constructor(val list: ShoppingList) : ViewModel() {
    val rows = RowsState()

    private val _expanded = MutableStateFlow(list.entries().isEmpty())
    val expanded: StateFlow<Boolean> = _expanded.asStateFlow()

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private val _savedOnly = MutableStateFlow(false)
    val savedOnly: StateFlow<Boolean> = _savedOnly.asStateFlow()

    fun toggle() {
        _expanded.value = !_expanded.value
    }

    fun collapse() {
        _expanded.value = false
    }

    /** Typing a search opens Explore, as on the web. */
    fun setQuery(query: String) {
        _query.value = query
        if (query.isNotBlank()) _expanded.value = true
    }

    fun setSavedOnly(on: Boolean) {
        _savedOnly.value = on
    }

    /** The Saved account item: Explore open with only hearted recipes. */
    fun showSaved() {
        _savedOnly.value = true
        _expanded.value = true
    }

    fun results(savedIds: Set<String>): Search.Results = Search.results(
        query.value,
        list.library,
        savedOnly.value,
        savedIds
    )

    /** The original at 2 portions, as Explore's open row shows it. */
    fun originalLines(recipe: LibraryRecipe): List<CopyLine> = Copies.lines(recipe, RecipeCopy(recipe.id), list.library)

    /**
     * What the heart saves from Explore: the list's copy (customisations included) when the
     * recipe is on the list, else the original.
     */
    fun saveInput(recipe: LibraryRecipe): RecipeInputValue =
        Copies.saveInput(recipe, list.copyFor(recipe.id) ?: RecipeCopy(recipe.id), list.library)
}
