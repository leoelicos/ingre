import SwiftUI

/// Ingredients (#179, #182): every chip on the list by shop section, Refresh with its
/// question inline (no alert), and each chip's panel under its group.
struct IngredientsSection: View {
    @Bindable var list: ShoppingListViewModel
    @State private var open = true
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HeaderRow(
                title: L10n.t("ingredients.title"), summary: list.summary, open: open,
                identifier: "ingredients.header"
            ) {
                MotionAware(reduceMotion: reduceMotion).run { open.toggle() }
            }
            if open {
                if list.chips.isEmpty {
                    Text(L10n.t("ingredients.empty")).foregroundStyle(Theme.secondary)
                } else {
                    refresh
                    ChipGroupsView(groups: list.groups, scope: .ingredients, list: list) { chip in
                        ChipPanel(chip: chip, scope: .ingredients, list: list)
                    }
                }
                StatusText(text: list.message, identifier: "ingredients.status")
            }
        }
        .padding(16)
        .surface(.section)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("ingredients.section")
    }

    @ViewBuilder private var refresh: some View {
        if list.askingRefresh {
            VStack(alignment: .leading, spacing: 8) {
                Text(L10n.t("ingredients.refreshQuestion")).foregroundStyle(Theme.text)
                HStack {
                    Button(L10n.t("chip.yes")) { list.refresh() }
                        .buttonStyle(InkButtonStyle())
                        .accessibilityIdentifier("ingredients.refresh.yes")
                    Button(L10n.t("chip.no")) { list.askingRefresh = false }
                        .buttonStyle(InkButtonStyle())
                }
            }
        } else if !list.entries.isEmpty {
            Button(L10n.t("ingredients.refresh")) { list.askingRefresh = true }
                .buttonStyle(InkButtonStyle())
                .accessibilityIdentifier("ingredients.refresh")
        }
    }
}

/// Extra (#181): staples and anything else, added from the plus area's category tabs.
struct ExtraSection: View {
    @Bindable var list: ShoppingListViewModel
    @State private var open = true
    @State private var adding = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HeaderRow(
                title: L10n.t("extra.title"), summary: Units.formatItemCount(list.extraChips.count),
                open: open, identifier: "extra.header"
            ) {
                MotionAware(reduceMotion: reduceMotion).run { open.toggle() }
            }
            if open {
                if list.extraChips.isEmpty {
                    Text(L10n.t("extra.empty")).foregroundStyle(Theme.secondary)
                } else {
                    ChipGroupsView(groups: list.extraGroups, scope: .extra, list: list) { chip in
                        ChipPanel(chip: chip, scope: .extra, list: list, onlyRecipe: nil)
                    }
                }
                if adding {
                    PlusArea(
                        title: L10n.t("plus.add"), identifier: "extra.plus", list: list,
                        mark: { list.hasChip($0.id) ? L10n.t("plus.onList") : nil },
                        onPick: { list.pick($0) },
                        onClose: { adding = false }
                    )
                } else {
                    Button {
                        adding = true
                    } label: {
                        Label(L10n.t("plus.add"), systemImage: "plus")
                    }
                    .buttonStyle(InkButtonStyle())
                    .accessibilityIdentifier("extra.add")
                }
            }
        }
        .padding(16)
        .surface(.section)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("extra.section")
    }
}
