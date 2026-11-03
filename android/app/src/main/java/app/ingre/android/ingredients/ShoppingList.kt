package app.ingre.android.ingredients

import app.ingre.android.core.ChipEdit
import app.ingre.android.core.ChipSource
import app.ingre.android.core.ChipState
import app.ingre.android.core.Chips
import app.ingre.android.core.Copies
import app.ingre.android.core.CopyEntry
import app.ingre.android.core.Extra
import app.ingre.android.core.L10n
import app.ingre.android.core.Library
import app.ingre.android.core.LibraryIngredient
import app.ingre.android.core.ListState
import app.ingre.android.core.ListStorage
import app.ingre.android.core.RecipeCopy
import app.ingre.android.core.ShopSection
import app.ingre.android.core.capitaliseFirst
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.roundToInt
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * All list state (#179, #182, #195): copies, chips, extras and crossed-off chips, kept on the
 * device under the web app's storage keys. A port of client/src/utils/chips/useChips.ts, shared
 * by the Ingredients, Recipes and Explore view models.
 */
@Singleton
class ShoppingList
@Inject
constructor(val library: Library, private val storage: ListStorage) {
    private val _state = MutableStateFlow(storage.load())
    val state: StateFlow<ListState> = _state.asStateFlow()

    /** The status line read after an add ("Brown onion added to Extra"). */
    private val _message = MutableStateFlow("")
    val message: StateFlow<String> = _message.asStateFlow()

    /** The chip whose panel is open, per scope ("chip", "extra", "row-<recipe>"). */
    private val _openPanels = MutableStateFlow<Map<String, String>>(emptyMap())
    val openPanels: StateFlow<Map<String, String>> = _openPanels.asStateFlow()

    private fun change(transform: (ListState) -> ListState) {
        val next = _state.updateAndGet(transform)
        storage.save(next)
    }

    private inline fun <T> MutableStateFlow<T>.updateAndGet(transform: (T) -> T): T {
        update(transform)
        return value
    }

    val chipState: ChipState get() = state.value.let { ChipState(it.edits, it.crossed) }

    fun entries(state: ListState = this.state.value): List<CopyEntry> = Chips.entries(state.copies, library)

    fun chips(state: ListState = this.state.value) =
        Chips.build(entries(state), state.extras, ChipState(state.edits, state.crossed), library)

    fun extraChips(state: ListState = this.state.value) = chips(state).filter { it.extra != null }

    fun pickedIds(state: ListState = this.state.value): Set<String> = state.copies.map { it.recipeId }.toSet()

    fun hasChip(id: String): Boolean = chips().any { it.id == id }

    fun isPicked(recipeId: String): Boolean = recipeId in pickedIds()

    fun togglePicked(recipeId: String) = change { state ->
        if (state.copies.any { it.recipeId == recipeId }) {
            state.copy(copies = state.copies.filterNot { it.recipeId == recipeId })
        } else {
            state.copy(copies = state.copies + RecipeCopy(recipeId))
        }
    }

    fun copyFor(recipeId: String): RecipeCopy? = state.value.copies.firstOrNull { it.recipeId == recipeId }

    private fun updateCopy(recipeId: String, transform: (RecipeCopy) -> RecipeCopy) = change { state ->
        state.copy(copies = state.copies.map { if (it.recipeId == recipeId) transform(it) else it })
    }

    fun setAmount(recipeId: String, ingredientId: String, quantity: Double) {
        val recipe = library.recipe(recipeId) ?: return
        updateCopy(recipeId) { Copies.withAmount(it, recipe, ingredientId, quantity) }
    }

    fun setPortions(recipeId: String, portions: Int) = updateCopy(recipeId) {
        Copies.withPortions(it, portions.toDouble())
    }

    /** Refresh (#182): every recipe back to its original at 2 portions. */
    fun refresh() = change { state -> state.copy(copies = state.copies.map(Copies::reset)) }

    fun toggleCrossed(id: String) = change { state ->
        state.copy(crossed = if (id in state.crossed) state.crossed - id else state.crossed + id)
    }

    fun setCategory(id: String, section: ShopSection) = change { state ->
        state.copy(
            edits =
                state.edits + (id to ChipEdit(section))
        )
    }

    /**
     * Adds a catalogue item to Extra; on the list already, its chip opens instead. Returns
     * true when it was on the list already.
     */
    fun pick(item: LibraryIngredient): Boolean {
        val onList = hasChip(item.id)
        addExtra(item)
        if (onList) {
            _openPanels.update { it + ("chip" to item.id) }
            return true
        }
        _message.value = L10n.t("ingredients.added", mapOf("name" to capitaliseFirst(item.name)))
        return false
    }

    fun addExtra(item: LibraryIngredient) {
        if (extraChips().any { it.id == item.id }) return
        change { state ->
            state.copy(
                crossed = state.crossed - item.id,
                extras = if (state.extras.any { it.chipId == item.id }) {
                    state.extras
                } else {
                    state.extras +
                        Extra.catalogue(item)
                }
            )
        }
    }

    fun setExtra(id: String, quantity: Int) = change { state ->
        state.copy(extras = state.extras.map { if (it.chipId == id) it.copy(quantity = quantity) else it })
    }

    fun removeExtra(id: String) {
        val needed = chips().firstOrNull { it.id == id }?.recipeSources?.any { !it.removed } ?: false
        change { state ->
            state.copy(
                crossed = if (needed) state.crossed else state.crossed - id,
                extras = state.extras.filterNot { it.chipId == id }
            )
        }
    }

    /** A chip panel's box changed: Extra takes whole numbers, a recipe its own unit. */
    fun setSource(source: ChipSource, chipId: String, value: Double) = when (source) {
        is ChipSource.Recipe -> setAmount(source.recipeId, chipId, value)
        is ChipSource.ExtraAmount -> setExtra(chipId, maxOf(1, value.roundToInt()))
    }

    fun removeSource(source: ChipSource, chipId: String) = when (source) {
        is ChipSource.Recipe -> setAmount(source.recipeId, chipId, 0.0)
        is ChipSource.ExtraAmount -> removeExtra(chipId)
    }

    fun togglePanel(scope: String, chipId: String) = _openPanels.update { panels ->
        if (panels[scope] == chipId) panels - scope else panels + (scope to chipId)
    }

    fun openPanel(scope: String, chipId: String) = _openPanels.update { it + (scope to chipId) }

    /** The catalogue by section, for the plus area's tabs. */
    val plusTabs: List<Pair<ShopSection, List<LibraryIngredient>>> by lazy {
        ShopSection.entries.mapNotNull { section ->
            library.ingredients.filter { it.section == section }.takeIf { it.isNotEmpty() }?.let { section to it }
        }
    }
}
