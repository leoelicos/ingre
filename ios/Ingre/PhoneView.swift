import SwiftUI
import IngreCore

/// The phone page. Explore, Ingredients, Recipes, then Extra. No sheets.
struct PhoneView: View {
    @State private var picked = 0
    @State private var savedRequested = false
    @State private var open = true

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Text("Explore").font(.title2).accessibilityAddTraits(.isHeader)
                    Spacer()
                    Button(open ? "Hide Explore" : "Show Explore") { open.toggle() }
                        .frame(minHeight: 44)
                }
                if open {
                    Text("Search ingredients and recipes")
                        .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                        .accessibilityLabel("Search ingredients and recipes")
                }
                Text("Ingredients").font(.title2).accessibilityAddTraits(.isHeader)
                Text("Recipes").font(.title2).accessibilityAddTraits(.isHeader)
                Text("Red lentil dahl").font(.headline)
                HStack {
                    ForEach(closedChips(["onion", "garlic"]), id: \.name) { chip in
                        Text(chip.name)
                            .frame(minHeight: 44)
                    }
                }
                Text("Extra").font(.title2).accessibilityAddTraits(.isHeader)
            }
            .padding(16)
        }
        .onAppear { open = exploreStartsOpen(pickedCount: picked, savedRequested: savedRequested) }
    }
}

@main
struct IngreApp: App {
    var body: some Scene {
        WindowGroup { PhoneView() }
    }
}
