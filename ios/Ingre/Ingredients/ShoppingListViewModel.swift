import Foundation
import Observation

/// All list state (#179, #182, #195): copies, chips, extras and crossed-off chips, kept on the
/// device under the web app's storage keys. A port of client/src/utils/chips/useChips.ts.
@MainActor
@Observable
final class ShoppingListViewModel {
    let library: Library
    private let storage: ListStorage
    private(set) var state: ListState {
        didSet { storage.save(state) }
    }

    /// The status line read after an add ("Brown onion added to Extra").
    var message = ""
    /// The chip whose panel is open, per scope ("chip", "extra", "row-<recipe>").
    var openPanels: [String: String] = [:]
    /// The Refresh question is showing.
    var askingRefresh = false

    init(library: Library, storage: ListStorage) {
        self.library = library
        self.storage = storage
        state = storage.load()
    }

    var chipState: ChipState { ChipState(edits: state.edits, crossedIds: state.crossed) }
    var entries: [CopyEntry] { Chips.entries(state.copies, library) }
    var chips: [Chip] { Chips.build(entries, state.extras, chipState, library) }
    var groups: [ChipGroup] { Chips.groups(chips) }
    var extraChips: [Chip] { chips.filter { $0.extra != nil } }
    var extraGroups: [ChipGroup] { Chips.groups(extraChips) }
    var pickedIds: Set<String> { Set(state.copies.map(\.recipeId)) }
    var summary: String { Chips.ingredientsSummary(chips) }

    func hasChip(_ id: String) -> Bool {
        chips.contains { $0.id == id }
    }

    func isPicked(_ recipeId: String) -> Bool {
        pickedIds.contains(recipeId)
    }

    func togglePicked(_ recipeId: String) {
        if isPicked(recipeId) {
            state.copies.removeAll { $0.recipeId == recipeId }
        } else {
            state.copies.append(RecipeCopy(recipeId: recipeId))
        }
    }

    func copy(for recipeId: String) -> RecipeCopy? {
        state.copies.first { $0.recipeId == recipeId }
    }

    private func updateCopy(_ recipeId: String, _ change: (RecipeCopy) -> RecipeCopy) {
        state.copies = state.copies.map { $0.recipeId == recipeId ? change($0) : $0 }
    }

    func setAmount(recipeId: String, ingredientId: String, quantity: Double) {
        guard let recipe = library.recipe(recipeId) else { return }
        updateCopy(recipeId) { Copies.withAmount($0, recipe, ingredientId, quantity) }
    }

    func setPortions(recipeId: String, portions: Int) {
        updateCopy(recipeId) { Copies.withPortions($0, Double(portions)) }
    }

    /// Refresh (#182): every recipe back to its original at 2 portions.
    func refresh() {
        state.copies = state.copies.map(Copies.reset)
        askingRefresh = false
    }

    func toggleCrossed(_ id: String) {
        if state.crossed.contains(id) {
            state.crossed.remove(id)
        } else {
            state.crossed.insert(id)
        }
    }

    func setCategory(_ id: String, _ section: ShopSection) {
        state.edits[id] = ChipEdit(section: section)
    }

    /// Adds a catalogue item to Extra; on the list already, its chip opens instead.
    /// Returns true when it was on the list already.
    @discardableResult
    func pick(_ item: LibraryIngredient) -> Bool {
        let onList = hasChip(item.id)
        addExtra(item)
        if onList {
            openPanels["chip"] = item.id
            return true
        }
        message = L10n.t("ingredients.added", ["name": capitaliseFirst(item.name)])
        return false
    }

    func addExtra(_ item: LibraryIngredient) {
        guard !extraChips.contains(where: { $0.id == item.id }) else { return }
        state.crossed.remove(item.id)
        if !state.extras.contains(where: { $0.chipId == item.id }) {
            state.extras.append(.catalogue(item))
        }
    }

    func setExtra(_ id: String, quantity: Int) {
        state.extras = state.extras.map { extra in
            var next = extra
            if extra.chipId == id { next.quantity = quantity }
            return next
        }
    }

    func removeExtra(_ id: String) {
        let needed = chips.first { $0.id == id }?.recipeSources.contains { !$0.removed } ?? false
        if !needed { state.crossed.remove(id) }
        state.extras.removeAll { $0.chipId == id }
    }

    /// A chip panel's box changed: Extra takes whole numbers, a recipe its own unit.
    func setSource(_ source: ChipSource, chipId: String, value: Double) {
        switch source {
        case let .recipe(recipeId, _, _, _, _, _):
            setAmount(recipeId: recipeId, ingredientId: chipId, quantity: value)
        case .extra:
            setExtra(chipId, quantity: max(1, Int(value.rounded())))
        }
    }

    func removeSource(_ source: ChipSource, chipId: String) {
        switch source {
        case let .recipe(recipeId, _, _, _, _, _):
            setAmount(recipeId: recipeId, ingredientId: chipId, quantity: 0)
        case .extra:
            removeExtra(chipId)
        }
    }

    func togglePanel(scope: String, chipId: String) {
        openPanels[scope] = openPanels[scope] == chipId ? nil : chipId
    }

    /// The catalogue by section, for the plus area's tabs.
    var plusTabs: [(section: ShopSection, items: [LibraryIngredient])] {
        ShopSection.allCases.compactMap { section in
            let items = library.ingredients.filter { $0.section == section }
            return items.isEmpty ? nil : (section, items)
        }
    }
}
