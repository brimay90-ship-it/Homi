// AppSettings.swift
// Homi
// Persistent app settings stored in SwiftData

import Foundation
import SwiftData

@Model
final class AppSettings {
    @Attribute(.unique) var id: UUID

    /// Night mode start hour (0-23), default 22 (10 PM)
    var nightModeStartHour: Int

    /// Night mode end hour (0-23), default 6 (6 AM)
    var nightModeEndHour: Int

    /// Night mode dimming level (0.0 - 1.0), default 0.7
    var nightDimmingLevel: Double

    /// Whether to fully black out the screen at night
    var nightBlackout: Bool

    /// Weather location — if empty, uses device location
    var weatherLocationName: String

    /// Default calendar view (month, week, day)
    var defaultCalendarView: String

    /// Whether BLE relay is enabled
    var bleRelayEnabled: Bool

    init() {
        self.id = UUID()
        self.nightModeStartHour = 22
        self.nightModeEndHour = 6
        self.nightDimmingLevel = 0.7
        self.nightBlackout = false
        self.weatherLocationName = ""
        self.defaultCalendarView = "week"
        self.bleRelayEnabled = false
    }
}
