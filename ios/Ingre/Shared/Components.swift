import SwiftUI

/// A section's header row: the title, a summary, and the chevron that collapses it (#179).
/// One button, so VoiceOver reads "Recipes, 2 recipes picked, expanded".
struct HeaderRow: View {
    let title: String
    var summary: String = ""
    let open: Bool
    let identifier: String
    let toggle: () -> Void

    var body: some View {
        Button(action: toggle) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.title2.weight(.bold))
                        .foregroundStyle(Theme.text)
                    if !summary.isEmpty {
                        Text(summary)
                            .font(.subheadline)
                            .foregroundStyle(Theme.secondary)
                    }
                }
                Spacer(minLength: 8)
                Chevron(open: open)
            }
            .touchTarget()
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(summary.isEmpty ? title : "\(title), \(summary)")
        .accessibilityValue(L10n.t(open ? "header.expanded" : "header.collapsed"))
        .accessibilityAddTraits(.isHeader)
        .accessibilityIdentifier(identifier)
    }
}

struct Chevron: View {
    let open: Bool
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Image(systemName: "chevron.down")
            .font(.body.weight(.semibold))
            .foregroundStyle(Theme.text)
            .rotationEffect(.degrees(open ? 180 : 0))
            .animation(reduceMotion ? nil : .easeInOut(duration: 0.2), value: open)
            .accessibilityHidden(true)
    }
}

/// The tick in a ring: a primary ring and tick once picked, an empty ring before. No fill.
struct CheckMark: View {
    let picked: Bool
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = 28

    var body: some View {
        ZStack {
            Circle().strokeBorder(picked ? Theme.primary : Theme.secondary, lineWidth: 2)
            if picked {
                Image(systemName: "checkmark")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(Theme.primary)
            }
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }
}

/// A heading inside a section ("Fruit & Veg", "Method").
struct GroupHeading: View {
    let text: String

    var body: some View {
        Text(text.uppercased())
            .font(.footnote.weight(.semibold))
            .tracking(0.5)
            .foregroundStyle(Theme.secondary)
            .accessibilityLabel(text)
            .accessibilityAddTraits(.isHeader)
    }
}

/// Allergen tags in the allergen colour, outlined.
struct AllergenTags: View {
    let allergens: [String]

    var body: some View {
        if !allergens.isEmpty {
            FlowLayout(spacing: 4) {
                ForEach(allergens, id: \.self) { allergen in
                    Text(allergen)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.text)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 1))
                }
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel(L10n.t("allergens.label", or: "Allergens"))
            .accessibilityValue(allergens.joined(separator: ", "))
        }
    }
}

/// A status line VoiceOver announces when it changes.
struct StatusText: View {
    let text: String
    var identifier = "status"

    var body: some View {
        if !text.isEmpty {
            Text(text)
                .font(.callout)
                .foregroundStyle(Theme.text)
                .accessibilityIdentifier(identifier)
                .onAppear { UIAccessibility.post(notification: .announcement, argument: text) }
                .onChange(of: text) { _, next in UIAccessibility.post(notification: .announcement, argument: next) }
        }
    }
}
