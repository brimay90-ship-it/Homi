// CalendarService.swift
// Homi
// EventKit wrapper for calendar data access

import EventKit
import SwiftUI
import Observation

/// Service that wraps EventKit for accessing system calendars
@Observable
final class CalendarService {
    /// All events fetched for the current date range
    var events: [EKEvent] = []

    /// Available calendars on the device
    var calendars: [EKCalendar] = []

    /// Current authorization status
    var authorizationStatus: EKAuthorizationStatus = .notDetermined

    /// Whether an error occurred
    var errorMessage: String?

    /// The underlying EventKit store (exposed for AddEventView to save events)
    let eventStore = EKEventStore()

    // MARK: - Authorization

    /// Request access to the user's calendars
    func requestAccess() async {
        do {
            let granted = try await eventStore.requestFullAccessToEvents()
            await MainActor.run {
                self.authorizationStatus = EKEventStore.authorizationStatus(for: .event)
                if granted {
                    self.loadCalendars()
                } else {
                    self.errorMessage = "Calendar access was denied. Please enable it in Settings."
                }
            }
        } catch {
            await MainActor.run {
                self.authorizationStatus = EKEventStore.authorizationStatus(for: .event)
                self.errorMessage = "Failed to request calendar access: \(error.localizedDescription)"
            }
        }
    }

    /// Check current authorization without prompting
    func checkAuthorization() {
        authorizationStatus = EKEventStore.authorizationStatus(for: .event)
    }

    // MARK: - Calendar Data

    /// Load all available calendars
    func loadCalendars() {
        calendars = eventStore.calendars(for: .event)
    }

    /// Fetch events for a specific date range
    /// - Parameters:
    ///   - startDate: Range start
    ///   - endDate: Range end
    func fetchEvents(from startDate: Date, to endDate: Date) {
        guard authorizationStatus == .fullAccess else {
            errorMessage = "Calendar access not authorized"
            return
        }

        let predicate = eventStore.predicateForEvents(
            withStart: startDate,
            end: endDate,
            calendars: nil // All calendars
        )

        let fetchedEvents = eventStore.events(matching: predicate)
        events = fetchedEvents.sorted { $0.startDate < $1.startDate }
    }

    /// Fetch events for a specific day
    func fetchEvents(for date: Date) {
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        guard let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay) else { return }
        fetchEvents(from: startOfDay, to: endOfDay)
    }

    /// Fetch events for a specific week
    func fetchEvents(forWeekContaining date: Date) {
        let calendar = Calendar.current
        guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: date) else { return }
        fetchEvents(from: weekInterval.start, to: weekInterval.end)
    }

    /// Fetch events for a specific month
    func fetchEvents(forMonthContaining date: Date) {
        let calendar = Calendar.current
        guard let monthInterval = calendar.dateInterval(of: .month, for: date) else { return }
        fetchEvents(from: monthInterval.start, to: monthInterval.end)
    }

    // MARK: - Event Helpers

    /// Get events for a specific date from the cached events array
    func events(on date: Date) -> [EKEvent] {
        let calendar = Calendar.current
        return events.filter { event in
            calendar.isDate(event.startDate, inSameDayAs: date)
        }
    }

    /// Register for calendar change notifications
    func startObservingChanges(handler: @escaping () -> Void) {
        NotificationCenter.default.addObserver(
            forName: .EKEventStoreChanged,
            object: eventStore,
            queue: .main
        ) { _ in
            handler()
        }
    }
}
