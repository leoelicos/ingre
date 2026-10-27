import Foundation
import Testing
@testable import Ingre

@MainActor
@Suite struct DataLoadingTests {
    init() { TestSupport.useCatalog() }

    @Test func parsesTheWebClientsLibrary() throws {
        let library = try TestSupport.library()
        #expect(library.recipes.count >= 10)
        #expect(library.ingredients.count >= 50)
        #expect(library.tone(.fruitVeg) == .produce)
        #expect(library.tone(.other) == .neutral)
        // every recipe ingredient is in the catalogue
        for recipe in library.recipes {
            for ingredient in recipe.ingredients {
                #expect(library.item(ingredient.ingredientId) != nil, "\(recipe.id): \(ingredient.ingredientId)")
            }
        }
    }

    @Test func aislesMapToShopSections() {
        #expect(ShopSection.forAisle("fruit & veg") == .fruitVeg)
        #expect(ShopSection.forAisle("seafood") == .meatSeafood)
        #expect(ShopSection.forAisle("dairy & eggs") == .dairy)
        #expect(ShopSection.forAisle("sauces") == .pantry)
        #expect(ShopSection.dairy.label == "Dairy")
    }

    @Test func titlesDropTheLocalName() {
        let recipe = LibraryRecipe(id: "x", name: "Shaking beef (bò lúc lắc)", portions: 1, ingredients: [], method: [])
        #expect(recipe.title == "Shaking beef")
    }

    @Test func badDataFailsLoudly() {
        #expect(throws: (any Error).self) {
            try Library.parse(ingredients: Data("{}".utf8), recipes: Data("{}".utf8))
        }
    }

    #if os(iOS)
    /// The build phase copied the JSON into the app bundle (scripts/copy-native-data.sh).
    @Test func theAppBundleHasTheData() throws {
        let library = try Library.load(from: .main)
        #expect(!library.recipes.isEmpty)
    }
    #endif
}

@MainActor
@Suite struct StorageTests {
    @Test func usesTheWebKeysAndShapes() throws {
        let store = MemoryStore()
        let storage = ListStorage(store: store)
        var state = ListState()
        state.copies = [RecipeCopy(recipeId: "pad-thai", portions: 4, amounts: ["egg": 0])]
        state.extras = [Extra(id: "milk", name: "milk", ingredientId: "milk", quantity: 2)]
        state.crossed = ["egg"]
        state.edits = ["milk": ChipEdit(section: .other)]
        storage.save(state)
        let copies = try #require(store.read(.copies)).utf8String
        #expect(copies == #"[{"amounts":{"egg":0},"portions":4,"recipeId":"pad-thai"}]"#)
        let extras = try #require(store.read(.extras)).utf8String
        #expect(extras == #"[{"id":"milk","ingredientId":"milk","name":"milk","quantity":2}]"#)
        #expect(try #require(store.read(.crossed)).utf8String == #"["egg"]"#)
        #expect(try #require(store.read(.edits)).utf8String == #"{"milk":{"section":"Other"}}"#)
        #expect(storage.load() == state)
        #expect(StorageKey.copies.rawValue == "ingre.list.copies")
        #expect(StorageKey.crossed.rawValue == "ingre.chips.crossed")
    }

    @Test func dropsMalformedEntries() {
        let store = MemoryStore([
            .copies: Data(#"[{"recipeId":"a","portions":40,"amounts":{"x":-1,"y":2}},{"recipeId":"a","portions":2},{"nope":1}]"#.utf8),
            .extras: Data(#"[{"id":"t","name":"tea","ingredientId":null,"quantity":1.5},{"id":"u","name":"u","ingredientId":null,"quantity":1}]"#.utf8),
            .edits: Data(#"{"a":{"section":"Nowhere"},"b":{"section":"Deli"}}"#.utf8),
            .crossed: Data("not json".utf8),
        ])
        let state = ListStorage(store: store).load()
        #expect(state.copies == [RecipeCopy(recipeId: "a", portions: 12, amounts: ["y": 2])])
        #expect(state.extras == [Extra(id: "u", name: "u", ingredientId: nil, quantity: 1)])
        #expect(state.edits == ["b": ChipEdit(section: .deli)])
        #expect(state.crossed.isEmpty)
    }

    @Test func filesLiveInApplicationSupportByKey() throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let store = FileStore(directory: dir)
        store.write(.copies, Data("[]".utf8))
        #expect(FileManager.default.fileExists(atPath: dir.appendingPathComponent("ingre.list.copies.json").path))
        #expect(store.read(.copies) == Data("[]".utf8))
    }
}

extension Data {
    var utf8String: String { String(decoding: self, as: UTF8.self) }
}
