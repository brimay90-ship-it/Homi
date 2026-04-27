// DayCalendarView.swift
// Homi
// Detailed day agenda view

import SwiftUI
import EventKit

struct DayCalendarView: View {
    @Binding var selectedDate: Date
    let calendarService: CalendarService
    let onEventTap: (EKEvent) -> Void

    private let calendar = Calendar.current

    private var dayEvents: [EKEvent] {
        calendarService.events(on: selectedDate)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: HomiSpacing.md) {
                if dayEvents.isEmpty {
                    emptyState
                } else {
                    ForEach(dayEvents, id: \.eventIdentifier) { event in
                        eventRow(event)
                    }
                }
            }
            .padding(HomiSpacing.lg)
        }
        .gesture(
            DragGesture(minimumDistance: 50).onEnded { value in
                let delta = value.translation.width < -50 ? 1 : (value.translation.width > 50 ? -1 : 0)
                if delta != 0 {
                    withAnimation(.spring(response: 0.35)) {
                        selectedDate = calendar.date(byAdding: .day, value: delta, to: selectedDate) ?? selectedDate
                    }
                }
            }
        )
    }

    private var emptyState: some View {
        VStack(spacing: HomiSpacing.lg) {
            Spacer().frame(height: 60)
            Image(systemName: "calendar.badge.checkmark")
                .font(.system(size: 48))
                .foregroundStyle(Color.homiTextMuted.opacity(0.4))
            Text("No events today")
                .font(HomiFont.titleLarge)
                .foregroundStyle(Color.homiTextSecondary)
            Text("Enjoy your free time! 🎉")
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextMuted)
        }
        .frame(maxWidth: .infinity)
    }

    private func eventRow(_ event: EKEvent) -> some View {
        let eventColor = Color(cgColor: event.calendar.cgColor)

        return Button { onEventTap(event) } label: {
            HStack(spacing: HomiSpacing.lg) {
                // Color bar
                RoundedRectangle(cornerRadius: 3)
                    .fill(eventColor)
                    .frame(width: 6)

                VStack(alignment: .leading, spacing: 4) {
                    Text(event.title ?? "Event")
                        .font(HomiFont.titleMedium)
                        .foregroundStyle(Color.homiTextPrimary)

                    if event.isAllDay {
                        Text("All day")
                            .font(HomiFont.caption)
                            .foregroundStyle(eventColor)
                    } else {
                        HStack(spacing: 4) {
                            Text(event.startDate, format: .dateTime.hour().minute())
                            Text("–")
                            Text(event.endDate, format: .dateTime.hour().minute())
                        }
                        .font(HomiFont.caption)
                        .foregroundStyle(Color.homiTextSecondary)
                    }

                    if let location = event.location, !location.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin")
                                .font(.system(size: 11))
                            Text(location)
                                .lineLimit(1)
                        }
                        .font(HomiFont.caption)
                        .foregroundStyle(Color.homiTextMuted)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundStyle(Color.homiTextMuted)
            }
            .padding(HomiSpacing.lg)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.homiBgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.cardRadius, style: .continuous))
            .shadow(color: HomiShadow.subtle.color, radius: HomiShadow.subtle.radius)
        }
        .buttonStyle(.plain)
    }
}
