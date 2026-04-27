// AppState.swift
// Homi
// Global application state

import SwiftUI
import Observation

/// Access levels for family members
enum AccessLevel: String, Codable, CaseIterable {
    case admin = "Admin"
    case standard = "Standard"

    var canDelete: Bool { self == .admin }
    var canModifySettings: Bool { self == .admin }
    var canManageMembers: Bool { self == .admin }
}

/// Primary navigation tabs
enum AppTab: String, CaseIterable, Identifiable {
    case calendar = "Calendar"
    case chores = "Chores"
    case meals = "Meals"
    case grocery = "Grocery"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .calendar: return "calendar"
        case .chores: return "checkmark.circle"
        case .meals: return "fork.knife"
        case .grocery: return "cart"
        }
    }

    var activeIcon: String {
        switch self {
        case .calendar: return "calendar.circle.fill"
        case .chores: return "checkmark.circle.fill"
        case .meals: return "fork.knife.circle.fill"
        case .grocery: return "cart.fill"
        }
    }
}

/// Global observable state shared across the app
@Observable
final class AppState {
    /// The currently active family member (logged in via PIN)
    var currentMember: FamilyMember?

    /// Whether the onboarding/setup wizard has been completed
    var hasCompletedOnboarding: Bool {
        get { UserDefaults.standard.bool(forKey: "hasCompletedOnboarding") }
        set { UserDefaults.standard.set(newValue, forKey: "hasCompletedOnboarding") }
    }

    /// The currently selected tab
    var activeTab: AppTab = .calendar

    /// Whether the PIN entry sheet is currently showing
    var showingPINEntry: Bool = false

    /// Callback for when PIN is verified (used for admin-required actions)
    var pinVerificationCallback: ((Bool) -> Void)?

    /// Whether the app is in night mode
    var isNightMode: Bool = false

    // MARK: - Access Control

    /// Check if the current user has admin privileges
    var isAdmin: Bool {
        currentMember?.accessLevel == .admin
    }

    /// Request admin verification for a protected action
    /// - Parameter action: The closure to execute if admin PIN is verified
    func requireAdmin(action: @escaping () -> Void) {
        if isAdmin {
            action()
        } else {
            pinVerificationCallback = { verified in
                if verified {
                    action()
                }
            }
            showingPINEntry = true
        }
    }

    /// Log out the current member (return to PIN entry)
    func logout() {
        currentMember = nil
    }
}
