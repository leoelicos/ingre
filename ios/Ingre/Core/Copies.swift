import Foundation

/// Recipe copies (#182, #195): one per picked recipe, with its own portions and the per-serve
/// amounts that differ from the library original. A port of client/src/utils/balance/copies.ts.
struct RecipeCopy: Codable, Equatable, Sendable {
    static let defaultPortions = 2
    static let minPortions = 1
    static let maxPortions = 12

    var recipeId: String
    /// whole number from 1 to 12
    var portions: Int
    /// per-serve amounts in recipe units that differ from the original; 0 is removed
    var amounts: [String: Double]

    init(recipeId: String, portions: Int = RecipeCopy.defaultPortions, amounts: [String: Double] = [:]) {
        self.recipeId = recipeId
        self.portions = portions
        self.amounts = amounts
    }

    static func clampPortions(_ portions: Double) -> Int {
        guard portions.isFinite else { return defaultPortions }
        return min(maxPortions, max(minPortions, Int(portions.rounded())))
    }

    func isCustomised(_ ingredientId: String) -> Bool {
        amounts[ingredientId] != nil
    }
}

/// One ingredient of a copy at its portions, in recipe units.
struct CopyLine: Equatable, Sendable {
    var ingredientId: String
    var name: String
    var item: LibraryIngredient?
    /// 0 when removed
    var quantity: Double
    var measure: String
    /// the original amount at these portions, or nil when the user added it
    var original: Double?

    var displayName: String { capitaliseFirst(name) }
}

enum Copies {
    /// The measure an added ingredient is written in: its base unit ("g", "ml", "whole").
    static func addedMeasure(_ item: LibraryIngredient?) -> String {
        Units.unitMeasure(Units.itemUnit(item))
    }

    /// Every ingredient of the copy: the original ones (removed at 0), then the added ones by name.
    /// The web keeps added ones in insertion order; JSON objects decoded here have no order, so
    /// both native apps sort them by name for a stable list.
    static func lines(_ recipe: LibraryRecipe, _ copy: RecipeCopy, _ library: Library) -> [CopyLine] {
        let originalIds = Set(recipe.ingredients.map(\.ingredientId))
        let originals = recipe.ingredients.map { ri -> CopyLine in
            let perServe = ri.quantity / Double(recipe.portions)
            let amount = copy.amounts[ri.ingredientId] ?? perServe
            let item = library.item(ri.ingredientId)
            return CopyLine(
                ingredientId: ri.ingredientId, name: item?.name ?? ri.ingredientId, item: item,
                quantity: amount * Double(copy.portions), measure: ri.measure,
                original: perServe * Double(copy.portions)
            )
        }
        let added = copy.amounts
            .filter { !originalIds.contains($0.key) }
            .map { id, amount -> CopyLine in
                let item = library.item(id)
                return CopyLine(
                    ingredientId: id, name: item?.name ?? id, item: item,
                    quantity: amount * Double(copy.portions), measure: addedMeasure(item), original: nil
                )
            }
            .sorted { $0.name < $1.name }
        return originals + added
    }

    /// The ingredients the copy still uses (not removed).
    static func used(_ lines: [CopyLine]) -> [CopyLine] {
        lines.filter { $0.quantity > 0 }
    }

    /// The copy with one ingredient set to `quantity` at its portions. The original amount clears
    /// the edit, and 0 on an added ingredient takes it off again.
    static func withAmount(_ copy: RecipeCopy, _ recipe: LibraryRecipe, _ ingredientId: String, _ quantity: Double) -> RecipeCopy {
        let perServe = max(0, quantity) / Double(copy.portions)
        let original = recipe.ingredients.first { $0.ingredientId == ingredientId }
        let unchanged: Bool = if let original {
            abs(perServe - original.quantity / Double(recipe.portions)) < 1e-9
        } else {
            perServe == 0
        }
        var next = copy
        if unchanged {
            next.amounts.removeValue(forKey: ingredientId)
        } else {
            next.amounts[ingredientId] = perServe
        }
        return next
    }

    static func withPortions(_ copy: RecipeCopy, _ portions: Double) -> RecipeCopy {
        var next = copy
        next.portions = RecipeCopy.clampPortions(portions)
        return next
    }

    /// Refresh (#182): back to the original at the default portions.
    static func reset(_ copy: RecipeCopy) -> RecipeCopy {
        RecipeCopy(recipeId: copy.recipeId)
    }

    /// The copy's differences from the original, as saveRecipe takes them (#182).
    static func customisations(_ lines: [CopyLine], _ copy: RecipeCopy) -> CustomisationsValue {
        let edited = lines.filter { copy.isCustomised($0.ingredientId) }
        var result = CustomisationsValue()
        for line in edited {
            if let original = line.original {
                if line.quantity == 0 {
                    result.removed.append(.init(ingredientId: line.ingredientId, from: Units.rounded(original)))
                } else {
                    result.changed.append(.init(
                        ingredientId: line.ingredientId, from: Units.rounded(original), to: Units.rounded(line.quantity)
                    ))
                }
            } else {
                result.added.append(.init(ingredientId: line.ingredientId, to: Units.rounded(line.quantity)))
            }
        }
        if copy.portions != RecipeCopy.defaultPortions {
            result.portions = .init(from: RecipeCopy.defaultPortions, to: copy.portions)
        }
        return result
    }

    private static func bullet(_ line: CopyLine) -> String {
        guard let original = line.original else {
            return L10n.t("customisation.added", [
                "name": line.name, "amount": Units.amountText(line.quantity, line.measure, line.item),
            ])
        }
        if line.quantity == 0 { return L10n.t("customisation.removed", ["name": line.displayName]) }
        return L10n.t("customisation.changed", [
            "name": line.displayName,
            "from": Units.amountText(original, line.measure, line.item),
            "to": Units.amountText(line.quantity, line.measure, line.item),
        ])
    }

    private static func rank(_ line: CopyLine) -> Int {
        line.original == nil ? 0 : line.quantity == 0 ? 1 : 2
    }

    /// The bullets under Customisations (#182): "Added red chilli 1 item", "Butter removed",
    /// "Butter 25 g → 37.5 g", "Portions 2 → 4".
    static func bullets(_ lines: [CopyLine], _ copy: RecipeCopy) -> [String] {
        let edited = lines.enumerated()
            .filter { copy.isCustomised($0.element.ingredientId) }
            .sorted { (rank($0.element), $0.offset) < (rank($1.element), $1.offset) }
            .map { bullet($0.element) }
        let portions = copy.portions == RecipeCopy.defaultPortions ? [] : [
            L10n.t("customisation.portions", ["from": String(RecipeCopy.defaultPortions), "to": String(copy.portions)]),
        ]
        return edited + portions
    }

    static let placeholderPicture = "/ingre.png"

    /// The saveRecipe input for a copy (#182): its ingredients with catalogue ids, and its differences.
    static func saveInput(_ recipe: LibraryRecipe, _ copy: RecipeCopy, _ library: Library) -> RecipeInputValue {
        let all = lines(recipe, copy, library)
        return RecipeInputValue(
            name: recipe.name,
            portions: copy.portions,
            pictureURL: placeholderPicture,
            libraryId: recipe.id,
            ingredients: used(all).map {
                .init(
                    name: $0.name, quantity: Units.rounded($0.quantity), measure: $0.measure,
                    category: $0.item?.category ?? "other", ingredientId: $0.ingredientId
                )
            },
            customisations: customisations(all, copy)
        )
    }

    /// The notes under the method (#182): allergens of the ingredients used.
    static func notes(_ lines: [CopyLine]) -> [String] {
        let allergens = Set(used(lines).compactMap(\.item).flatMap { $0.allergens.map { $0.lowercased() } }).sorted()
        guard !allergens.isEmpty else { return [] }
        return [L10n.t("allergens.contains", ["list": allergens.joined(separator: L10n.t("allergens.separator"))])]
    }
}

/// What saveRecipe takes (server RecipeInput), independent of the generated GraphQL types so the
/// domain stays testable on its own; the network layer maps it onto the generated input.
struct RecipeInputValue: Equatable, Sendable {
    struct Ingredient: Equatable, Sendable {
        var name: String
        var quantity: Double
        var measure: String
        var category: String
        var ingredientId: String
    }

    var name: String
    var portions: Int
    var pictureURL: String
    var libraryId: String
    var ingredients: [Ingredient]
    var customisations: CustomisationsValue
}

struct CustomisationsValue: Equatable, Sendable {
    struct Added: Equatable, Sendable { var ingredientId: String; var to: Double }
    struct Removed: Equatable, Sendable { var ingredientId: String; var from: Double }
    struct Changed: Equatable, Sendable { var ingredientId: String; var from: Double; var to: Double }
    struct Portions: Equatable, Sendable { var from: Int; var to: Int }

    var added: [Added] = []
    var removed: [Removed] = []
    var changed: [Changed] = []
    var portions: Portions?
}
