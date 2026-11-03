import Foundation

/// Something added by hand to Extra: a catalogue item (or free text), with a whole quantity.
struct Extra: Codable, Equatable, Sendable {
    var id: String
    var name: String
    /// catalogue id, or nil for free text
    var ingredientId: String?
    var quantity: Int

    var chipId: String { ingredientId ?? id }

    static func catalogue(_ item: LibraryIngredient, quantity: Int = 1) -> Extra {
        Extra(id: item.id, name: item.name, ingredientId: item.id, quantity: quantity)
    }

    // Free-text extras store `"ingredientId": null`, as on the web; keep the key when encoding.
    func encode(to encoder: any Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encode(ingredientId, forKey: .ingredientId)
        try container.encode(quantity, forKey: .quantity)
    }
}

/// A chip's category edit (`ingre.chips.edits`); nil keeps the catalogue's.
struct ChipEdit: Codable, Equatable, Sendable {
    var section: ShopSection?
}

/// A picked recipe's copy with what the chips need from it.
struct CopyEntry: Equatable, Sendable {
    var copy: RecipeCopy
    var recipe: LibraryRecipe
    /// the recipe's name, with "(2)" on a repeat
    var label: String
    var lines: [CopyLine]
}

/// One source of a chip's amount: a recipe's need (in its own unit) or the Extra amount.
enum ChipSource: Equatable, Sendable {
    case recipe(recipeId: String, label: String, quantity: Double, measure: String, removed: Bool, customised: Bool)
    case extra(quantity: Double)

    var key: String {
        switch self {
        case let .recipe(recipeId, _, _, _, _, _): recipeId
        case .extra: "extra"
        }
    }

    var quantity: Double {
        switch self {
        case let .recipe(_, _, quantity, _, _, _): quantity
        case let .extra(quantity): quantity
        }
    }

    var isRecipe: Bool {
        if case .recipe = self { return true }
        return false
    }

    var removed: Bool {
        if case let .recipe(_, _, _, _, removed, _) = self { return removed }
        return false
    }

    var customised: Bool {
        if case let .recipe(_, _, _, _, _, customised) = self { return customised }
        return false
    }

    /// The box's visible label: the recipe's name, or "Extra".
    var label: String {
        switch self {
        case let .recipe(_, label, _, _, _, _): label
        case .extra: L10n.t("chip.extraSource")
        }
    }
}

/// One chip: an item, its sources, its total, where it sits and whether it is crossed off.
struct Chip: Equatable, Identifiable, Sendable {
    var id: String
    var name: String
    var item: LibraryIngredient?
    var unit: BaseUnit
    var sources: [ChipSource]
    var total: Amount
    /// the Extra amount, or nil when the item is not in Extra
    var extra: Int?
    var section: ShopSection
    var crossed: Bool
    /// every recipe removed it and it is not in Extra (#182)
    var greyed: Bool
    /// a recipe copy changed, added or removed it (#182)
    var customised: Bool

    var displayName: String { capitaliseFirst(name) }
    var recipeSources: [ChipSource] { sources.filter(\.isRecipe) }
}

struct ChipGroup: Equatable, Sendable {
    var section: ShopSection
    var chips: [Chip]
}

struct ChipState: Equatable, Sendable {
    var edits: [String: ChipEdit] = [:]
    var crossedIds: Set<String> = []
}

enum Chips {
    /// A recipe's label, with "(2)", "(3)" when earlier recipes have the same name (#182).
    static func sourceLabel(_ earlier: [String], _ name: String) -> String {
        let seen = earlier.filter { $0 == name }.count
        return seen == 0 ? name : L10n.t("sourceLabel", ["name": name, "n": String(seen + 1)])
    }

    /// The picked copies with their recipes, labels and lines; unknown recipes are skipped.
    static func entries(_ copies: [RecipeCopy], _ library: Library) -> [CopyEntry] {
        let known = copies.compactMap { copy in library.recipe(copy.recipeId).map { (copy, $0) } }
        let names = known.map(\.1.name)
        return known.enumerated().map { index, pair in
            CopyEntry(
                copy: pair.0, recipe: pair.1,
                label: sourceLabel(Array(names.prefix(index)), pair.1.name),
                lines: Copies.lines(pair.1, pair.0, library)
            )
        }
    }

    /// One recipe source's amount in the chip's unit; the raw number when it can't convert.
    static func sourceAmount(_ source: ChipSource, _ item: LibraryIngredient?, _ unit: BaseUnit) -> Double {
        guard case let .recipe(_, _, quantity, measure, removed, _) = source else { return source.quantity }
        if removed { return 0 }
        guard let item, let base = Units.toBase(quantity, measure, item) else { return quantity }
        return Units.convert(base, to: unit, item) ?? quantity
    }

    /// The chip's total: every recipe need plus Extra, never rounded (#182).
    static func total(_ sources: [ChipSource], _ item: LibraryIngredient?, _ unit: BaseUnit) -> Amount {
        Amount(amount: sources.reduce(0) { $0 + sourceAmount($1, item, unit) }, unit: unit)
    }

    /// The item's own category, or Other for free text.
    static func startSection(_ item: LibraryIngredient?) -> ShopSection {
        item?.section ?? .other
    }

    private static func recipeSources(_ id: String, _ entries: [CopyEntry]) -> [ChipSource] {
        entries.flatMap { entry in
            entry.lines.filter { $0.ingredientId == id }.map { line in
                ChipSource.recipe(
                    recipeId: entry.recipe.id, label: entry.label, quantity: line.quantity, measure: line.measure,
                    removed: line.quantity == 0, customised: entry.copy.isCustomised(id)
                )
            }
        }
    }

    /// Every chip (#182): recipe ingredients, staples included, in first-seen order, then extras
    /// no recipe uses. Each lists its recipe sources and its Extra.
    static func build(_ entries: [CopyEntry], _ extras: [Extra], _ state: ChipState, _ library: Library) -> [Chip] {
        var ids: [String] = []
        var seen: Set<String> = []
        for id in entries.flatMap({ $0.lines.map(\.ingredientId) }) + extras.map(\.chipId) where !seen.contains(id) {
            seen.insert(id)
            ids.append(id)
        }
        return ids.map { id in
            let extra = extras.first { $0.chipId == id }
            let item = library.item(id)
            let recipes = recipeSources(id, entries)
            let sources = recipes + (extra.map { [ChipSource.extra(quantity: Double($0.quantity))] } ?? [])
            let unit = Units.itemUnit(item)
            return Chip(
                id: id, name: item?.name ?? extra?.name ?? id, item: item, unit: unit, sources: sources,
                total: total(sources, item, unit), extra: extra?.quantity,
                section: state.edits[id]?.section ?? startSection(item),
                crossed: state.crossedIds.contains(id),
                greyed: extra == nil && recipes.allSatisfy(\.removed),
                customised: recipes.contains(where: \.customised)
            )
        }
    }

    /// Chips by category, categories in shop order; chip order is kept.
    static func groups(_ chips: [Chip]) -> [ChipGroup] {
        ShopSection.allCases.compactMap { section in
            let inSection = chips.filter { $0.section == section }
            return inSection.isEmpty ? nil : ChipGroup(section: section, chips: inSection)
        }
    }

    /// "in 2 recipes", "in 1 recipe and Extra", "in Extra" or "removed from every recipe".
    static func usedInSummary(_ chip: Chip) -> String {
        let n = chip.recipeSources.filter { !$0.removed }.count
        if n == 0 { return L10n.t(chip.extra == nil ? "usedIn.nowhere" : "usedIn.extraOnly") }
        return L10n.t(
            chip.extra == nil ? "usedIn.recipes" : "usedIn.recipesAndExtra",
            [
                "recipes": Units.formatRecipeCount(n)
            ])
    }

    /// A recipe row's chips (#182): every ingredient of the copy at its portions; crossed off is
    /// the same state as everywhere else, and a removed one is greyed at 0.
    static func rowChips(_ entry: CopyEntry, _ state: ChipState) -> [Chip] {
        entry.lines.map { line in
            let unit = Units.itemUnit(line.item)
            let source = ChipSource.recipe(
                recipeId: entry.recipe.id, label: entry.label, quantity: line.quantity, measure: line.measure,
                removed: line.quantity == 0, customised: entry.copy.isCustomised(line.ingredientId)
            )
            return Chip(
                id: line.ingredientId, name: line.name, item: line.item, unit: unit, sources: [source],
                total: total([source], line.item, unit), extra: nil,
                section: state.edits[line.ingredientId]?.section ?? startSection(line.item),
                crossed: state.crossedIds.contains(line.ingredientId), greyed: source.removed,
                customised: source.customised
            )
        }
    }

    /// The chip's amount (#182): its total, "1 kg" rather than packs.
    static func amount(_ chip: Chip) -> String {
        Units.formatAmount(chip.total, chip.item)
    }

    /// The Extra amount, in the chip's unit.
    static func extraAmount(_ chip: Chip) -> String {
        Units.formatAmount(Amount(amount: Double(chip.extra ?? 0), unit: chip.unit), chip.item)
    }

    /// A row chip's amount: its one source, in the recipe's own unit.
    static func rowAmount(_ chip: Chip) -> String {
        chip.sources.map { Units.amountText($0.quantity, measure(of: $0, chip), chip.item) }
            .joined(separator: L10n.t("chip.amountSeparator"))
    }

    /// A source's measure: the recipe's own, or the chip's unit for Extra.
    static func measure(of source: ChipSource, _ chip: Chip) -> String {
        if case let .recipe(_, _, _, measure, _, _) = source { return measure }
        return Units.unitMeasure(chip.unit)
    }

    /// The unit after a box: "g", "tbsp", "cloves", "heads" (never a bare number).
    static func sourceUnit(_ source: ChipSource, _ chip: Chip) -> String {
        Units.measureWord(source.quantity, measure(of: source, chip), chip.item)
    }

    /// "Butter chicken, butter (g)".
    static func sourceAccessibilityLabel(_ source: ChipSource, _ chip: Chip) -> String {
        L10n.t("chip.sourceLabel", ["source": source.label, "name": chip.name, "unit": sourceUnit(source, chip)])
    }

    /// What VoiceOver / TalkBack read for a chip: name, amount, category, where it is used, and
    /// crossed off when it is.
    static func accessibilityLabel(_ chip: Chip, amount: String) -> String {
        ([chip.displayName, amount, chip.section.label, usedInSummary(chip)]
            + (chip.crossed ? [L10n.t("chip.crossedOff")] : []))
            .joined(separator: L10n.t("chip.labelSeparator"))
    }

    /// "5 items", "5 items, 2 crossed off".
    static func ingredientsSummary(_ chips: [Chip]) -> String {
        let crossed = chips.filter(\.crossed).count
        let items = Units.formatItemCount(chips.count)
        return crossed == 0 ? items : L10n.t("ingredients.summaryCrossed", ["items": items, "count": String(crossed)])
    }
}
