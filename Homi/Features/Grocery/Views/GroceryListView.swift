// GroceryListView.swift
// Homi
// Shared family grocery list with categories

import SwiftUI
import SwiftData

struct GroceryListView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \GroceryItem.addedAt, order: .reverse) private var items: [GroceryItem]

    @State private var newItemName = ""
    @State private var newItemCategory: GroceryCategory = .other
    @State private var showingCategoryPicker = false

    private var groupedItems: [(GroceryCategory, [GroceryItem])] {
        let unchecked = items.filter { !$0.isChecked }
        let dict = Dictionary(grouping: unchecked) { $0.category }
        return GroceryCategory.allCases.compactMap { cat in
            guard let items = dict[cat], !items.isEmpty else { return nil }
            return (cat, items)
        }
    }

    private var checkedItems: [GroceryItem] {
        items.filter(\.isChecked)
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer().frame(height: 70)

            // Add item bar
            addItemBar

            ScrollView {
                VStack(spacing: HomiSpacing.lg) {
                    // Unchecked items by category
                    ForEach(groupedItems, id: \.0) { category, categoryItems in
                        categorySection(category: category, items: categoryItems)
                    }

                    // Checked items
                    if !checkedItems.isEmpty {
                        checkedSection
                    }

                    if items.isEmpty {
                        emptyState
                    }
                }
                .padding(HomiSpacing.lg)
            }
        }
    }

    // MARK: - Add Item Bar

    private var addItemBar: some View {
        HStack(spacing: HomiSpacing.md) {
            // Category button
            Button {
                showingCategoryPicker.toggle()
            } label: {
                Image(systemName: newItemCategory.icon)
                    .font(.system(size: 18))
                    .foregroundStyle(Color.homiPrimary)
                    .frame(width: 40, height: 40)
                    .background(Color.homiPrimary.opacity(0.1))
                    .clipShape(Circle())
            }
            .popover(isPresented: $showingCategoryPicker) {
                categoryPickerPopover
            }

            TextField("Add an item...", text: $newItemName)
                .font(HomiFont.body)
                .padding(.horizontal, HomiSpacing.lg)
                .padding(.vertical, HomiSpacing.md)
                .background(Color.homiBgTertiary)
                .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.buttonRadius))
                .onSubmit { addItem() }

            Button {
                addItem()
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(
                        newItemName.trimmingCharacters(in: .whitespaces).isEmpty
                        ? Color.homiTextMuted
                        : Color.homiPrimary
                    )
            }
            .disabled(newItemName.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding(.horizontal, HomiSpacing.lg)
        .padding(.vertical, HomiSpacing.md)
    }

    private var categoryPickerPopover: some View {
        VStack(spacing: 0) {
            ForEach(GroceryCategory.allCases) { cat in
                Button {
                    newItemCategory = cat
                    showingCategoryPicker = false
                } label: {
                    HStack {
                        Image(systemName: cat.icon)
                            .frame(width: 24)
                        Text(cat.rawValue)
                            .font(HomiFont.body)
                        Spacer()
                        if newItemCategory == cat {
                            Image(systemName: "checkmark")
                                .foregroundStyle(Color.homiPrimary)
                        }
                    }
                    .foregroundStyle(Color.homiTextPrimary)
                    .padding(.horizontal, HomiSpacing.lg)
                    .padding(.vertical, HomiSpacing.md)
                }
                if cat != GroceryCategory.allCases.last { Divider() }
            }
        }
        .frame(width: 220)
        .presentationCompactAdaptation(.popover)
    }

    // MARK: - Category Section

    private func categorySection(category: GroceryCategory, items: [GroceryItem]) -> some View {
        VStack(alignment: .leading, spacing: HomiSpacing.sm) {
            HStack(spacing: HomiSpacing.sm) {
                Image(systemName: category.icon)
                    .font(.system(size: 14))
                    .foregroundStyle(Color.homiPrimary)
                Text(category.rawValue)
                    .font(HomiFont.titleMedium)
                    .foregroundStyle(Color.homiTextPrimary)
                Text("\(items.count)")
                    .font(HomiFont.label)
                    .foregroundStyle(Color.homiTextMuted)
            }

            ForEach(items) { item in
                groceryRow(item)
            }
        }
    }

    private func groceryRow(_ item: GroceryItem) -> some View {
        HStack(spacing: HomiSpacing.lg) {
            Button {
                withAnimation(.spring(response: 0.3)) {
                    item.isChecked.toggle()
                }
            } label: {
                Image(systemName: item.isChecked ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 24))
                    .foregroundStyle(item.isChecked ? Color.homiSuccess : Color.homiTextMuted.opacity(0.4))
                    .symbolEffect(.bounce, value: item.isChecked)
            }
            .buttonStyle(.plain)

            Text(item.name)
                .font(HomiFont.body)
                .foregroundStyle(item.isChecked ? Color.homiTextMuted : Color.homiTextPrimary)
                .strikethrough(item.isChecked)

            Spacer()

            if let addedBy = item.addedBy {
                Text(addedBy.emoji)
                    .font(.system(size: 16))
            }
        }
        .padding(HomiSpacing.md)
        .background(Color.homiBgSecondary)
        .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.smallRadius))
    }

    // MARK: - Checked Section

    private var checkedSection: some View {
        VStack(alignment: .leading, spacing: HomiSpacing.sm) {
            HStack {
                Text("Completed")
                    .font(HomiFont.titleMedium)
                    .foregroundStyle(Color.homiTextMuted)
                Spacer()

                if appState.isAdmin {
                    Button("Clear All") {
                        withAnimation {
                            for item in checkedItems {
                                modelContext.delete(item)
                            }
                        }
                    }
                    .font(HomiFont.caption)
                    .foregroundStyle(Color.homiError)
                }
            }

            ForEach(checkedItems) { item in
                groceryRow(item)
            }
        }
        .padding(.top, HomiSpacing.lg)
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: HomiSpacing.lg) {
            Spacer().frame(height: 40)
            Image(systemName: "cart")
                .font(.system(size: 48))
                .foregroundStyle(Color.homiTextMuted.opacity(0.4))
            Text("Grocery list is empty")
                .font(HomiFont.titleLarge)
                .foregroundStyle(Color.homiTextSecondary)
            Text("Add items using the bar above")
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextMuted)
        }
    }

    // MARK: - Logic

    private func addItem() {
        let name = newItemName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }

        let item = GroceryItem(
            name: name,
            category: newItemCategory,
            addedBy: appState.currentMember
        )
        modelContext.insert(item)

        newItemName = ""
        newItemCategory = .other
    }
}
