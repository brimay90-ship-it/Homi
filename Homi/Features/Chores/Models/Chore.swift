// Chore.swift
// Homi
// Chore data model with recurrence support

import Foundation
import SwiftData

/// How often a chore recurs
enum ChoreFrequency: String, Codable, CaseIterable, Identifiable {
    case once = "Once"
    case daily = "Daily"
    case weekly = "Weekly"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .once: return "1.circle"
        case .daily: return "arrow.clockwise.circle"
        case .weekly: return "calendar.badge.clock"
        }
    }
}

@Model
final class Chore {
    @Attribute(.unique) var id: UUID
    var title: String
    var notes: String
    var frequencyRaw: String
    var dueTime: Date?
    var isCompleted: Bool
    var completedAt: Date?
    var lastResetDate: Date?
    var createdAt: Date

    /// The family member this chore is assigned to
    var assignee: FamilyMember?

    /// The family member who created this chore
    var createdBy: FamilyMember?

    /// Completion history for this chore
    @Relationship(deleteRule: .cascade, inverse: \ChoreCompletion.chore)
    var completions: [ChoreCompletion] = []

    var frequency: ChoreFrequency {
        get { ChoreFrequency(rawValue: frequencyRaw) ?? .once }
        set { frequencyRaw = newValue.rawValue }
    }

    /// Whether this chore needs to be reset (for recurring chores)
    var needsReset: Bool {
        guard frequency != .once, isCompleted else { return false }
        guard let lastReset = lastResetDate ?? completedAt else { return false }

        let calendar = Calendar.current
        switch frequency {
        case .daily:
            return !calendar.isDateInToday(lastReset)
        case .weekly:
            return !calendar.isDate(lastReset, equalTo: Date(), toGranularity: .weekOfYear)
        case .once:
            return false
        }
    }

    /// Reset a recurring chore for the new period
    func resetIfNeeded() {
        guard needsReset else { return }
        isCompleted = false
        completedAt = nil
        lastResetDate = Date()
    }

    init(
        title: String,
        notes: String = "",
        frequency: ChoreFrequency = .once,
        dueTime: Date? = nil,
        assignee: FamilyMember? = nil,
        createdBy: FamilyMember? = nil
    ) {
        self.id = UUID()
        self.title = title
        self.notes = notes
        self.frequencyRaw = frequency.rawValue
        self.dueTime = dueTime
        self.isCompleted = false
        self.createdAt = Date()
        self.assignee = assignee
        self.createdBy = createdBy
    }
}

// MARK: - Chore Completion History

@Model
final class ChoreCompletion {
    @Attribute(.unique) var id: UUID
    var completedAt: Date
    var completedByName: String

    var chore: Chore?

    init(chore: Chore, completedByName: String) {
        self.id = UUID()
        self.completedAt = Date()
        self.completedByName = completedByName
        self.chore = chore
    }
}
