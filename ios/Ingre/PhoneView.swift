import SwiftUI
import IngreCore

private let catalogueIngredients: [CatalogIngredient] = parseIngredients(bundled("ingredients"))
private let catalogueRecipes: [CatalogRecipe] = parseRecipes(bundled("recipes"))
private let catalogueNames = Dictionary(uniqueKeysWithValues: catalogueIngredients.map { ($0.id, $0.name) })
private let catalogueCategories = Dictionary(uniqueKeysWithValues: catalogueIngredients.map { ($0.id, $0.category) })

private func bundled(_ name: String) -> String {
    guard let url = Bundle.main.url(forResource: name, withExtension: "json"),
          let text = try? String(contentsOf: url, encoding: .utf8) else { return "" }
    return text
}

/// The phone page. Explore, Ingredients, Recipes, then Extra. No sheets.
struct PhoneView: View {
    @State private var query = ""
    @State private var memory = ListMemory()
    @State private var open = true
    @State private var opened: Set<String> = []
    @State private var extra = ""
    @State private var extras: [String] = []

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Explore").font(.title2).accessibilityAddTraits(.isHeader)
                    Spacer()
                    Button(open ? "Hide Explore" : "Show Explore") { open.toggle() }
                        .frame(minHeight: 44)
                }
                if open {
                    TextField("Search ingredients and recipes", text: $query)
                        .accessibilityLabel("Search ingredients and recipes")
                        .frame(minHeight: 44)
                    exploreBody
                }
                Text("Ingredients").font(.title2).accessibilityAddTraits(.isHeader)
                ForEach(shopLines(recipeCopies(memory), catalogueNames, catalogueCategories), id: \.key) { line in
                    Text("\(capitaliseFirst(line.name)) \(formatQuantity(line.quantity, line.measure))")
                        .frame(minHeight: 44, alignment: .leading)
                }
                Text("Recipes").font(.title2).accessibilityAddTraits(.isHeader)
                ForEach(recipeCopies(memory), id: \.id) { recipe in
                    Button(recipe.name) {
                        if opened.contains(recipe.id) { opened.remove(recipe.id) } else { opened.insert(recipe.id) }
                    }
                    .frame(minHeight: 44)
                    if opened.contains(recipe.id) {
                        HStack {
                            Text("Portions")
                            Button("Fewer portions") {
                                memory = setPortions(memory, recipe.id, recipe.portions - 1)
                            }
                            .disabled(recipe.portions <= 1)
                            .frame(minHeight: 44)
                            Text("\(recipe.portions)")
                            Button("More portions") {
                                memory = setPortions(memory, recipe.id, recipe.portions + 1)
                            }
                            .disabled(recipe.portions >= 12)
                            .frame(minHeight: 44)
                        }
                        ForEach(recipe.lines.filter { $0.quantity > 0 }, id: \.ingredientId) { line in
                            Text("\(capitaliseFirst(line.name)) \(formatQuantity(line.quantity, line.measure))")
                        }
                    } else {
                        HStack {
                            ForEach(closedChips(recipe.lines.filter { $0.quantity > 0 }.map(\.name)), id: \.name) { chip in
                                Text(chip.name).frame(minHeight: 44)
                            }
                        }
                    }
                }
                Text("Extra").font(.title2).accessibilityAddTraits(.isHeader)
                TextField("Add an extra", text: $extra).frame(minHeight: 44)
                Button("Add") {
                    let name = extra.trimmingCharacters(in: .whitespacesAndNewlines)
                    if !name.isEmpty {
                        extras.append(name)
                        extra = ""
                    }
                }
                .frame(minHeight: 44)
                ForEach(extras, id: \.self) { Text($0).frame(minHeight: 44) }
            }
            .padding(16)
        }
        .onAppear { open = exploreStartsOpen(pickedCount: memory.copies.count, savedRequested: false) }
    }

    @ViewBuilder private var exploreBody: some View {
        switch explore(query: query, ingredients: catalogueIngredients, recipes: catalogueRecipes) {
        case .browse(let recipes):
            recipeButtons(recipes)
        case .matches(let ingredients, let recipes):
            ForEach(ingredients, id: \.id) { Text(capitaliseFirst($0.name)).frame(minHeight: 44) }
            recipeButtons(recipes)
        case .none(let ingredients, let recipes, _):
            Text("No matches")
            ForEach(ingredients, id: \.id) { Text(capitaliseFirst($0.name)).frame(minHeight: 44) }
            recipeButtons(recipes)
        }
    }

    private func recipeButtons(_ recipes: [CatalogRecipe]) -> some View {
        ForEach(recipes, id: \.id) { recipe in
            Button(recipe.name) { memory = pickCatalogue(memory, recipe, catalogueNames) }
                .frame(minHeight: 44)
        }
    }
}

@main
struct IngreApp: App {
    var body: some Scene {
        WindowGroup { PhoneView() }
    }
}
