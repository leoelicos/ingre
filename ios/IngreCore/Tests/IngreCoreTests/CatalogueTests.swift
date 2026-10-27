import XCTest
@testable import IngreCore

final class CatalogueTests: XCTestCase {
    private let garlic = CatalogIngredient(id: "garlic", name: "garlic", category: "fruit & veg", approxGrams: 60, measureGrams: ["clove": 6])
    private let onion = CatalogIngredient(id: "onion", name: "onion", category: "fruit & veg")

    func testParsesTheCatalogueShape() {
        let ingredients = parseIngredients(#"{"_note":"x","ingredients":[{"id":"garlic","name":"garlic","category":"fruit & veg","approxGrams":60,"measureGrams":{"clove":6}}]}"#)
        XCTAssertEqual(ingredients, [garlic])
        let recipes = parseRecipes(#"{"recipes":[{"id":"spaghetti-bolognese","name":"Spaghetti bolognese","portions":1,"ingredients":[{"ingredientId":"garlic","quantity":0.5,"measure":"clove"}],"method":["Simmer"]}]}"#)
        XCTAssertEqual(recipes.first?.id, "spaghetti-bolognese")
        XCTAssertEqual(recipes.first?.lines.first?.quantity, 0.5)
        XCTAssertEqual(recipes.first?.method, ["Simmer"])
        XCTAssertEqual(parseIngredients(""), [])
        XCTAssertEqual(parseRecipes("{}"), [])
    }

    func testWordingAndSearchMatchTheWeb() {
        XCTAssertEqual(normaliseTerm(" Tomatoes Chillies "), "tomato chilli")
        XCTAssertEqual(pluralise("egg"), "eggs")
        XCTAssertEqual(pluralise("eggs"), "eggs")
        XCTAssertEqual(pluralise("leaf"), "leaves")
        XCTAssertEqual(pluralise("bunch"), "bunches")
        XCTAssertEqual(pluralise("glass"), "glasses")
        XCTAssertEqual(singularise("tomatoes"), "tomato")
        XCTAssertEqual(singularise("hummus"), "hummus")
        XCTAssertEqual(tierOf("red onion", "on"), 1)
        XCTAssertEqual(tierOf("onion", "on"), 0)
        XCTAssertEqual(levenshtein("garlic", "garlick"), 1)
    }

    func testExploreRanksBrowseMatchesAndCloseNames() {
        let recipes = [
            CatalogRecipe(id: "spaghetti", name: "Spaghetti", portions: 1, lines: [CatalogLine(ingredientId: "garlic", quantity: 0.5, measure: "clove")]),
            CatalogRecipe(id: "dahl", name: "Dahl", portions: 1, lines: [CatalogLine(ingredientId: "onion", quantity: 1, measure: "whole")])
        ]
        guard case .browse(let browse) = explore(query: "", ingredients: [garlic, onion], recipes: recipes) else {
            return XCTFail("browse")
        }
        XCTAssertEqual(browse.map(\.name), ["Dahl", "Spaghetti"])
        guard case .matches(let foundIngredients, let foundRecipes) = explore(query: "gar", ingredients: [garlic, onion], recipes: recipes) else {
            return XCTFail("matches")
        }
        XCTAssertEqual(foundIngredients.map(\.id), ["garlic"])
        XCTAssertEqual(foundRecipes.map(\.id), ["spaghetti"])
        guard case .none(let closeIngredients, let closeRecipes, _) = explore(query: "zzzzqq", ingredients: [garlic], recipes: recipes) else {
            return XCTFail("none")
        }
        XCTAssertTrue(closeIngredients.isEmpty)
        XCTAssertTrue(closeRecipes.isEmpty)
        guard case .none(let garlicClose, _, _) = explore(query: "garlick", ingredients: [garlic], recipes: []) else {
            return XCTFail("close")
        }
        XCTAssertEqual(garlicClose.map(\.id), ["garlic"])
        guard case .browse(let saved) = explore(query: "", ingredients: [garlic], recipes: recipes, savedOnly: true, savedIds: ["dahl"]) else {
            return XCTFail("saved")
        }
        XCTAssertEqual(saved.map(\.id), ["dahl"])
    }

    func testTheListSumsCopiesAndScalesPortions() {
        let lines = shopLines(
            [
                StoredRecipe(id: "a", name: "A", lines: [Line(ingredientId: "onion", name: "onion", quantity: 0.25, measure: "whole"), Line(ingredientId: "salt", name: "salt", quantity: 0, measure: "g")]),
                StoredRecipe(id: "b", name: "B", lines: [Line(ingredientId: "onion", name: "onion", quantity: 0.75, measure: "whole"), Line(ingredientId: "onion", name: "onion", quantity: 10, measure: "g")])
            ],
            ["onion": "onion"],
            ["onion": "fruit & veg"]
        )
        XCTAssertEqual(lines.count, 2)
        XCTAssertEqual(lines.first { $0.measure == "whole" }?.quantity, 1)
        XCTAssertEqual(lines.first { $0.measure == "g" }?.quantity, 10)
        XCTAssertEqual(clampPortions(0.4), 1)
        XCTAssertEqual(clampPortions(12.6), 12)
        XCTAssertEqual(clampPortions(.nan), 2)
        let recipe = CatalogRecipe(id: "spaghetti", name: "Spaghetti", portions: 1, lines: [CatalogLine(ingredientId: "garlic", quantity: 0.5, measure: "clove")])
        let scaled = scaledLines(recipe, newCopy("spaghetti", 2), ["garlic": "garlic"])
        XCTAssertEqual(scaled.first?.quantity, 1)
        let edited = editCopy(pickRecipe(ListMemory(), toStored(recipe, ["garlic": "garlic"])), "spaghetti", [Line(ingredientId: "garlic", name: "garlic", quantity: 2, measure: "clove")])
        XCTAssertEqual(exploreRecipe(edited, "spaghetti")?.lines.first?.quantity, 0.5)
    }
}
