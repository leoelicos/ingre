import Foundation

/// Amount and unit wording (#195): a port of client/src/i18n/format.ts and
/// client/src/utils/shopping/units.ts, so both apps read exactly like the web app.
enum Units {
    /// Two decimals at most: 37.5 -> 37.5, 1/3 -> 0.33 (Math.round, half up).
    static func rounded(_ n: Double) -> Double {
        ((n * 100) + 0.5).rounded(.down) / 100
    }

    /// A plain decimal, two places at most and no grouping: 37.5 -> "37.5", 1250 -> "1250".
    static func formatNumber(_ n: Double) -> String {
        let value = rounded(n) + 0
        if value == value.rounded() { return String(Int(value)) }
        var text = String(format: "%.2f", locale: Locale(identifier: "en_US_POSIX"), value)
        while text.hasSuffix("0") { text.removeLast() }
        if text.hasSuffix(".") { text.removeLast() }
        return text
    }

    private static let fractions: [(Double, String)] = [(0.25, "¼"), (0.5, "½"), (0.75, "¾")]

    /// Quarters as glyphs, else a plain decimal: 0.5 -> "½", 1.25 -> "1¼", 0.3 -> "0.3".
    static func formatFraction(_ n: Double) -> String {
        let value = rounded(n)
        let whole = value.rounded(.down)
        guard let glyph = fractions.first(where: { $0.0 == rounded(value - whole) })?.1 else {
            return formatNumber(value)
        }
        return whole == 0 ? glyph : "\(formatNumber(whole))\(glyph)"
    }

    /// Owner decision (#182): an amount up to 1 reads singular ("½ clove"), so (0, 1] counts as 1.
    static func pluralCount(_ quantity: Double) -> Double {
        let value = rounded(quantity)
        return value > 0 && value <= 1 ? 1 : value
    }

    static func formatItemUnit(_ quantity: Double) -> String {
        L10n.plural("item", count: pluralCount(quantity))
    }

    /// "1 head", "½ clove", "2 tomatoes"; the generic "item"/"items" without a unit of its own.
    static func formatCountUnit(_ quantity: Double, _ unit: CountUnit?) -> String {
        guard let unit else { return formatItemUnit(quantity) }
        return PluralRules.english(pluralCount(quantity)) == "one" ? unit.one : unit.other
    }

    private static func joinQuantity(_ number: String, _ unit: String) -> String {
        L10n.t("quantity", ["number": number, "unit": unit])
    }

    private static let decimalMeasures: Set<String> = ["g", "ml", "g tin", "ml tin"]
    private static let pluralMeasures: Set<String> = ["cup", "clove", "stalk", "bunch"]
    private static let fixedMeasures: Set<String> = ["g", "kg", "ml", "L", "g tin", "ml tin", "tsp", "tbsp"]

    /// "g" and "tbsp" never pluralise; "cup"/"cups"; an unknown measure is shown as written.
    static func formatMeasure(_ quantity: Double, _ measure: String) -> String {
        if pluralMeasures.contains(measure) {
            return L10n.plural("measure.\(measure)", count: pluralCount(quantity))
        }
        if fixedMeasures.contains(measure) { return L10n.t("measure.\(measure)") }
        return measure
    }

    /// "37.5 g", "½ tbsp", "1½ cloves", "2 onions"; "whole" takes the item's count unit.
    static func formatQuantity(_ quantity: Double, _ measure: String, _ unit: CountUnit? = nil) -> String {
        let number = decimalMeasures.contains(measure) ? formatNumber(quantity) : formatFraction(quantity)
        let word = measure == "whole" ? formatCountUnit(quantity, unit) : formatMeasure(quantity, measure)
        return joinQuantity(number, word)
    }

    /// "3 eggs", "1½ onions", "1 item".
    static func formatCount(_ quantity: Double, _ unit: CountUnit?) -> String {
        joinQuantity(formatFraction(quantity), formatCountUnit(quantity, unit))
    }

    /// "250 g", "1 kg", "1.5 L": never pluralised.
    static func formatMass(_ amount: Double, _ unit: BaseUnit) -> String {
        let small = unit == .ml ? "ml" : "g"
        let big = unit == .ml ? "L" : "kg"
        return amount >= 1000
            ? joinQuantity(formatNumber(amount / 1000), L10n.t("measure.\(big)"))
            : joinQuantity(formatNumber(amount), L10n.t("measure.\(small)"))
    }

    /// "2 recipes", "1 recipe".
    static func formatRecipeCount(_ n: Int) -> String {
        joinQuantity(formatNumber(Double(n)), L10n.plural("recipe", count: Double(n)))
    }

    /// "2 items", "1 item".
    static func formatItemCount(_ n: Int) -> String {
        joinQuantity(formatNumber(Double(n)), formatItemUnit(Double(n)))
    }

    /// The unit word of free text: counted things are never a bare number.
    static var genericCountUnit: CountUnit {
        CountUnit(one: formatItemUnit(1), other: formatItemUnit(2))
    }

    static func countUnitOf(_ item: LibraryIngredient?) -> CountUnit {
        item?.countUnit ?? genericCountUnit
    }

    /// A recipe amount in its own unit: "37.5 g", "½ tbsp", "1½ cloves", "2 onions".
    static func amountText(_ quantity: Double, _ measure: String, _ item: LibraryIngredient? = nil) -> String {
        formatQuantity(quantity, measure, countUnitOf(item))
    }

    /// The unit word after a recipe amount: "g", "cloves", or the item's own count unit.
    static func measureWord(_ quantity: Double, _ measure: String, _ item: LibraryIngredient? = nil) -> String {
        measure == "whole"
            ? formatCountUnit(quantity, countUnitOf(item))
            : formatMeasure(quantity, measure)
    }

    private static let measureToBase: [String: Amount] = [
        "g": Amount(amount: 1, unit: .g), "g tin": Amount(amount: 1, unit: .g),
        "ml": Amount(amount: 1, unit: .ml), "ml tin": Amount(amount: 1, unit: .ml),
        "tsp": Amount(amount: 5, unit: .ml), "tbsp": Amount(amount: 20, unit: .ml),
        "cup": Amount(amount: 250, unit: .ml),
        "whole": Amount(amount: 1, unit: .count), "bunch": Amount(amount: 1, unit: .count),
    ]

    /// A recipe quantity as a base amount, or nil when the measure is unknown for this item.
    static func toBase(_ quantity: Double, _ measure: String, _ item: LibraryIngredient) -> Amount? {
        if let direct = measureToBase[measure] {
            return Amount(amount: quantity * direct.amount, unit: direct.unit)
        }
        guard let grams = item.measureGrams?[measure] else { return nil }
        return Amount(amount: quantity * grams, unit: .g)
    }

    private static func isMass(_ unit: BaseUnit) -> Bool { unit == .g || unit == .ml }

    /// Between base units: g and ml are equal; counts convert with approxGrams.
    static func convert(_ amount: Amount, to: BaseUnit, _ item: LibraryIngredient) -> Double? {
        if amount.unit == to || (isMass(amount.unit) && isMass(to)) { return amount.amount }
        guard let each = item.approxGrams else { return nil }
        return amount.unit == .count ? amount.amount * each : amount.amount / each
    }

    /// The amount in the item's parts (garlic 0.3 -> 3 cloves), or nil when it has none.
    static func partsOf(_ amount: Double, _ item: LibraryIngredient?) -> (quantity: Double, measure: String)? {
        guard let measure = item?.partMeasure, let each = item?.approxGrams,
              let grams = item?.measureGrams?[measure] else { return nil }
        return ((amount * each) / grams, measure)
    }

    /// "2 heads", "1½ onions"; items bought whole but used in parts read in parts until whole.
    static func countText(_ amount: Double, _ item: LibraryIngredient?) -> String {
        let value = rounded(amount)
        guard let parts = partsOf(amount, item), value != value.rounded() else {
            return formatCount(amount, countUnitOf(item))
        }
        return amountText(parts.quantity, parts.measure)
    }

    /// "3 eggs", "250 g", "1 kg", "1.5 L".
    static func formatAmount(_ amount: Amount, _ item: LibraryIngredient? = nil) -> String {
        amount.unit == .count ? countText(amount.amount, item) : formatMass(amount.amount, amount.unit)
    }

    /// The unit an item is totalled in: its first sized sold option's unit, else grams.
    static func itemUnit(_ item: LibraryIngredient?) -> BaseUnit {
        guard let item else { return .count }
        return item.sold.first(where: { $0.size != nil })?.size?.unit ?? .g
    }

    /// The recipe measure for a unit: counted items are "whole".
    static func unitMeasure(_ unit: BaseUnit) -> String {
        unit == .count ? "whole" : unit.rawValue
    }
}
