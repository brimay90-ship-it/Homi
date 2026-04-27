// NightModeManager.swift
// Homi
// Manages automatic day/night mode transitions

import SwiftUI
import Observation

/// Manages the always-on display night dimming feature
@Observable
final class NightModeManager {
    /// Whether night mode is currently active
    var isNightMode: Bool = false

    /// Current dimming opacity (0 = no dim, 1 = full black)
    var dimmingOpacity: Double = 0.0

    /// Night mode start hour (24h format)
    var startHour: Int = 22

    /// Night mode end hour (24h format)
    var endHour: Int = 6

    /// Dimming level during night mode (0.0 - 1.0)
    var dimmingLevel: Double = 0.7

    /// Whether to fully black out (OLED-friendly)
    var blackoutMode: Bool = false

    private var timer: Timer?

    // MARK: - Lifecycle

    /// Start monitoring time for night mode transitions
    func startMonitoring() {
        checkNightMode()

        // Check every minute
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.checkNightMode()
            }
        }
    }

    /// Stop monitoring
    func stopMonitoring() {
        timer?.invalidate()
        timer = nil
    }

    /// Update settings from AppSettings model
    func updateSettings(startHour: Int, endHour: Int, dimmingLevel: Double, blackout: Bool) {
        self.startHour = startHour
        self.endHour = endHour
        self.dimmingLevel = dimmingLevel
        self.blackoutMode = blackout
        checkNightMode()
    }

    // MARK: - Private

    private func checkNightMode() {
        let hour = Calendar.current.component(.hour, from: Date())
        let shouldBeNight: Bool

        if startHour > endHour {
            // Crosses midnight (e.g., 22:00 - 06:00)
            shouldBeNight = hour >= startHour || hour < endHour
        } else {
            // Same day range (e.g., 20:00 - 23:00)
            shouldBeNight = hour >= startHour && hour < endHour
        }

        withAnimation(.easeInOut(duration: 2.0)) {
            isNightMode = shouldBeNight
            dimmingOpacity = shouldBeNight ? (blackoutMode ? 0.95 : dimmingLevel) : 0.0
        }
    }
}
