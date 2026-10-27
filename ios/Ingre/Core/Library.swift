import Foundation

/// Shop sections (#195, mirrors client/src/utils/shopping/sections.ts), in shop order.
enum ShopSection: String, CaseIterable, Codable, Sendable {
    case fruitVeg = "Fruit & Veg"
    case meatSeafood = "Meat & Seafood"
    case dairy = "Dairy, Eggs & Fridge"
    case deli = "Deli"
    case bakery = "Bakery"
    case pantry = "Pantry"
    case frozen = "Frozen"
    case other = "Other"

    /// The short category name a chip and its heading show ("Dairy", not the full name).
    var label: String {
        switch self {
        case .fruitVeg: L10n.t("section.fruitVeg")
        case .meatSeafood: L10n.t("section.meatSeafood")
        case .dairy: L10n.t("section.dairy")
        case .deli: L10n.t("section.deli")
        case .bakery: L10n.t("section.bakery")
        case .pantry: L10n.t("section.pantry")
        case .frozen: L10n.t("section.frozen")
        case .other: L10n.t("section.other")
        }
    }

    /// The section a catalogue aisle sits in; unknown aisles are Other.
    static func forAisle(_ aisle: String) -> ShopSection {
        switch aisle {
        case "fruit & veg": .fruitVeg
        case "meat", "seafood": .meatSeafood
        case "dairy & eggs": .dairy
        case "deli": .deli
        case "bakery": .bakery
        case "baking", "canned food", "herbs & spices", "international", "oils & vinegar",
             "pasta & rice", "sauces", "breakfast & spreads", "tea & coffee": .pantry
        default: .other
        }
    }
}

/// The colour family a section's chips use (ingredients.json `sectionColours`).
enum SectionTone: String, Codable, Sendable {
    case produce, meat, dairy, deli, bakery, pantry, frozen, neutral
}

enum BaseUnit: String, Codable, Sendable {
    case g, ml, count
}

struct Amount: Codable, Equatable, Sendable {
    var amount: Double
    var unit: BaseUnit
}

struct SoldOption: Codable, Equatable, Sendable {
    var type: String
    var size: Amount?
}

struct CountUnit: Codable, Equatable, Sendable {
    var one: String
    var other: String
}

/// One catalogue item (client/src/data/ingredients.json).
struct LibraryIngredient: Codable, Equatable, Identifiable, Sendable {
    var id: String
    var name: String
    var category: String
    var staple: Bool?
    var sold: [SoldOption]
    var approxGrams: Double?
    var measureGrams: [String: Double]?
    var allergens: [String]
    var countUnit: CountUnit?
    var partMeasure: String?

    var section: ShopSection { ShopSection.forAisle(category) }
}

struct LibraryRecipeIngredient: Codable, Equatable, Sendable {
    var ingredientId: String
    var quantity: Double
    var measure: String
}

/// One library recipe (client/src/data/recipes.json).
struct LibraryRecipe: Codable, Equatable, Identifiable, Sendable {
    var id: String
    var name: String
    var portions: Int
    var ingredients: [LibraryRecipeIngredient]
    var method: [String]

    /// "Shaking beef (bò lúc lắc)" -> "Shaking beef": the row title without a local name.
    var title: String {
        guard let open = name.lastIndex(of: "("), name.hasSuffix(")") else {
            return name.trimmingCharacters(in: .whitespaces)
        }
        let head = name[..<open].trimmingCharacters(in: .whitespaces)
        return head.isEmpty ? name : head
    }
}

/// The bundled library: the same JSON the web client uses, copied in at build time (#195).
struct Library: Sendable {
    var ingredients: [LibraryIngredient]
    var recipes: [LibraryRecipe]
    var sectionTones: [ShopSection: SectionTone]

    func item(_ id: String) -> LibraryIngredient? {
        ingredients.first { $0.id == id }
    }

    func recipe(_ id: String) -> LibraryRecipe? {
        recipes.first { $0.id == id }
    }

    func tone(_ section: ShopSection) -> SectionTone {
        sectionTones[section] ?? .neutral
    }

    enum LoadError: Error, Equatable {
        case missing(String)
    }

    private struct IngredientFile: Decodable {
        var sectionColours: [String: SectionTone]
        var ingredients: [LibraryIngredient]
    }

    private struct RecipeFile: Decodable {
        var recipes: [LibraryRecipe]
    }

    /// Parses the two files; a typo in the data fails loudly, as on the web.
    static func parse(ingredients: Data, recipes: Data) throws -> Library {
        let decoder = JSONDecoder()
        let items = try decoder.decode(IngredientFile.self, from: ingredients)
        let dishes = try decoder.decode(RecipeFile.self, from: recipes)
        var tones: [ShopSection: SectionTone] = [:]
        for (key, tone) in items.sectionColours {
            if let section = ShopSection(rawValue: key) { tones[section] = tone }
        }
        return Library(ingredients: items.ingredients, recipes: dishes.recipes, sectionTones: tones)
    }

    /// Loads recipes.json and ingredients.json from the bundle (put there by the build phase).
    static func load(from bundle: Bundle = .main) throws -> Library {
        guard let ingredientsURL = bundle.url(forResource: "ingredients", withExtension: "json") else {
            throw LoadError.missing("ingredients.json")
        }
        guard let recipesURL = bundle.url(forResource: "recipes", withExtension: "json") else {
            throw LoadError.missing("recipes.json")
        }
        return try parse(ingredients: Data(contentsOf: ingredientsURL), recipes: Data(contentsOf: recipesURL))
    }
}

/// "brown onion" -> "Brown onion", for a name that starts a sentence.
func capitaliseFirst(_ text: String) -> String {
    guard let first = text.first else { return text }
    return first.uppercased() + text.dropFirst()
}
