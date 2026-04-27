// MealEntry.swift
// Homi
// Meal planning data model

import Foundation
import SwiftData

/// Meal types for the day
enum MealType: String, Codable, CaseIterable, Identifiable {
    case breakfast = "Breakfast"
    case lunch = "Lunch"
    case dinner = "Dinner"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .breakfast: return "sun.rise"
        case .lunch: return "sun.max"
        case .dinner: return "moon.stars"
        }
    }

    var defaultTime: String {
        switch self {
        case .breakfast: return "7:00 AM"
        case .lunch: return "12:00 PM"
        case .dinner: return "6:00 PM"
        }
    }
}

@Model
final class MealEntry {
    @Attribute(.unique) var id: UUID
    var date: Date
    var mealTypeRaw: String
    var title: String
    var notes: String
    var createdAt: Date

    var mealType: MealType {
        get { MealType(rawValue: mealTypeRaw) ?? .dinner }
        set { mealTypeRaw = newValue.rawValue }
    }

    init(
        date: Date,
        mealType: MealType,
        title: String,
        notes: String = ""
    ) {
        self.id = UUID()
        self.date = Calendar.current.startOfDay(for: date)
        self.mealTypeRaw = mealType.rawValue
        self.title = title
        self.notes = notes
        self.createdAt = Date()
    }
}
