import Foundation

/// A counted item's unit word, singular and plural. Matches the web `CountUnit`.
public struct CountUnit: Equatable, Sendable {
    public let one: String
    public let other: String
    public init(one: String, other: String) {
        self.one = one
        self.other = other
    }
}

/// The fields the web helper reads when it totals a counted item (#182).
public struct CountedItem: Equatable, Sendable {
    public var countUnit: CountUnit?
    public var partMeasure: String?
    public var approxGrams: Double?
    public var measureGrams: [String: Double]?
    public init(
        countUnit: CountUnit? = nil,
        partMeasure: String? = nil,
        approxGrams: Double? = nil,
        measureGrams: [String: Double]? = nil
    ) {
        self.countUnit = countUnit
        self.partMeasure = partMeasure
        self.approxGrams = approxGrams
        self.measureGrams = measureGrams
    }
}

public struct Amount: Equatable, Sendable {
    public let amount: Double
    public let unit: String
    public init(amount: Double, unit: String) {
        self.amount = amount
        self.unit = unit
    }
}

public struct Parts: Equatable, Sendable {
    public let quantity: Double
    public let measure: String
    public init(quantity: Double, measure: String) {
        self.quantity = quantity
        self.measure = measure
    }
}

public struct SoldSize: Equatable, Sendable {
    public let amount: Double
    public let unit: String
    public init(amount: Double, unit: String) {
        self.amount = amount
        self.unit = unit
    }
}

public struct SoldOption: Equatable, Sendable {
    public let type: String
    public let size: SoldSize?
    public init(type: String, size: SoldSize?) {
        self.type = type
        self.size = size
    }
}

/// Two decimals at most, half away from zero, matching the web `rounded`.
public func rounded(_ n: Double) -> Double {
    (n * 100).rounded() / 100
}

/// A plain decimal, two places at most and no grouping. Never "-0".
public func formatNumber(_ n: Double) -> String {
    let value = rounded(n)
    if value == 0 { return "0" }
    if value == value.rounded(.towardZero) && value == Double(Int(value)) {
        return String(Int(value))
    }
    let text = String(format: "%.2f", value)
    var trimmed = text
    while trimmed.last == "0" { trimmed.removeLast() }
    if trimmed.last == "." { trimmed.removeLast() }
    return trimmed
}

private let fractions: [(Double, String)] = [(0.25, "¼"), (0.5, "½"), (0.75, "¾")]

/// Quarters as glyphs, otherwise a plain decimal.
public func formatFraction(_ n: Double) -> String {
    let value = rounded(n)
    let whole = Int(value.rounded(.down))
    let glyph = fractions.first { rounded(value - Double(whole)) == $0.0 }?.1
    if let glyph {
        return whole == 0 ? glyph : formatNumber(Double(whole)) + glyph
    }
    return formatNumber(value)
}

/// Up to 1 reads singular, so (0, 1] counts as 1.
public func pluralCount(_ quantity: Double) -> Double {
    let value = rounded(quantity)
    return value > 0 && value <= 1 ? 1 : value
}

private func singular(_ quantity: Double) -> Bool { pluralCount(quantity) == 1 }

public func formatItemUnit(_ quantity: Double) -> String {
    singular(quantity) ? "item" : "items"
}

public func formatCountUnit(_ quantity: Double, _ unit: CountUnit?) -> String {
    guard let unit else { return formatItemUnit(quantity) }
    return singular(quantity) ? unit.one : unit.other
}

private let pluralMeasures = [
    "cup": "cups", "clove": "cloves", "stalk": "stalks", "bunch": "bunches"
]

/// A recipe measure's word. Spoons, weights and volumes never pluralise.
public func formatMeasure(_ quantity: Double, _ measure: String) -> String {
    singular(quantity) ? measure : (pluralMeasures[measure] ?? measure)
}

private let decimalMeasures: Set<String> = ["g", "ml", "g tin", "ml tin"]

private func joinQuantity(_ number: String, _ unit: String) -> String { "\(number) \(unit)" }

/// A recipe amount in its own unit: "37.5 g", "½ tbsp", "1½ cloves", "2 onions".
public func formatQuantity(_ quantity: Double, _ measure: String, _ unit: CountUnit? = nil) -> String {
    let number = decimalMeasures.contains(measure) ? formatNumber(quantity) : formatFraction(quantity)
    let word = measure == "whole" ? formatCountUnit(quantity, unit) : formatMeasure(quantity, measure)
    return joinQuantity(number, word)
}

/// A counted amount: "3 eggs", "1½ onions", "1 item".
public func formatCount(_ quantity: Double, _ unit: CountUnit?) -> String {
    joinQuantity(formatFraction(quantity), formatCountUnit(quantity, unit))
}

/// A weight or volume, never pluralised. Switches to kg and L from 1000.
public func formatMass(_ amount: Double, _ unit: String) -> String {
    if amount >= 1000 {
        let big = unit == "g" ? "kg" : "L"
        return joinQuantity(formatNumber(amount / 1000), big)
    }
    return joinQuantity(formatNumber(amount), unit)
}

private let measureToBase: [String: Amount] = [
    "g": Amount(amount: 1, unit: "g"),
    "g tin": Amount(amount: 1, unit: "g"),
    "ml": Amount(amount: 1, unit: "ml"),
    "ml tin": Amount(amount: 1, unit: "ml"),
    "tsp": Amount(amount: 5, unit: "ml"),
    "tbsp": Amount(amount: 20, unit: "ml"),
    "cup": Amount(amount: 250, unit: "ml"),
    "whole": Amount(amount: 1, unit: "count"),
    "bunch": Amount(amount: 1, unit: "count")
]

public func toBase(_ quantity: Double, _ measure: String, _ measureGrams: [String: Double]?) -> Amount? {
    if let direct = measureToBase[measure] {
        return Amount(amount: quantity * direct.amount, unit: direct.unit)
    }
    guard let grams = measureGrams?[measure] else { return nil }
    return Amount(amount: quantity * grams, unit: "g")
}

private func isMass(_ unit: String) -> Bool { unit == "g" || unit == "ml" }

public func convert(_ amount: Amount, _ to: String, _ approxGrams: Double?) -> Double? {
    if amount.unit == to || (isMass(amount.unit) && isMass(to)) { return amount.amount }
    guard let each = approxGrams else { return nil }
    return amount.unit == "count" ? amount.amount * each : amount.amount / each
}

public func partsOf(_ amount: Double, _ item: CountedItem?) -> Parts? {
    guard let measure = item?.partMeasure, let each = item?.approxGrams, let grams = item?.measureGrams?[measure] else {
        return nil
    }
    return Parts(quantity: (amount * each) / grams, measure: measure)
}

private func isWhole(_ n: Double) -> Bool {
    let value = rounded(n)
    return value == value.rounded(.down)
}

/// A counted total. Parts until the total is a whole item, then the item's own unit.
public func countText(_ amount: Double, _ item: CountedItem?) -> String {
    let parts = partsOf(amount, item)
    if parts == nil || isWhole(amount) {
        return formatCount(amount, item?.countUnit)
    }
    return formatQuantity(parts!.quantity, parts!.measure)
}

public func formatAmount(_ amount: Amount, _ item: CountedItem? = nil) -> String {
    amount.unit == "count" ? countText(amount.amount, item) : formatMass(amount.amount, amount.unit)
}

/// The unit an item is totalled in. Free text (no sold list) is counted.
public func itemUnit(_ sold: [SoldOption]?) -> String {
    guard let sold else { return "count" }
    return sold.first { $0.size != nil }?.size?.unit ?? "g"
}

public func unitMeasure(_ unit: String) -> String { unit == "count" ? "whole" : unit }
