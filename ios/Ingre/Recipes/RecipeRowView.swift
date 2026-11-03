import SwiftUI

/// One recipe row (#179, #191), shared by Recipes and Explore. A tap on the title picks or
/// unpicks it (VoiceOver reads "selected"); the chevron opens it inline.
///
/// Closed, the row shows its name and EVERY ingredient it uses as a plain name-only chip: no
/// checkbox, no quantity, no chevron, not focusable on its own. Never a three-ingredient
/// preview, never three-letter badges. Open, the details (editable chips in Recipes, the
/// original in Explore) replace the names.
struct RecipeRowView<Details: View>: View {
    let recipe: LibraryRecipe
    /// "recipes" or "explore", for identifiers.
    let scope: String
    let lines: [CopyLine]
    let picked: Bool
    let open: Bool
    /// Explore's rows say "See recipe"; Recipes' rows show the chevron only.
    let seeRecipe: Bool
    /// Recessed into the raised Recipes section; raised in Explore, pressed in once picked.
    let recessed: Bool
    let tone: (LibraryIngredient?) -> SectionTone
    let onPick: () -> Void
    let onOpen: () -> Void
    @ViewBuilder let details: () -> Details

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 4) {
                Button(action: onPick) {
                    HStack(alignment: .top, spacing: 12) {
                        CheckMark(picked: picked)
                        Text(recipe.title)
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(Theme.text)
                            .multilineTextAlignment(.leading)
                        Spacer(minLength: 0)
                    }
                    .padding(16)
                    .frame(minHeight: Theme.minTarget)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(recipe.title)
                .accessibilityValue(L10n.t(picked ? "row.picked" : "row.notPicked"))
                .accessibilityAddTraits(picked ? [.isSelected] : [])
                .accessibilityIdentifier("\(scope).pick.\(recipe.id)")

                Button(action: onOpen) {
                    HStack(spacing: 4) {
                        if seeRecipe { Text(L10n.t("row.seeRecipe")).font(.subheadline.weight(.semibold)) }
                        Chevron(open: open)
                    }
                    .foregroundStyle(Theme.text)
                    .padding(16)
                    .touchTarget()
                }
                .buttonStyle(.plain)
                .accessibilityLabel(L10n.t(seeRecipe ? "row.seeRecipeLabel" : "row.details", ["title": recipe.title]))
                .accessibilityValue(L10n.t(open ? "header.expanded" : "header.collapsed"))
                .accessibilityIdentifier("\(scope).open.\(recipe.id)")
            }
            if open {
                Rectangle().fill(Theme.border).frame(height: 1).accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 16) { details() }
                    .padding(16)
                    .accessibilityElement(children: .contain)
                    .accessibilityIdentifier("\(scope).details.\(recipe.id)")
            } else {
                IngredientNames(lines: lines, title: recipe.title, tone: tone)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
                    .accessibilityIdentifier("\(scope).names.\(recipe.id)")
            }
        }
        .background {
            let shape = RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous)
            Color.clear
                .surface(recessed || picked ? .recessed : .raised, outline: picked ? Theme.primary : Theme.border)
                .overlay(shape.strokeBorder(picked ? Theme.primary : .clear, lineWidth: 2))
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("\(scope).row.\(recipe.id)")
    }
}

/// A closed row's ingredients (#191): all of them, as plain name-only chips that do nothing.
/// Flat outlines in the section's ink, so they never read as the raised editable chips.
struct IngredientNames: View {
    let lines: [CopyLine]
    let title: String
    let tone: (LibraryIngredient?) -> SectionTone

    var body: some View {
        FlowLayout(spacing: 6) {
            ForEach(lines, id: \.ingredientId) { line in
                Text(line.displayName)
                    .font(.footnote)
                    .foregroundStyle(Theme.ink(tone(line.item)))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .overlay(Capsule().strokeBorder(Theme.ink(tone(line.item)), lineWidth: 1))
                    .accessibilityIdentifier("name-chip")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(L10n.t("row.ingredientsIn", ["title": title]))
    }
}

/// Method and Notes under an open row.
struct MethodAndNotes: View {
    let recipe: LibraryRecipe
    let notes: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            GroupHeading(text: L10n.t("row.method"))
            ForEach(Array(recipe.method.enumerated()), id: \.offset) { index, step in
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text("\(index + 1).").monospacedDigit()
                    Text(step)
                }
                .foregroundStyle(Theme.text)
                .accessibilityElement(children: .combine)
            }
        }
        if !notes.isEmpty {
            VStack(alignment: .leading, spacing: 6) {
                GroupHeading(text: L10n.t("row.notes"))
                ForEach(notes, id: \.self) { Text($0).font(.subheadline).foregroundStyle(Theme.text) }
            }
        }
    }
}

/// The heart (signed in only): saves the recipe with the user's changes, or unsaves it.
struct SaveButton: View {
    let recipe: LibraryRecipe
    let saved: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(L10n.t(saved ? "saved.saved" : "saved.save"), systemImage: saved ? "heart.fill" : "heart")
                .foregroundStyle(Theme.text)
        }
        .buttonStyle(InkButtonStyle())
        .accessibilityLabel(L10n.t(saved ? "saved.unsaveRecipe" : "saved.saveRecipe", ["name": recipe.title]))
        .accessibilityIdentifier("save.\(recipe.id)")
    }
}
