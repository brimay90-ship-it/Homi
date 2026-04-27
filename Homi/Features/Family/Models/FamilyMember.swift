// FamilyMember.swift
// Homi
// Family member data model

import Foundation
import SwiftData

@Model
final class FamilyMember {
    @Attribute(.unique) var id: UUID
    var name: String
    var emoji: String
    var colorHex: String
    var accessLevelRaw: String
    var createdAt: Date

    /// Chores assigned to this member
    @Relationship(deleteRule: .nullify, inverse: \Chore.assignee)
    var assignedChores: [Chore] = []

    /// Chores created by this member
    @Relationship(deleteRule: .nullify, inverse: \Chore.createdBy)
    var createdChores: [Chore] = []

    /// Grocery items added by this member
    @Relationship(deleteRule: .nullify, inverse: \GroceryItem.addedBy)
    var addedGroceryItems: [GroceryItem] = []

    var accessLevel: AccessLevel {
        get { AccessLevel(rawValue: accessLevelRaw) ?? .standard }
        set { accessLevelRaw = newValue.rawValue }
    }

    var isAdmin: Bool { accessLevel == .admin }

    init(
        name: String,
        emoji: String = "😊",
        colorHex: String = "#5B7FFF",
        accessLevel: AccessLevel = .standard
    ) {
        self.id = UUID()
        self.name = name
        self.emoji = emoji
        self.colorHex = colorHex
        self.accessLevelRaw = accessLevel.rawValue
        self.createdAt = Date()
    }
}

// MARK: - Preset Colors

extension FamilyMember {
    /// Curated color palette for family member profiles
    static let presetColors: [(name: String, hex: String)] = [
        ("Ocean", "#4A90D9"),
        ("Coral", "#E8725C"),
        ("Forest", "#5AAB61"),
        ("Sunset", "#F5A623"),
        ("Lavender", "#9B6BD4"),
        ("Rose", "#E05B8C"),
        ("Teal", "#3BBFA0"),
        ("Amber", "#D4913B"),
        ("Slate", "#6B7B8D"),
        ("Berry", "#8B45A6"),
        ("Mint", "#45B5AA"),
        ("Peach", "#E8845C")
    ]

    /// Curated emoji options for avatars
    static let presetEmojis: [String] = [
        "😊", "😎", "🥰", "🤓", "😄",
        "👩", "👨", "👧", "👦", "👶",
        "🦸‍♀️", "🦸‍♂️", "🧑‍🎨", "🧑‍🍳", "🧑‍🎓",
        "🐱", "🐶", "🦊", "🐻", "🐰",
        "⭐️", "🌙", "☀️", "🌈", "🌸"
    ]
}
