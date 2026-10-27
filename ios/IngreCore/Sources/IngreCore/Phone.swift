import Foundation

/// The phone page, top to bottom. Same order as the web app below 576px. No overlays.
public enum PhoneSection: String, CaseIterable, Sendable {
    case explore = "Explore"
    case ingredients = "Ingredients"
    case recipes = "Recipes"
    case extra = "Extra"
}

public func phoneSections() -> [PhoneSection] { PhoneSection.allCases }

/// Explore starts open when the list is empty, or when Saved was asked for.
public func exploreStartsOpen(pickedCount: Int, savedRequested: Bool) -> Bool {
    pickedCount == 0 || savedRequested
}

/// A closed recipe row's chip: the name and nothing else.
public struct NameChip: Equatable, Sendable {
    public let name: String
    public init(name: String) { self.name = name }
}

public func closedChips(_ names: [String]) -> [NameChip] { names.map { NameChip(name: $0) } }

/// There is never a three-ingredient preview and never a badge (#191, #195).
public let showsKeyIngredientPreview = false
public let showsBadges = false

public struct Line: Equatable, Sendable {
    public let ingredientId: String
    public let name: String
    public let quantity: Double
    public let measure: String
    public init(ingredientId: String, name: String, quantity: Double, measure: String) {
        self.ingredientId = ingredientId
        self.name = name
        self.quantity = quantity
        self.measure = measure
    }
}

public struct StoredRecipe: Equatable, Sendable {
    public let id: String
    public let name: String
    public var lines: [Line]
    public var portions: Int
    public init(id: String, name: String, lines: [Line], portions: Int = defaultPortions) {
        self.id = id
        self.name = name
        self.lines = lines
        self.portions = portions
    }
}

/// Explore keeps the original. Recipes keeps the edited copy.
public struct ListMemory: Equatable, Sendable {
    public var originals: [String: StoredRecipe]
    public var copies: [String: StoredRecipe]
    public init(originals: [String: StoredRecipe] = [:], copies: [String: StoredRecipe] = [:]) {
        self.originals = originals
        self.copies = copies
    }
}

public func pickRecipe(_ memory: ListMemory, _ recipe: StoredRecipe) -> ListMemory {
    if memory.copies[recipe.id] != nil { return memory }
    var next = memory
    next.originals[recipe.id] = recipe
    next.copies[recipe.id] = recipe
    return next
}

public func editCopy(_ memory: ListMemory, _ id: String, _ lines: [Line]) -> ListMemory {
    guard var copy = memory.copies[id] else { return memory }
    copy.lines = lines
    var next = memory
    next.copies[id] = copy
    return next
}

public func exploreRecipe(_ memory: ListMemory, _ id: String) -> StoredRecipe? { memory.originals[id] }

public func recipeCopies(_ memory: ListMemory) -> [StoredRecipe] { Array(memory.copies.values) }

/// Portions for this copy: a whole number from 1 to 12. The lines scale. Explore stays.
public func setPortions(_ memory: ListMemory, _ id: String, _ portions: Int) -> ListMemory {
    guard let copy = memory.copies[id] else { return memory }
    let next = clampPortions(Double(portions))
    if next == copy.portions { return memory }
    let factor = Double(next) / Double(max(copy.portions, 1))
    var updated = copy
    updated.portions = next
    updated.lines = copy.lines.map { line in
        Line(
            ingredientId: line.ingredientId,
            name: line.name,
            quantity: line.quantity * factor,
            measure: line.measure
        )
    }
    var result = memory
    result.copies[id] = updated
    return result
}

/// "Title (local name)" splits the same way as the web.
public func splitTitle(_ name: String) -> (String, String?) {
    guard let match = name.firstMatch(of: /^(.*\S)\s*\(([^()]+)\)\s*$/) else {
        return (name.trimmingCharacters(in: .whitespacesAndNewlines), nil)
    }
    return (String(match.1), String(match.2).trimmingCharacters(in: .whitespacesAndNewlines))
}

/// The second tap does nothing. The starting line stays up.
public final class UpgradeStarter: @unchecked Sendable {
    public private(set) var starting = false
    public init() {}
    public func start() -> Bool {
        if starting { return false }
        starting = true
        return true
    }
}

public let upgradeStarting = "Starting the Stripe checkout…"

/// The login mutation body, so the request can be checked without a server.
public func loginBody(email: String, password: String) -> String {
    let query = "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token } }"
    return #"{"query":"\#(query)","variables":{"email":\#(jsonString(email)),"password":\#(jsonString(password))}}"#
}

private func jsonString(_ value: String) -> String {
    "\"" + value.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"") + "\""
}
