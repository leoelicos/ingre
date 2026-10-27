import SwiftUI

/// How a set of chips behaves (#182): Ingredients, Extra, or a recipe row ("row-<id>").
struct ChipScope {
    let id: String
    /// The amount under the name.
    let amount: (Chip) -> String

    static let ingredients = ChipScope(id: "chip", amount: Chips.amount)
    static let extra = ChipScope(id: "extra", amount: Chips.extraAmount)
    static func row(_ recipeId: String) -> ChipScope {
        ChipScope(id: "row-\(recipeId)", amount: Chips.rowAmount)
    }
}

/// An editable chip (#179, #181): a raised pill with an outline in its section's ink. A tap
/// anywhere crosses it off (strike-through, pressed in; never faded); the chevron opens its
/// panel. Removed from every recipe it is flat, dashed and can't be crossed off.
struct EditableChip: View {
    let chip: Chip
    let scope: ChipScope
    let tone: SectionTone
    let panelOpen: Bool
    let onToggle: () -> Void
    let onChevron: () -> Void
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        let ink = chip.greyed ? Theme.secondary : Theme.ink(tone)
        let amount = scope.amount(chip)
        HStack(spacing: 2) {
            Button(action: onToggle) {
                HStack(spacing: 8) {
                    ChipCheckbox(crossed: chip.crossed, ink: ink)
                    VStack(alignment: .leading, spacing: 0) {
                        Text(chip.displayName).font(.subheadline.weight(.semibold))
                        Text(amount).font(.caption)
                    }
                    .strikethrough(chip.crossed, color: ink)
                    .multilineTextAlignment(.leading)
                }
                .foregroundStyle(ink)
                .padding(.leading, 12)
                .frame(minHeight: Theme.minTarget)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .disabled(chip.greyed)
            .accessibilityLabel(Chips.accessibilityLabel(chip, amount: amount))
            .accessibilityAddTraits(chip.crossed ? .isSelected : [])
            .accessibilityIdentifier("\(scope.id).chip.\(chip.id)")

            Button(action: onChevron) {
                Chevron(open: panelOpen).touchTarget()
            }
            .buttonStyle(.plain)
            .accessibilityLabel(L10n.t("chip.details", ["name": chip.displayName]))
            .accessibilityValue(L10n.t(panelOpen ? "header.expanded" : "header.collapsed"))
            .accessibilityIdentifier("\(scope.id).chevron.\(chip.id)")
        }
        .padding(.trailing, 4)
        .background {
            if chip.greyed {
                Capsule().strokeBorder(Theme.secondary, style: StrokeStyle(lineWidth: 2, dash: [5, 4]))
            } else {
                Color.clear.chipSurface(chip.crossed ? .pressedChip : .chip, outline: ink)
            }
        }
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.15), value: chip.crossed)
    }
}

/// The checkbox inside a chip: flat, in the chip's ink, ticked once crossed off.
struct ChipCheckbox: View {
    let crossed: Bool
    let ink: Color
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = 20

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 5).strokeBorder(ink, lineWidth: 2)
            if crossed {
                Image(systemName: "checkmark").font(.caption2.weight(.bold)).foregroundStyle(ink)
            }
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }
}

/// Chips by section, with each open chip's panel inline under its group (never a sheet).
struct ChipGroupsView<Panel: View>: View {
    let groups: [ChipGroup]
    let scope: ChipScope
    @Bindable var list: ShoppingListViewModel
    var showHeadings = true
    @ViewBuilder let panel: (Chip) -> Panel
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            ForEach(groups, id: \.section) { group in
                VStack(alignment: .leading, spacing: 8) {
                    if showHeadings { GroupHeading(text: group.section.label) }
                    FlowLayout(spacing: 10) {
                        ForEach(group.chips) { chip in
                            EditableChip(
                                chip: chip, scope: scope, tone: list.library.tone(chip.section),
                                panelOpen: list.openPanels[scope.id] == chip.id,
                                onToggle: { list.toggleCrossed(chip.id) },
                                onChevron: {
                                    MotionAware(reduceMotion: reduceMotion).run {
                                        list.togglePanel(scope: scope.id, chipId: chip.id)
                                    }
                                }
                            )
                        }
                    }
                    .padding(4)
                    if let open = group.chips.first(where: { list.openPanels[scope.id] == $0.id }) {
                        panel(open)
                    }
                }
            }
        }
    }
}

/// A chip's panel (#182): a number box per source (recipe or Extra), each with its remove
/// question, then the total, allergens and the category.
struct ChipPanel: View {
    let chip: Chip
    let scope: ChipScope
    @Bindable var list: ShoppingListViewModel
    /// In a recipe row, only that recipe's line is editable.
    var onlyRecipe: String?
    @State private var asking: String?

    var sources: [ChipSource] {
        guard let onlyRecipe else { return chip.sources }
        return chip.sources.filter { source in
            if case let .recipe(recipeId, _, _, _, _, _) = source { return recipeId == onlyRecipe }
            return false
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(sources, id: \.key) { source in
                SourceField(chip: chip, source: source, scope: scope, list: list, asking: $asking)
            }
            Text(L10n.t("chip.total", ["amount": Chips.amount(chip)]))
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.text)
            AllergenTags(allergens: chip.item?.allergens ?? [])
            Picker(
                L10n.t("chip.category"),
                selection: Binding(
                    get: { chip.section },
                    set: { list.setCategory(chip.id, $0) }
                )
            ) {
                ForEach(ShopSection.allCases, id: \.self) { Text($0.label).tag($0) }
            }
            .pickerStyle(.menu)
            .frame(minHeight: Theme.minTarget)
            .accessibilityIdentifier("\(scope.id).category.\(chip.id)")
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .surface(.recessed, outline: Theme.ink(list.library.tone(chip.section)))
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("\(scope.id).panel.\(chip.id)")
    }
}

/// One source's number box: whole numbers for Extra, the recipe's own unit for a recipe.
private struct SourceField: View {
    let chip: Chip
    let source: ChipSource
    let scope: ChipScope
    @Bindable var list: ShoppingListViewModel
    @Binding var asking: String?
    @State private var text = ""
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(source.label).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.text)
            HStack(spacing: 8) {
                TextField("", text: $text)
                    .keyboardType(source.isRecipe ? .decimalPad : .numberPad)
                    .focused($focused)
                    .padding(.horizontal, 10)
                    .frame(minWidth: 72, maxWidth: 120, minHeight: Theme.minTarget)
                    .surface(.recessed, radius: Theme.controlRadius)
                    .accessibilityLabel(Chips.sourceAccessibilityLabel(source, chip))
                    .accessibilityIdentifier("\(scope.id).source.\(chip.id).\(source.key)")
                    .onSubmit(commit)
                    .onChange(of: focused) { _, now in if !now { commit() } }
                Text(Chips.sourceUnit(source, chip)).foregroundStyle(Theme.text)
                Spacer()
                Button(L10n.t("chip.remove")) { asking = source.key }
                    .buttonStyle(InkButtonStyle())
                    .accessibilityLabel(
                        L10n.t("chip.removeQuestion", ["name": chip.displayName, "source": source.label]))
            }
            if asking == source.key {
                HStack(spacing: 8) {
                    Text(L10n.t("chip.removeQuestion", ["name": chip.displayName, "source": source.label]))
                        .foregroundStyle(Theme.text)
                    Button(L10n.t("chip.yes")) {
                        asking = nil
                        list.removeSource(source, chipId: chip.id)
                    }
                    .buttonStyle(InkButtonStyle())
                    .accessibilityIdentifier("\(scope.id).yes.\(chip.id)")
                    Button(L10n.t("chip.no")) { asking = nil }
                        .buttonStyle(InkButtonStyle())
                }
            }
        }
        .onAppear { text = Units.formatNumber(source.quantity) }
        .onChange(of: source.quantity) { _, next in if !focused { text = Units.formatNumber(next) } }
    }

    private func commit() {
        let value = Double(text.replacingOccurrences(of: ",", with: ".")) ?? source.quantity
        guard value != source.quantity else { return }
        if value <= 0 {
            asking = source.key
            text = Units.formatNumber(source.quantity)
        } else {
            list.setSource(source, chipId: chip.id, value: value)
        }
    }
}

/// The plus area (#181): the catalogue in category tabs, inline under its section.
struct PlusArea: View {
    let title: String
    let identifier: String
    @Bindable var list: ShoppingListViewModel
    let mark: (LibraryIngredient) -> String?
    let onPick: (LibraryIngredient) -> Void
    let onClose: () -> Void
    @State private var tab: ShopSection = .fruitVeg

    var body: some View {
        let tabs = list.plusTabs
        let items = tabs.first { $0.section == tab }?.items ?? tabs.first?.items ?? []
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(title).font(.headline).foregroundStyle(Theme.text)
                Spacer()
                Button(action: onClose) { Image(systemName: "xmark").touchTarget() }
                    .buttonStyle(.plain)
                    .foregroundStyle(Theme.text)
                    .accessibilityLabel(L10n.t("plus.close"))
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(tabs, id: \.section) { entry in
                        let ink = Theme.ink(list.library.tone(entry.section))
                        Button(entry.section.label) { tab = entry.section }
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(ink)
                            .padding(.horizontal, 12)
                            .frame(minHeight: Theme.minTarget)
                            .chipSurface(tab == entry.section ? .pressedChip : .chip, outline: ink)
                            .buttonStyle(.plain)
                            .accessibilityAddTraits(tab == entry.section ? .isSelected : [])
                    }
                }
                .padding(6)
            }
            FlowLayout(spacing: 8) {
                ForEach(items) { item in
                    let marked = mark(item)
                    Button {
                        onPick(item)
                    } label: {
                        Text((marked == nil ? "" : "✓ ") + capitaliseFirst(item.name))
                            .font(.subheadline)
                            .foregroundStyle(Theme.text)
                            .padding(.horizontal, 12)
                            .frame(minHeight: Theme.minTarget)
                            .chipSurface(.chip, outline: Theme.border)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(
                        marked.map { L10n.t("plus.marked", ["name": capitaliseFirst(item.name), "mark": $0]) }
                            ?? capitaliseFirst(item.name)
                    )
                    .accessibilityIdentifier("plus.item.\(item.id)")
                }
            }
            .padding(4)
        }
        .padding(12)
        .surface(.recessed)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier(identifier)
    }
}
