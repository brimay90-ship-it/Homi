// MealPlannerView.swift
// Homi
// Weekly meal planning grid

import SwiftUI
import SwiftData

struct MealPlannerView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.modelContext) private var modelContext
    @Query private var allMeals: [MealEntry]

    @State private var currentWeekStart: Date = Calendar.current.startOfWeek(for: Date())
    @State private var editingMeal: MealEditState?

    private let calendar = Calendar.current

    private var weekDates: [Date] {
        (0..<7).compactMap { calendar.date(byAdding: .day, value: $0, to: currentWeekStart) }
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer().frame(height: 70)

            // Week navigation
            weekNav

            ScrollView {
                VStack(spacing: HomiSpacing.md) {
                    ForEach(weekDates, id: \.self) { date in
                        dayMealCard(date)
                    }
                }
                .padding(HomiSpacing.lg)
            }
        }
        .sheet(item: $editingMeal) { state in
            MealEditSheet(state: state) { title, notes in
                saveMeal(date: state.date, type: state.mealType, title: title, notes: notes)
            }
        }
    }

    private var weekNav: some View {
        HStack {
            Button {
                withAnimation {
                    currentWeekStart = calendar.date(byAdding: .weekOfYear, value: -1, to: currentWeekStart) ?? currentWeekStart
                }
            } label: {
                Image(systemName: "chevron.left")
                    .foregroundStyle(Color.homiTextSecondary)
                    .frame(width: 36, height: 36)
                    .background(Color.homiBgTertiary)
                    .clipShape(Circle())
            }

            Spacer()

            Text(weekRangeTitle)
                .font(HomiFont.titleMedium)
                .foregroundStyle(Color.homiTextPrimary)

            Spacer()

            Button {
                withAnimation {
                    currentWeekStart = calendar.date(byAdding: .weekOfYear, value: 1, to: currentWeekStart) ?? currentWeekStart
                }
            } label: {
                Image(systemName: "chevron.right")
                    .foregroundStyle(Color.homiTextSecondary)
                    .frame(width: 36, height: 36)
                    .background(Color.homiBgTertiary)
                    .clipShape(Circle())
            }
        }
        .padding(.horizontal, HomiSpacing.lg)
        .padding(.vertical, HomiSpacing.md)
    }

    private func dayMealCard(_ date: Date) -> some View {
        let isToday = calendar.isDateInToday(date)

        return VStack(alignment: .leading, spacing: HomiSpacing.md) {
            HStack {
                Text(date, format: .dateTime.weekday(.wide))
                    .font(HomiFont.titleMedium)
                    .foregroundStyle(isToday ? Color.homiPrimary : Color.homiTextPrimary)
                Text(date, format: .dateTime.month(.abbreviated).day())
                    .font(HomiFont.caption)
                    .foregroundStyle(Color.homiTextMuted)
                if isToday {
                    Text("TODAY")
                        .font(HomiFont.label)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.homiPrimary)
                        .clipShape(Capsule())
                }
                Spacer()
            }

            HStack(spacing: HomiSpacing.md) {
                ForEach(MealType.allCases) { type in
                    mealSlot(date: date, type: type)
                }
            }
        }
        .homiCard()
    }

    private func mealSlot(date: Date, type: MealType) -> some View {
        let meal = findMeal(date: date, type: type)

        return Button {
            editingMeal = MealEditState(
                date: date,
                mealType: type,
                existingTitle: meal?.title ?? "",
                existingNotes: meal?.notes ?? ""
            )
        } label: {
            VStack(spacing: HomiSpacing.sm) {
                Image(systemName: type.icon)
                    .font(.system(size: 18))
                    .foregroundStyle(meal != nil ? Color.homiPrimary : Color.homiTextMuted)

                Text(type.rawValue)
                    .font(HomiFont.label)
                    .foregroundStyle(Color.homiTextMuted)

                if let meal = meal {
                    Text(meal.title)
                        .font(HomiFont.bodyMedium)
                        .foregroundStyle(Color.homiTextPrimary)
                        .lineLimit(2)
                        .multilineTextAlignment(.center)
                } else {
                    Text("Add meal")
                        .font(HomiFont.caption)
                        .foregroundStyle(Color.homiTextMuted.opacity(0.6))
                }
            }
            .frame(maxWidth: .infinity)
            .padding(HomiSpacing.md)
            .background(meal != nil ? Color.homiPrimary.opacity(0.05) : Color.homiBgTertiary.opacity(0.5))
            .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.smallRadius))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Helpers

    private var weekRangeTitle: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        let start = formatter.string(from: currentWeekStart)
        let end = formatter.string(from: calendar.date(byAdding: .day, value: 6, to: currentWeekStart) ?? currentWeekStart)
        return "\(start) – \(end)"
    }

    private func findMeal(date: Date, type: MealType) -> MealEntry? {
        let dayStart = calendar.startOfDay(for: date)
        return allMeals.first { meal in
            calendar.isDate(meal.date, inSameDayAs: dayStart) && meal.mealType == type
        }
    }

    private func saveMeal(date: Date, type: MealType, title: String, notes: String) {
        if let existing = findMeal(date: date, type: type) {
            existing.title = title
            existing.notes = notes
        } else {
            let meal = MealEntry(date: date, mealType: type, title: title, notes: notes)
            modelContext.insert(meal)
        }
    }
}

// MARK: - Meal Edit State

struct MealEditState: Identifiable {
    let id = UUID()
    let date: Date
    let mealType: MealType
    var existingTitle: String
    var existingNotes: String
}

// MARK: - Meal Edit Sheet

struct MealEditSheet: View {
    let state: MealEditState
    let onSave: (String, String) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var title: String = ""
    @State private var notes: String = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("What's cooking?", text: $title)
                    TextField("Notes (optional)", text: $notes)
                }
            }
            .navigationTitle("\(state.mealType.rawValue)")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        onSave(title, notes)
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .presentationDetents([.medium])
        .onAppear {
            title = state.existingTitle
            notes = state.existingNotes
        }
    }
}

// MARK: - Calendar Extension

extension Calendar {
    func startOfWeek(for date: Date) -> Date {
        let components = dateComponents([.yearForWeekOfYear, .weekOfYear], from: date)
        return self.date(from: components) ?? date
    }
}
