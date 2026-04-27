// WeekCalendarView.swift
// Homi
// 7-day week view with time blocks — the default calendar view

import SwiftUI
import EventKit

struct WeekCalendarView: View {
    @Binding var selectedDate: Date
    let calendarService: CalendarService
    let onEventTap: (EKEvent) -> Void

    @State private var scrollProxy: ScrollViewProxy?

    private let calendar = Calendar.current
    private let hourHeight: CGFloat = 60
    private let timeColumnWidth: CGFloat = 56
    private let startHour = 6  // Display starts at 6 AM
    private let endHour = 23   // Display ends at 11 PM

    private var weekDates: [Date] {
        guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: selectedDate) else { return [] }
        return (0..<7).compactMap { calendar.date(byAdding: .day, value: $0, to: weekInterval.start) }
    }

    var body: some View {
        GeometryReader { geo in
            let dayColumnWidth = (geo.size.width - timeColumnWidth) / 7

            VStack(spacing: 0) {
                // Day headers
                dayHeaders(dayColumnWidth: dayColumnWidth)

                Divider()

                // Time grid with events
                ScrollViewReader { proxy in
                    ScrollView(.vertical, showsIndicators: false) {
                        ZStack(alignment: .topLeading) {
                            // Time grid lines
                            timeGrid(dayColumnWidth: dayColumnWidth)

                            // Events overlay
                            ForEach(weekDates, id: \.self) { date in
                                let dayEvents = calendarService.events(on: date)
                                let dayIndex = weekDates.firstIndex(of: date) ?? 0

                                ForEach(dayEvents, id: \.eventIdentifier) { event in
                                    eventBlock(
                                        event: event,
                                        dayIndex: dayIndex,
                                        dayColumnWidth: dayColumnWidth
                                    )
                                }
                            }

                            // Current time indicator
                            currentTimeIndicator(dayColumnWidth: dayColumnWidth)
                        }
                        .frame(height: CGFloat(endHour - startHour) * hourHeight)
                    }
                    .onAppear {
                        scrollProxy = proxy
                    }
                }
            }
        }
        .gesture(
            DragGesture(minimumDistance: 50)
                .onEnded { value in
                    if value.translation.width < -50 {
                        withAnimation(.spring(response: 0.35)) {
                            selectedDate = calendar.date(byAdding: .weekOfYear, value: 1, to: selectedDate) ?? selectedDate
                        }
                    } else if value.translation.width > 50 {
                        withAnimation(.spring(response: 0.35)) {
                            selectedDate = calendar.date(byAdding: .weekOfYear, value: -1, to: selectedDate) ?? selectedDate
                        }
                    }
                }
        )
    }

    // MARK: - Day Headers

    private func dayHeaders(dayColumnWidth: CGFloat) -> some View {
        HStack(spacing: 0) {
            Color.clear.frame(width: timeColumnWidth)

            ForEach(weekDates, id: \.self) { date in
                let isToday = calendar.isDateInToday(date)

                VStack(spacing: 4) {
                    Text(date, format: .dateTime.weekday(.abbreviated))
                        .font(HomiFont.label)
                        .foregroundStyle(isToday ? Color.homiPrimary : Color.homiTextMuted)
                        .textCase(.uppercase)

                    Text(date, format: .dateTime.day())
                        .font(HomiFont.calendarDay)
                        .foregroundStyle(isToday ? .white : Color.homiTextPrimary)
                        .frame(width: 44, height: 44)
                        .background {
                            if isToday {
                                Circle().fill(Color.homiPrimary)
                            }
                        }
                }
                .frame(width: dayColumnWidth)
            }
        }
        .padding(.vertical, HomiSpacing.sm)
    }

    // MARK: - Time Grid

    private func timeGrid(dayColumnWidth: CGFloat) -> some View {
        VStack(spacing: 0) {
            ForEach(startHour..<endHour, id: \.self) { hour in
                HStack(spacing: 0) {
                    // Time label
                    Text(formatHour(hour))
                        .font(HomiFont.timeLabel)
                        .foregroundStyle(Color.homiTextMuted)
                        .frame(width: timeColumnWidth, alignment: .trailing)
                        .padding(.trailing, HomiSpacing.sm)
                        .offset(y: -8)

                    // Grid line across all day columns
                    Rectangle()
                        .fill(Color.homiTextMuted.opacity(0.1))
                        .frame(height: 1)
                }
                .frame(height: hourHeight)
                .id(hour)
            }
        }
    }

    // MARK: - Event Block

    private func eventBlock(event: EKEvent, dayIndex: Int, dayColumnWidth: CGFloat) -> some View {
        let startMinutes = minutesSinceStartHour(event.startDate)
        let endMinutes = minutesSinceStartHour(event.endDate)
        let duration = max(endMinutes - startMinutes, 20) // minimum height
        let yOffset = CGFloat(startMinutes) / 60.0 * hourHeight
        let xOffset = timeColumnWidth + CGFloat(dayIndex) * dayColumnWidth + 2

        let eventColor = Color(cgColor: event.calendar.cgColor)

        return Button {
            onEventTap(event)
        } label: {
            VStack(alignment: .leading, spacing: 2) {
                Text(event.title ?? "Event")
                    .font(HomiFont.label)
                    .foregroundStyle(.white)
                    .lineLimit(1)

                if duration > 30 {
                    Text(event.startDate, format: .dateTime.hour().minute())
                        .font(.system(size: 10, weight: .regular, design: .monospaced))
                        .foregroundStyle(.white.opacity(0.8))
                }
            }
            .padding(.horizontal, 6)
            .padding(.vertical, 4)
            .frame(width: dayColumnWidth - 4, alignment: .leading)
            .frame(height: CGFloat(duration) / 60.0 * hourHeight, alignment: .top)
            .background(
                RoundedRectangle(cornerRadius: 6, style: .continuous)
                    .fill(eventColor.opacity(0.85))
            )
        }
        .buttonStyle(.plain)
        .offset(x: xOffset, y: yOffset)
    }

    // MARK: - Current Time Indicator

    private func currentTimeIndicator(dayColumnWidth: CGFloat) -> some View {
        let now = Date()
        guard let todayIndex = weekDates.firstIndex(where: { calendar.isDateInToday($0) }) else {
            return AnyView(EmptyView())
        }

        let minutes = minutesSinceStartHour(now)
        let yOffset = CGFloat(minutes) / 60.0 * hourHeight

        return AnyView(
            HStack(spacing: 0) {
                Color.clear.frame(width: timeColumnWidth)

                // Red line across today's column
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.homiError)
                        .frame(height: 2)
                        .offset(x: CGFloat(todayIndex) * dayColumnWidth)
                        .frame(width: dayColumnWidth)

                    Circle()
                        .fill(Color.homiError)
                        .frame(width: 10, height: 10)
                        .offset(x: CGFloat(todayIndex) * dayColumnWidth - 5)
                }
            }
            .offset(y: yOffset)
        )
    }

    // MARK: - Helpers

    private func minutesSinceStartHour(_ date: Date) -> CGFloat {
        let hour = calendar.component(.hour, from: date)
        let minute = calendar.component(.minute, from: date)
        return CGFloat((hour - startHour) * 60 + minute)
    }

    private func formatHour(_ hour: Int) -> String {
        let adjusted = hour % 12 == 0 ? 12 : hour % 12
        let ampm = hour < 12 ? "AM" : "PM"
        return "\(adjusted) \(ampm)"
    }
}
