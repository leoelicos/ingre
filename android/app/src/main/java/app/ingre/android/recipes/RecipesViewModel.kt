package app.ingre.android.recipes

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.ingre.android.core.Chip
import app.ingre.android.core.Chips
import app.ingre.android.core.Copies
import app.ingre.android.core.CopyEntry
import app.ingre.android.core.CopyLine
import app.ingre.android.core.L10n
import app.ingre.android.core.LibraryIngredient
import app.ingre.android.core.Units
import app.ingre.android.ingredients.ShoppingList
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update

/** Which recipe rows are open, in Recipes and in Explore (#195). Each list has its own. */
class RowsState {
    private val _openIds = MutableStateFlow<Set<String>>(emptySet())
    val openIds: StateFlow<Set<String>> = _openIds.asStateFlow()

    fun isOpen(id: String): Boolean = id in openIds.value

    fun toggle(id: String) = _openIds.update { if (id in it) it - id else it + id }
}

/** Recipes (#182): the picked copies, with open rows showing the editable copy. */
@HiltViewModel
class RecipesViewModel
@Inject
constructor(val list: ShoppingList) : ViewModel() {
    val rows = RowsState()
    val sectionOpen = MutableStateFlow(true)

    /** The plus area is open in this recipe row. */
    private val _addingTo = MutableStateFlow<String?>(null)
    val addingTo: StateFlow<String?> = _addingTo.asStateFlow()

    val entries: StateFlow<List<CopyEntry>> =
        list.state.map { list.entries(it) }.stateIn(viewModelScope, SharingStarted.Eagerly, list.entries())

    fun summary(entries: List<CopyEntry>): String =
        L10n.t("recipes.picked", mapOf("recipes" to Units.formatRecipeCount(entries.size)))

    /** A closed row's names: the ingredients the copy uses, every one of them. */
    fun closedNames(entry: CopyEntry): List<CopyLine> = Copies.used(entry.lines)

    fun chips(entry: CopyEntry): List<Chip> = Chips.rowChips(entry, list.chipState)

    fun bullets(entry: CopyEntry): List<String> = Copies.bullets(entry.lines, entry.copy)

    fun notes(entry: CopyEntry): List<String> = Copies.notes(entry.lines)

    fun toggleAdding(recipeId: String) = _addingTo.update { if (it == recipeId) null else recipeId }

    /** Adds an ingredient to this copy at 1 of its unit, unless the row has its chip already. */
    fun add(item: LibraryIngredient, entry: CopyEntry) {
        _addingTo.value = null
        if (entry.lines.none { it.ingredientId == item.id }) {
            list.setAmount(entry.recipe.id, item.id, 1.0)
        }
        list.openPanel("row-${entry.recipe.id}", item.id)
    }
}
