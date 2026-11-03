import Foundation

/// Explore search (#181, #195): a port of client/src/utils/explore/exploreSearch.ts and
/// searchTerms.ts. Close matches use a Bitap-style approximate match with Fuse.js's default
/// settings (threshold 0.6, location 0, distance 100), since Fuse.js itself is web only.
enum Search {
    private static let irregularPlurals: [String: String] = [
        "leaf": "leaves", "chilli": "chillies", "potato": "potatoes", "tomato": "tomatoes", "egg": "eggs",
    ]
    private static let singulars: [String: String] = Dictionary(
        uniqueKeysWithValues: irregularPlurals.map { ($0.value, $0.key) }
    )

    /// Ends in a plural -s (not -ss or -us, e.g. "glass", "hummus").
    private static func looksPlural(_ word: String) -> Bool {
        guard word.count >= 2, word.hasSuffix("s") else { return false }
        let before = word[word.index(word.endIndex, offsetBy: -2)]
        return before != "s" && before != "u"
    }

    /// Singular for a word: eggs -> egg, tomatoes -> tomato.
    static func singularise(_ word: String) -> String {
        singulars[word] ?? (looksPlural(word) ? String(word.dropLast()) : word)
    }

    /// Lowercase, trimmed, every word singular: " Tomatoes Chillies " -> "tomato chilli".
    static func normalise(_ text: String) -> String {
        text.lowercased()
            .split(whereSeparator: \.isWhitespace)
            .map { singularise(String($0)) }
            .joined(separator: " ")
    }

    /// The name starts with the query, then a word in it does, then it contains it; else 3.
    static func tier(_ name: String, _ query: String) -> Int {
        let text = normalise(name)
        let q = normalise(query)
        if text.hasPrefix(q) { return 0 }
        if text.split(separator: " ").contains(where: { $0.hasPrefix(q) }) { return 1 }
        return text.contains(q) ? 2 : 3
    }

    static func ranked<T>(_ items: [T], _ query: String, name: (T) -> String) -> [T] {
        items.map { ($0, tier(name($0), query)) }
            .sorted { a, b in a.1 != b.1 ? a.1 < b.1 : name(a.0).localizedCompare(name(b.0)) == .orderedAscending }
            .map(\.0)
    }

    /// An ingredient matches when its name holds every word of the query.
    static func ingredientMatches(_ item: LibraryIngredient, _ query: String) -> Bool {
        let name = normalise(item.name)
        return normalise(query).split(separator: " ").allSatisfy { name.contains($0) }
    }

    /// A recipe matches when every query word is in its name or one of its ingredients' names.
    static func matches(_ recipe: LibraryRecipe, _ query: String, _ library: Library) -> Bool {
        let q = normalise(query)
        if q.isEmpty { return true }
        let haystack = ([recipe.name] + recipe.ingredients.map { library.item($0.ingredientId)?.name ?? "" })
            .map(normalise)
        return q.split(separator: " ").allSatisfy { word in haystack.contains { $0.contains(word) } }
    }

    /// Fuse.js's score for one text: 0 is exact, 1 is no match; nil above the 0.6 threshold.
    static func fuzzyScore(_ text: String, _ pattern: String) -> Double? {
        let t = Array(text.lowercased())
        let p = Array(pattern.lowercased().prefix(32))
        guard !p.isEmpty else { return nil }
        let threshold = 0.6
        let distance = 100.0
        var best: Double?
        // Sellers' algorithm: the fewest edits to match the pattern ending at each text position.
        var previous = Array(0...p.count)
        for (j, ch) in t.enumerated() {
            var current = [0]
            for i in 1...p.count {
                let cost = p[i - 1] == ch ? 0 : 1
                current.append(min(previous[i] + 1, current[i - 1] + 1, previous[i - 1] + cost))
            }
            let errors = current[p.count]
            let start = max(0, j - p.count + 1)
            let score = Double(errors) / Double(p.count) + Double(start) / distance
            if errors < p.count, score <= threshold, best == nil || score < best! { best = score }
            previous = current
        }
        return best
    }

    /// Close matches by name, best first, as Fuse.js's search gives them.
    static func closeMatches<T>(_ items: [T], _ query: String, name: (T) -> String) -> [T] {
        let q = query.trimmingCharacters(in: .whitespaces)
        return items.enumerated()
            .compactMap { index, item in fuzzyScore(name(item), q).map { (item, $0, index) } }
            .sorted { $0.1 != $1.1 ? $0.1 < $1.1 : $0.2 < $1.2 }
            .map(\.0)
    }

    enum Results: Equatable {
        case browse(recipes: [LibraryRecipe])
        case matches(ingredients: [LibraryIngredient], recipes: [LibraryRecipe])
        case none(ingredients: [LibraryIngredient], recipes: [LibraryRecipe], browse: [LibraryRecipe])
    }

    /// The recipes Explore may show: only hearted ones while Saved is on.
    static func shown(_ library: Library, savedOnly: Bool, savedIds: Set<String>) -> [LibraryRecipe] {
        library.recipes.filter { !savedOnly || savedIds.contains($0.id) }
    }

    /// Blank: browse every recipe. Typed: ranked matches, or none plus close matches and browse.
    static func results(_ query: String, _ library: Library, savedOnly: Bool, savedIds: Set<String>) -> Results {
        let recipes = shown(library, savedOnly: savedOnly, savedIds: savedIds)
        let browse = recipes.sorted { $0.name.localizedCompare($1.name) == .orderedAscending }
        if normalise(query).isEmpty { return .browse(recipes: browse) }
        let ingredients = ranked(library.ingredients.filter { ingredientMatches($0, query) }, query, name: \.name)
        let hits = ranked(recipes.filter { matches($0, query, library) }, query, name: \.name)
        if !ingredients.isEmpty || !hits.isEmpty { return .matches(ingredients: ingredients, recipes: hits) }
        return .none(
            ingredients: closeMatches(library.ingredients, query, name: \.name),
            recipes: closeMatches(recipes, query, name: \.name),
            browse: browse
        )
    }
}
