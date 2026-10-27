import Foundation

public struct CatalogIngredient: Equatable, Sendable {
    public let id: String
    public let name: String
    public let category: String
    public let approxGrams: Double?
    public let measureGrams: [String: Double]
    public init(id: String, name: String, category: String, approxGrams: Double? = nil, measureGrams: [String: Double] = [:]) {
        self.id = id
        self.name = name
        self.category = category
        self.approxGrams = approxGrams
        self.measureGrams = measureGrams
    }
}

public struct CatalogLine: Equatable, Sendable {
    public let ingredientId: String
    public let quantity: Double
    public let measure: String
    public init(ingredientId: String, quantity: Double, measure: String) {
        self.ingredientId = ingredientId
        self.quantity = quantity
        self.measure = measure
    }
}

public struct CatalogRecipe: Equatable, Sendable {
    public let id: String
    public let name: String
    public let portions: Int
    public let lines: [CatalogLine]
    public let method: [String]
    public init(id: String, name: String, portions: Int, lines: [CatalogLine], method: [String] = []) {
        self.id = id
        self.name = name
        self.portions = portions
        self.lines = lines
        self.method = method
    }
}

private let irregular: [String: String] = [
    "leaf": "leaves", "chilli": "chillies", "potato": "potatoes", "tomato": "tomatoes", "egg": "eggs"
]
private let singulars: [String: String] = Dictionary(uniqueKeysWithValues: irregular.map { ($0.value, $0.key) })

private func looksPlural(_ word: String) -> Bool {
    word.range(of: "[^su]s$", options: .regularExpression) != nil
}

private func onLastWord(_ phrase: String, _ fn: (String) -> String) -> String {
    let index = phrase.lastIndex(of: " ").map { phrase.index(after: $0) } ?? phrase.startIndex
    return String(phrase[..<index]) + fn(String(phrase[index...]))
}

public func pluralise(_ phrase: String) -> String {
    onLastWord(phrase) { word in
        if let many = irregular[word] { return many }
        if singulars[word] != nil || looksPlural(word) { return word }
        if word.range(of: "(s|x|ch|sh)$", options: .regularExpression) != nil { return word + "es" }
        if word.range(of: "[^aeiou]y$", options: .regularExpression) != nil {
            return String(word.dropLast()) + "ies"
        }
        return word + "s"
    }
}

public func singularise(_ phrase: String) -> String {
    onLastWord(phrase) { word in
        if let one = singulars[word] { return one }
        return looksPlural(word) ? String(word.dropLast()) : word
    }
}

public func normaliseTerm(_ text: String) -> String {
    text.trimmingCharacters(in: .whitespacesAndNewlines)
        .lowercased()
        .split(whereSeparator: { $0.isWhitespace })
        .map { singularise(String($0)) }
        .joined(separator: " ")
}

public func tierOf(_ name: String, _ query: String) -> Int {
    let text = normaliseTerm(name)
    let q = normaliseTerm(query)
    if text.hasPrefix(q) { return 0 }
    if text.split(separator: " ").contains(where: { $0.hasPrefix(q) }) { return 1 }
    return text.contains(q) ? 2 : 3
}

public func ingredientMatches(_ name: String, _ query: String) -> Bool {
    let haystack = normaliseTerm(name)
    let words = normaliseTerm(query).split(separator: " ")
    return words.allSatisfy { haystack.contains($0) }
}

public func recipeMatches(_ recipe: CatalogRecipe, _ query: String, _ namesById: [String: String]) -> Bool {
    let words = normaliseTerm(query).split(separator: " ").map(String.init)
    if words.isEmpty { return true }
    let fields = [normaliseTerm(recipe.name)] + recipe.lines.map { normaliseTerm(namesById[$0.ingredientId] ?? "") }
    return words.allSatisfy { word in fields.contains { $0.contains(word) } }
}

public enum ExploreView: Equatable, Sendable {
    case browse(recipes: [CatalogRecipe])
    case matches(ingredients: [CatalogIngredient], recipes: [CatalogRecipe])
    case none(ingredients: [CatalogIngredient], recipes: [CatalogRecipe], browse: [CatalogRecipe])
}

public func levenshtein(_ a: String, _ b: String) -> Int {
    let left = Array(a)
    let right = Array(b)
    if left == right { return 0 }
    if left.isEmpty { return right.count }
    if right.isEmpty { return left.count }
    var prev = Array(0...right.count)
    for i in left.indices {
        var cur = Array(repeating: 0, count: right.count + 1)
        cur[0] = i + 1
        for j in right.indices {
            let cost = left[i] == right[j] ? 0 : 1
            cur[j + 1] = min(cur[j] + 1, prev[j + 1] + 1, prev[j] + cost)
        }
        prev = cur
    }
    return prev[right.count]
}

private func byName(_ a: String, _ b: String) -> Bool {
    a.localizedStandardCompare(b) == .orderedAscending
}

private func rank<T>(_ items: [T], _ query: String, _ name: (T) -> String) -> [T] {
    items.sorted { left, right in
        let tier = tierOf(name(left), query) - tierOf(name(right), query)
        if tier != 0 { return tier < 0 }
        return byName(name(left), name(right))
    }
}

private func closeMatches<T>(_ items: [T], _ query: String, _ name: (T) -> String) -> [T] {
    let q = normaliseTerm(query)
    guard q.count >= 3 else { return [] }
    return items.compactMap { item -> (T, Int)? in
        let distance = levenshtein(normaliseTerm(name(item)), q)
        return distance <= 2 ? (item, distance) : nil
    }.sorted { left, right in
        if left.1 != right.1 { return left.1 < right.1 }
        return byName(name(left.0), name(right.0))
    }.map(\.0)
}

public func explore(
    query: String,
    ingredients: [CatalogIngredient],
    recipes: [CatalogRecipe],
    savedOnly: Bool = false,
    savedIds: Set<String> = []
) -> ExploreView {
    let pool = savedOnly ? recipes.filter { savedIds.contains($0.id) } : recipes
    let alpha = pool.sorted { byName($0.name, $1.name) }
    if normaliseTerm(query).isEmpty { return .browse(recipes: alpha) }
    let names = Dictionary(uniqueKeysWithValues: ingredients.map { ($0.id, $0.name) })
    let foundIngredients = rank(ingredients.filter { ingredientMatches($0.name, query) }, query) { $0.name }
    let foundRecipes = rank(pool.filter { recipeMatches($0, query, names) }, query) { $0.name }
    if foundIngredients.isEmpty && foundRecipes.isEmpty {
        return .none(
            ingredients: closeMatches(ingredients, query) { $0.name },
            recipes: closeMatches(pool, query) { $0.name },
            browse: alpha
        )
    }
    return .matches(ingredients: foundIngredients, recipes: foundRecipes)
}

public func capitaliseFirst(_ name: String) -> String {
    guard let first = name.first else { return name }
    return first.uppercased() + name.dropFirst()
}

public struct ShopLine: Equatable, Sendable {
    public let ingredientId: String
    public let name: String
    public let quantity: Double
    public let measure: String
    public let category: String
    public init(ingredientId: String, name: String, quantity: Double, measure: String, category: String) {
        self.ingredientId = ingredientId
        self.name = name
        self.quantity = quantity
        self.measure = measure
        self.category = category
    }
}

public func shopLines(_ recipes: [StoredRecipe], _ names: [String: String], _ categories: [String: String]) -> [ShopLine] {
    var totals: [String: Double] = [:]
    var order: [String] = []
    var seen: [String: String] = [:]
    for recipe in recipes {
        for line in recipe.lines where line.quantity > 0 {
            let key = line.ingredientId + "\u{1f}" + line.measure
            if totals[key] == nil { order.append(key) }
            totals[key, default: 0] += line.quantity
            if seen[line.ingredientId] == nil { seen[line.ingredientId] = line.name }
        }
    }
    return order.compactMap { key -> ShopLine? in
        guard let quantity = totals[key] else { return nil }
        let parts = key.split(separator: "\u{1f}", maxSplits: 1).map(String.init)
        let id = parts[0]
        let measure = parts.count > 1 ? parts[1] : ""
        return ShopLine(
            ingredientId: id,
            name: names[id] ?? seen[id] ?? id,
            quantity: quantity,
            measure: measure,
            category: categories[id] ?? "other"
        )
    }.sorted { left, right in
        if left.category != right.category { return byName(left.category, right.category) }
        return byName(left.name, right.name)
    }
}

public let defaultPortions = 2

public func clampPortions(_ portions: Double) -> Int {
    guard portions.isFinite else { return defaultPortions }
    return min(12, max(1, Int(portions.rounded())))
}

public struct RecipeCopyState: Equatable, Sendable {
    public let recipeId: String
    public let portions: Int
    public let amounts: [String: Double]
    public init(recipeId: String, portions: Int = defaultPortions, amounts: [String: Double] = [:]) {
        self.recipeId = recipeId
        self.portions = portions
        self.amounts = amounts
    }
}

public func newCopy(_ recipeId: String, _ portions: Int = defaultPortions) -> RecipeCopyState {
    RecipeCopyState(recipeId: recipeId, portions: clampPortions(Double(portions)))
}

public func scaledLines(_ recipe: CatalogRecipe, _ copy: RecipeCopyState, _ names: [String: String]) -> [Line] {
    let portions = max(recipe.portions, 1)
    let originalIds = Set(recipe.lines.map(\.ingredientId))
    let originals = recipe.lines.map { line in
        let perServe = line.quantity / Double(portions)
        let amount = copy.amounts[line.ingredientId] ?? perServe
        return Line(
            ingredientId: line.ingredientId,
            name: names[line.ingredientId] ?? line.ingredientId,
            quantity: amount * Double(copy.portions),
            measure: line.measure
        )
    }
    let added = copy.amounts.filter { !originalIds.contains($0.key) }.map { id, amount in
        Line(ingredientId: id, name: names[id] ?? id, quantity: amount * Double(copy.portions), measure: "whole")
    }
    return originals + added
}

public func toStored(_ recipe: CatalogRecipe, _ names: [String: String]) -> StoredRecipe {
    StoredRecipe(
        id: recipe.id,
        name: recipe.name,
        lines: recipe.lines.map { line in
            Line(
                ingredientId: line.ingredientId,
                name: names[line.ingredientId] ?? line.ingredientId,
                quantity: line.quantity,
                measure: line.measure
            )
        }
    )
}

private func jsonObject(_ json: String) -> [String: Any]? {
    guard let data = json.data(using: .utf8),
          let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
    return object
}

private func number(_ value: Any?) -> Double? {
    (value as? NSNumber)?.doubleValue
}

public func parseIngredients(_ json: String) -> [CatalogIngredient] {
    guard let rows = jsonObject(json)?["ingredients"] as? [[String: Any]] else { return [] }
    return rows.compactMap { row in
        guard let id = row["id"] as? String, !id.isEmpty, let name = row["name"] as? String, !name.isEmpty else {
            return nil
        }
        var measures: [String: Double] = [:]
        if let raw = row["measureGrams"] as? [String: Any] {
            for (key, value) in raw { if let amount = number(value) { measures[key] = amount } }
        }
        return CatalogIngredient(
            id: id,
            name: name,
            category: (row["category"] as? String) ?? "",
            approxGrams: number(row["approxGrams"]),
            measureGrams: measures
        )
    }
}

public func parseRecipes(_ json: String) -> [CatalogRecipe] {
    guard let rows = jsonObject(json)?["recipes"] as? [[String: Any]] else { return [] }
    return rows.compactMap { row in
        guard let id = row["id"] as? String, !id.isEmpty, let name = row["name"] as? String, !name.isEmpty else {
            return nil
        }
        let lines = (row["ingredients"] as? [[String: Any]] ?? []).compactMap { line -> CatalogLine? in
            guard let ingredientId = line["ingredientId"] as? String, !ingredientId.isEmpty else { return nil }
            return CatalogLine(
                ingredientId: ingredientId,
                quantity: number(line["quantity"]) ?? 0,
                measure: (line["measure"] as? String) ?? ""
            )
        }
        let method = (row["method"] as? [String]) ?? []
        let portions = (row["portions"] as? NSNumber)?.intValue ?? 1
        return CatalogRecipe(id: id, name: name, portions: portions, lines: lines, method: method)
    }
}
