// AddEventView.swift
// Homi
// Create a new calendar event via EventKit

import SwiftUI
import EventKit

struct AddEventView: View {
    @Environment(\.dismiss) private var dismiss

    let store: EKEventStore
    let defaultDate: Date
    var onSaved: (() -> Void)?

    @State private var title = ""
    @State private var location = ""
    @State private var notes = ""
    @State private var isAllDay = false
    @State private var startDate: Date
    @State private var selectedCalendar: EKCalendar?
    @State private var isRepeating = false
    @State private var repeatingDays: Set<Int> = []
    @State private var hasEndRepeat = false
    @State private var endRepeatDate: Date
    @State private var showError = false
    @State private var errorMessage = ""

    private let daysOfWeek = [
        (1, "S"), (2, "M"), (3, "T"), (4, "W"), (5, "T"), (6, "F"), (7, "S")
    ]

    private var calendars: [EKCalendar] {
        store.calendars(for: .event).filter { $0.allowsContentModifications }
    }

    init(store: EKEventStore, defaultDate: Date, onSaved: (() -> Void)? = nil) {
        self.store = store
        self.defaultDate = defaultDate
        self.onSaved = onSaved

        let calendar = Calendar.current
        let start = calendar.date(bySettingHour: 9, minute: 0, second: 0, of: defaultDate) ?? defaultDate
        let end = calendar.date(byAdding: .hour, value: 1, to: start) ?? defaultDate

        _startDate = State(initialValue: start)
        _endDate = State(initialValue: end)
        _endRepeatDate = State(initialValue: calendar.date(byAdding: .month, value: 1, to: defaultDate) ?? defaultDate)
    }

    var body: some View {
        NavigationStack {
            Form {
                // Event Details
                Section("Event Details") {
                    TextField("Event title", text: $title)
                        .font(HomiFont.body)

                    TextField("Location (optional)", text: $location)
                        .font(HomiFont.body)

                    TextField("Notes (optional)", text: $notes, axis: .vertical)
                        .font(HomiFont.body)
                        .lineLimit(3...6)
                }

                // Date & Time
                Section("Date & Time") {
                    Toggle("All Day", isOn: $isAllDay)
                        .tint(Color.homiPrimary)

                    if isAllDay {
                        DatePicker("Date", selection: $startDate, displayedComponents: .date)
                    } else {
                        DatePicker("Starts", selection: $startDate)
                        DatePicker("Ends", selection: $endDate)
                    }
                }

                // Repeat Options
                Section("Repeat") {
                    Toggle("Repeat Event", isOn: $isRepeating)
                        .tint(Color.homiPrimary)

                    if isRepeating {
                        HStack(spacing: 8) {
                            Spacer()
                            ForEach(daysOfWeek, id: \.0) { day in
                                let isSelected = repeatingDays.contains(day.0)
                                Text(day.1)
                                    .font(.system(size: 14, weight: .semibold))
                                    .frame(width: 36, height: 36)
                                    .background(isSelected ? Color.homiPrimary : Color.clear)
                                    .foregroundStyle(isSelected ? .white : Color.homiTextPrimary)
                                    .clipShape(Circle())
                                    .overlay(
                                        Circle().stroke(isSelected ? Color.clear : Color.homiTextSecondary.opacity(0.3), lineWidth: 1)
                                    )
                                    .onTapGesture {
                                        if isSelected {
                                            repeatingDays.remove(day.0)
                                        } else {
                                            repeatingDays.insert(day.0)
                                        }
                                    }
                            }
                            Spacer()
                        }
                        .padding(.vertical, 4)

                        Toggle("End Repeat", isOn: $hasEndRepeat)
                            .tint(Color.homiPrimary)

                        if hasEndRepeat {
                            DatePicker("End Date", selection: $endRepeatDate, displayedComponents: .date)
                        }
                    }
                }

                // Calendar Selection
                Section("Calendar") {
                    ForEach(calendars, id: \.calendarIdentifier) { cal in
                        Button {
                            selectedCalendar = cal
                        } label: {
                            HStack(spacing: 12) {
                                Circle()
                                    .fill(Color(cgColor: cal.cgColor))
                                    .frame(width: 14, height: 14)

                                Text(cal.title)
                                    .font(HomiFont.body)
                                    .foregroundStyle(Color.homiTextPrimary)

                                Spacer()

                                if selectedCalendar?.calendarIdentifier == cal.calendarIdentifier {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(Color.homiPrimary)
                                        .font(.system(size: 14, weight: .bold))
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("New Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Color.homiTextSecondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Add") { saveEvent() }
                        .font(HomiFont.bodyMedium)
                        .foregroundStyle(canSave ? Color.homiPrimary : Color.homiTextMuted)
                        .disabled(!canSave)
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK") {}
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                selectedCalendar = store.defaultCalendarForNewEvents
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    // MARK: - Validation

    private var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty
    }

    // MARK: - Save

    private func saveEvent() {
        let event = EKEvent(eventStore: store)
        event.title = title.trimmingCharacters(in: .whitespaces)
        event.location = location.isEmpty ? nil : location
        event.notes = notes.isEmpty ? nil : notes
        event.isAllDay = isAllDay
        event.startDate = startDate
        event.endDate = isAllDay ? startDate : endDate
        event.calendar = selectedCalendar ?? store.defaultCalendarForNewEvents

        if isRepeating && !repeatingDays.isEmpty {
            let days = repeatingDays.compactMap { EKWeekday(rawValue: $0) }.map { EKRecurrenceDayOfWeek($0) }
            let recurrenceEnd = hasEndRepeat ? EKRecurrenceEnd(end: endRepeatDate) : nil
            let rule = EKRecurrenceRule(
                recurrenceWith: .weekly,
                interval: 1,
                daysOfTheWeek: days,
                daysOfTheMonth: nil,
                monthsOfTheYear: nil,
                weeksOfTheYear: nil,
                daysOfTheYear: nil,
                setPositions: nil,
                end: recurrenceEnd
            )
            event.addRecurrenceRule(rule)
        }

        do {
            try store.save(event, span: .thisEvent)
            onSaved?()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
