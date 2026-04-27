// MonthCalendarView.swift
// Homi
// Full month grid with visible event titles — uses full screen real estate

import SwiftUI
import EventKit

struct MonthCalendarView: View {
    @Binding var selectedDate: Date
    let calendarService: CalendarService
    let onDayTap: (Date) -> Void

    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.verticalSizeClass) private var verticalSizeClass

    private let calendar = Calendar.current
    private let weekdaySymbols = Calendar.current.shortWeekdaySymbols

    /// Whether the device is in landscape orientation
    private var isLandscape: Bool {
        verticalSizeClass == .compact
    }

    /// Maximum number of event titles to show per day cell
    private var maxVisibleEvents: Int {
        isLandscape ? 2 : 3
    }

    var body: some View {
        GeometryReader { geo in
            let weeks = generateWeeks()
            let rowCount = CGFloat(weeks.count)
            let headerHeight: CGFloat = 28
            let availableHeight = geo.size.height - headerHeight
            let rowHeight = max(availableHeight / rowCount, 60)

            VStack(spacing: 0) {
                // Weekday headers
                weekdayHeaders(height: headerHeight)

                // Month grid — fills all available space
                VStack(spacing: 1) {
                    ForEach(Array(weeks.enumerated()), id: \.offset) { _, week in
                        HStack(spacing: 1) {
                            ForEach(week, id: \.self) { date in
                                dayCell(date, cellHeight: rowHeight)
                            }
                        }
                        .frame(height: rowHeight)
                    }
                }
            }
        }
        .gesture(swipeGesture)
    }

    // MARK: - Weekday Headers

    private func weekdayHeaders(height: CGFloat) -> some View {
        HStack(spacing: 1) {
            ForEach(weekdaySymbols, id: \.self) { symbol in
                Text(symbol)
                    .font(HomiFont.label)
                    .foregroundStyle(Color.homiTextMuted)
                    .textCase(.uppercase)
                    .frame(maxWidth: .infinity)
                    .frame(height: height)
            }
        }
        .padding(.horizontal, HomiSpacing.sm)
    }

    // MARK: - Day Cell (Rich)

    private func dayCell(_ date: Date, cellHeight: CGFloat) -> some View {
        let isToday = calendar.isDateInToday(date)
        let isCurrentMonth = calendar.isDate(date, equalTo: selectedDate, toGranularity: .month)
        let dayEvents = calendarService.events(on: date)
        let visibleEvents = Array(dayEvents.prefix(maxVisibleEvents))
        let overflowCount = dayEvents.count - visibleEvents.count

        return Button { onDayTap(date) } label: {
            VStack(alignment: .leading, spacing: 2) {
                // Day number — top-left aligned
                HStack {
                    Text(date, format: .dateTime.day())
                        .font(.system(size: isLandscape ? 14 : 16, weight: isToday ? .bold : .medium, design: .rounded))
                        .foregroundStyle(
                            isToday ? .white :
                            isCurrentMonth ? Color.homiTextPrimary : Color.homiTextMuted.opacity(0.4)
                        )
                        .frame(width: isToday ? 28 : nil, height: isToday ? 28 : nil)
                        .background {
                            if isToday {
                                Circle().fill(Color.homiPrimary)
                            }
                        }
                    Spacer()
                }

                // Event titles — stacked vertically
                ForEach(Array(visibleEvents.enumerated()), id: \.offset) { _, event in
                    eventPill(event)
                }

                // Overflow indicator
                if overflowCount > 0 {
                    Text("+\(overflowCount) more")
                        .font(.system(size: 9, weight: .medium, design: .rounded))
                        .foregroundStyle(Color.homiTextMuted)
                        .padding(.leading, 2)
                }

                Spacer(minLength: 0)
            }
            .padding(.horizontal, 4)
            .padding(.vertical, 3)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .background(
                RoundedRectangle(cornerRadius: 6, style: .continuous)
                    .fill(cellBackground(isToday: isToday, isCurrentMonth: isCurrentMonth))
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Event Pill

    private func eventPill(_ event: EKEvent) -> some View {
        let eventColor = Color(cgColor: event.calendar.cgColor)

        return HStack(spacing: 3) {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(eventColor)
                .frame(width: 3)

            Text(event.title ?? "Event")
                .font(.system(size: 10, weight: .medium, design: .rounded))
                .foregroundStyle(Color.homiTextPrimary)
                .lineLimit(1)
        }
        .frame(height: 16)
        .padding(.horizontal, 2)
        .padding(.vertical, 1)
        .background(
            RoundedRectangle(cornerRadius: 4, style: .continuous)
                .fill(eventColor.opacity(0.12))
        )
    }

    // MARK: - Helpers

    private func cellBackground(isToday: Bool, isCurrentMonth: Bool) -> Color {
        if isToday {
            return Color.homiPrimary.opacity(0.06)
        } else if isCurrentMonth {
            return Color.homiBgSecondary.opacity(0.6)
        } else {
            return Color.homiBgTertiary.opacity(0.3)
        }
    }

    /// Generate an array of weeks, each containing 7 dates
    private func generateWeeks() -> [[Date]] {
        guard let monthInterval = calendar.dateInterval(of: .month, for: selectedDate),
              let firstWeek = calendar.dateInterval(of: .weekOfMonth, for: monthInterval.start) else { return [] }

        let allDates = (0..<42).compactMap {
            calendar.date(byAdding: .day, value: $0, to: firstWeek.start)
        }

        // Split into weeks and trim empty trailing weeks
        var weeks: [[Date]] = []
        for i in stride(from: 0, to: allDates.count, by: 7) {
            let week = Array(allDates[i..<min(i + 7, allDates.count)])
            weeks.append(week)
        }

        // Remove trailing week if it's entirely in the next month
        if let lastWeek = weeks.last,
           lastWeek.allSatisfy({ !calendar.isDate($0, equalTo: selectedDate, toGranularity: .month) }) {
            weeks.removeLast()
        }

        return weeks
    }

    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 50).onEnded { value in
            let delta = value.translation.width < -50 ? 1 : (value.translation.width > 50 ? -1 : 0)
            if delta != 0 {
                withAnimation(.spring(response: 0.35)) {
                    selectedDate = calendar.date(byAdding: .month, value: delta, to: selectedDate) ?? selectedDate
                }
            }
        }
    }
}
