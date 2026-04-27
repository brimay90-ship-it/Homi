// GroceryItem.swift
// Homi
// Grocery list data model

import Foundation
import SwiftData

/// Categories for organizing grocery items
enum GroceryCategory: String, Codable, CaseIterable, Identifiable {
    case produce = "Produce"
    case dairy = "Dairy"
    case meat = "Meat & Seafood"
    case bakery = "Bakery"
    case frozen = "Frozen"
    case pantry = "Pantry"
    case beverages = "Beverages"
    case snacks = "Snacks"
    case household = "Household"
    case other = "Other"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .produce: return "leaf"
        case .dairy: return "cup.and.saucer"
        case .meat: return "fish"
        case .bakery: return "birthday.cake"
        case .frozen: return "snowflake"
        case .pantry: return "cabinet"
        case .beverages: return "waterbottle"
        case .snacks: return "popcorn"
        case .household: return "house"
        case .other: return "basket"
        }
    }
}

@Model
final class GroceryItem {
    @Attribute(.unique) var id: UUID
    var name: String
    var categoryRaw: String
    var isChecked: Bool
    var addedAt: Date

    /// The family member who added this item
    var addedBy: FamilyMember?

    var category: GroceryCategory {
        get { GroceryCategory(rawValue: categoryRaw) ?? .other }
        set { categoryRaw = newValue.rawValue }
    }

    init(
        name: String,
        category: GroceryCategory = .other,
        addedBy: FamilyMember? = nil
    ) {
        self.id = UUID()
        self.name = name
        self.categoryRaw = category.rawValue
        self.isChecked = false
        self.addedAt = Date()
        self.addedBy = addedBy
    }
}
