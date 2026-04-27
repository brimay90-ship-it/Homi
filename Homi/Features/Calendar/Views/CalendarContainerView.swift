// CalendarContainerView.swift
// Homi
// Container that manages Month/Week/Day calendar views

import SwiftUI
import EventKit

/// Calendar view mode
enum CalendarViewMode: String, CaseIterable, Identifiable {
    case month = "Month"
    case week = "Week"
    case day = "Day"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .month: return "calendar"
        case .week: return "calendar.day.timeline.left"
        case .day: return "list.bullet.below.rectangle"
        }
    }
}

struct CalendarContainerView: View {
    @State private var calendarService = CalendarService()
    @State private var viewMode: CalendarViewMode = .week
    @State private var selectedDate: Date = Date()
    @State private var showingEventDetail: EKEvent?
    @State private var showingAddEvent = false

    var body: some View {
        VStack(spacing: 0) {
            // Top spacer for header bar
            Spacer().frame(height: 70)

            // View mode picker
            viewModePicker

            // Calendar content
            Group {
                switch viewMode {
                case .month:
                    MonthCalendarView(
                        selectedDate: $selectedDate,
                        calendarService: calendarService,
                        onDayTap: { date in
                            selectedDate = date
                            withAnimation(.spring(response: 0.35)) {
                                viewMode = .day
                            }
                        }
                    )
                case .week:
                    WeekCalendarView(
                        selectedDate: $selectedDate,
                        calendarService: calendarService,
                        onEventTap: { event in
                            showingEventDetail = event
                        }
                    )
                case .day:
                    DayCalendarView(
                        selectedDate: $selectedDate,
                        calendarService: calendarService,
                        onEventTap: { event in
                            showingEventDetail = event
                        }
                    )
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .task {
            await calendarService.requestAccess()
            refreshEvents()
        }
        .onChange(of: selectedDate) {
            refreshEvents()
        }
        .sheet(item: $showingEventDetail) { event in
            EventDetailView(event: event)
        }
        .sheet(isPresented: $showingAddEvent) {
            AddEventView(
                store: calendarService.eventStore,
                defaultDate: selectedDate,
                onSaved: { refreshEvents() }
            )
        }
        .overlay(alignment: .bottomTrailing) {
            Button {
                showingAddEvent = true
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 24, weight: .medium))
                    .foregroundStyle(.white)
                    .frame(width: 56, height: 56)
                    .background(Color.homiPrimary)
                    .clipShape(Circle())
                    .shadow(color: Color.homiPrimary.opacity(0.3), radius: 12, y: 6)
            }
            .padding(HomiSpacing.xl)
        }
    }

    // MARK: - View Mode Picker

    private var viewModePicker: some View {
        HStack(spacing: HomiSpacing.lg) {
            // Today button
            Button {
                withAnimation(.spring(response: 0.35)) {
                    selectedDate = Date()
                }
            } label: {
                Text("Today")
                    .font(HomiFont.bodyMedium)
                    .foregroundStyle(Color.homiPrimary)
                    .padding(.horizontal, HomiSpacing.lg)
                    .padding(.vertical, HomiSpacing.sm)
                    .background(Color.homiPrimary.opacity(0.1))
                    .clipShape(Capsule())
            }

            // Navigation arrows
            HStack(spacing: HomiSpacing.sm) {
                Button {
                    withAnimation(.spring(response: 0.35)) {
                        navigateBackward()
                    }
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(Color.homiTextSecondary)
                        .frame(width: 36, height: 36)
                        .background(Color.homiBgTertiary)
                        .clipShape(Circle())
                }

                Text(dateRangeTitle)
                    .font(HomiFont.titleMedium)
                    .foregroundStyle(Color.homiTextPrimary)
                    .frame(minWidth: 200)

                Button {
                    withAnimation(.spring(response: 0.35)) {
                        navigateForward()
                    }
                } label: {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(Color.homiTextSecondary)
                        .frame(width: 36, height: 36)
                        .background(Color.homiBgTertiary)
                        .clipShape(Circle())
                }
            }

            Spacer()

            // View mode segmented control
            HStack(spacing: 2) {
                ForEach(CalendarViewMode.allCases) { mode in
                    Button {
                        withAnimation(.spring(response: 0.35)) {
                            viewMode = mode
                        }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: mode.icon)
                                .font(.system(size: 14))
                            Text(mode.rawValue)
                                .font(HomiFont.label)
                        }
                        .foregroundStyle(viewMode == mode ? .white : Color.homiTextSecondary)
                        .padding(.horizontal, HomiSpacing.md)
                        .padding(.vertical, HomiSpacing.sm)
                        .background(viewMode == mode ? Color.homiPrimary : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.smallRadius))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(3)
            .background(Color.homiBgTertiary)
            .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.smallRadius + 3))
        }
        .padding(.horizontal, HomiSpacing.lg)
        .padding(.vertical, HomiSpacing.md)
    }

    // MARK: - Helpers

    private var dateRangeTitle: String {
        let formatter = DateFormatter()
        switch viewMode {
        case .month:
            formatter.dateFormat = "MMMM yyyy"
            return formatter.string(from: selectedDate)
        case .week:
            let calendar = Calendar.current
            guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: selectedDate) else {
                return ""
            }
            formatter.dateFormat = "MMM d"
            let start = formatter.string(from: weekInterval.start)
            let end = formatter.string(from: weekInterval.end.addingTimeInterval(-1))
            return "\(start) – \(end)"
        case .day:
            formatter.dateFormat = "EEEE, MMMM d"
            return formatter.string(from: selectedDate)
        }
    }

    private func navigateForward() {
        let calendar = Calendar.current
        switch viewMode {
        case .month:
            selectedDate = calendar.date(byAdding: .month, value: 1, to: selectedDate) ?? selectedDate
        case .week:
            selectedDate = calendar.date(byAdding: .weekOfYear, value: 1, to: selectedDate) ?? selectedDate
        case .day:
            selectedDate = calendar.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
        }
    }

    private func navigateBackward() {
        let calendar = Calendar.current
        switch viewMode {
        case .month:
            selectedDate = calendar.date(byAdding: .month, value: -1, to: selectedDate) ?? selectedDate
        case .week:
            selectedDate = calendar.date(byAdding: .weekOfYear, value: -1, to: selectedDate) ?? selectedDate
        case .day:
            selectedDate = calendar.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
        }
    }

    private func refreshEvents() {
        switch viewMode {
        case .month: calendarService.fetchEvents(forMonthContaining: selectedDate)
        case .week: calendarService.fetchEvents(forWeekContaining: selectedDate)
        case .day: calendarService.fetchEvents(for: selectedDate)
        }
    }
}

// MARK: - Make EKEvent Identifiable for sheet presentation

extension EKEvent: @retroactive Identifiable {
    public var id: String { eventIdentifier }
}

#Preview {
    CalendarContainerView()
        .environment(AppState())
}
