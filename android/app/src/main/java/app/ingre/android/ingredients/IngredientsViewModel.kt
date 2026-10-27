package app.ingre.android.ingredients

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.ingre.android.core.Chip
import app.ingre.android.core.ChipGroup
import app.ingre.android.core.Chips
import app.ingre.android.core.ListState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

/** What the Ingredients and Extra sections draw. */
data class IngredientsUi(
    val chips: List<Chip> = emptyList(),
    val groups: List<ChipGroup> = emptyList(),
    val extraGroups: List<ChipGroup> = emptyList(),
    val summary: String = ""
)

/** Ingredients and Extra (#182): every chip by category, the Refresh question and the plus area. */
@HiltViewModel
class IngredientsViewModel
@Inject
constructor(val list: ShoppingList) : ViewModel() {
    private fun ui(state: ListState): IngredientsUi {
        val chips = list.chips(state)
        return IngredientsUi(
            chips,
            Chips.groups(chips),
            Chips.groups(
                chips.filter {
                    it.extra != null
                }
            ),
            Chips.ingredientsSummary(chips)
        )
    }

    val ui: StateFlow<IngredientsUi> =
        list.state.map(::ui).stateIn(viewModelScope, SharingStarted.Eagerly, ui(list.state.value))

    private val _askingRefresh = MutableStateFlow(false)
    val askingRefresh: StateFlow<Boolean> = _askingRefresh.asStateFlow()

    private val _addingExtra = MutableStateFlow(false)
    val addingExtra: StateFlow<Boolean> = _addingExtra.asStateFlow()

    val ingredientsOpen = MutableStateFlow(true)
    val extraOpen = MutableStateFlow(true)

    fun askRefresh(asking: Boolean) {
        _askingRefresh.value = asking
    }

    fun refresh() {
        list.refresh()
        _askingRefresh.value = false
    }

    fun toggleAddingExtra() {
        _addingExtra.value = !_addingExtra.value
    }
}
