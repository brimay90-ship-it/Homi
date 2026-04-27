// EventDetailView.swift
// Homi
// Event detail sheet

import SwiftUI
import EventKit

struct EventDetailView: View {
    let event: EKEvent
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: HomiSpacing.xl) {
                    // Color header
                    RoundedRectangle(cornerRadius: HomiSpacing.cardRadius)
                        .fill(Color(cgColor: event.calendar.cgColor).opacity(0.15))
                        .frame(height: 8)

                    // Title
                    Text(event.title ?? "Event")
                        .font(HomiFont.displayMedium)
                        .foregroundStyle(Color.homiTextPrimary)

                    // Calendar source
                    HStack(spacing: HomiSpacing.sm) {
                        Circle()
                            .fill(Color(cgColor: event.calendar.cgColor))
                            .frame(width: 12, height: 12)
                        Text(event.calendar.title)
                            .font(HomiFont.caption)
                            .foregroundStyle(Color.homiTextSecondary)
                    }

                    Divider()

                    // Date/Time
                    detailRow(icon: "clock", title: "When") {
                        if event.isAllDay {
                            Text("All day")
                                .font(HomiFont.body)
                                .foregroundStyle(Color.homiTextPrimary)
                            Text(event.startDate, format: .dateTime.weekday(.wide).month(.wide).day().year())
                                .font(HomiFont.caption)
                                .foregroundStyle(Color.homiTextSecondary)
                        } else {
                            Text(event.startDate, format: .dateTime.weekday(.wide).month(.abbreviated).day())
                                .font(HomiFont.body)
                                .foregroundStyle(Color.homiTextPrimary)
                            HStack {
                                Text(event.startDate, format: .dateTime.hour().minute())
                                Text("–")
                                Text(event.endDate, format: .dateTime.hour().minute())
                            }
                            .font(HomiFont.caption)
                            .foregroundStyle(Color.homiTextSecondary)
                        }
                    }

                    // Location
                    if let location = event.location, !location.isEmpty {
                        detailRow(icon: "mappin.and.ellipse", title: "Where") {
                            Text(location)
                                .font(HomiFont.body)
                                .foregroundStyle(Color.homiTextPrimary)
                        }
                    }

                    // Notes
                    if let notes = event.notes, !notes.isEmpty {
                        detailRow(icon: "note.text", title: "Notes") {
                            Text(notes)
                                .font(HomiFont.body)
                                .foregroundStyle(Color.homiTextPrimary)
                        }
                    }
                }
                .padding(HomiSpacing.xl)
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(HomiFont.bodyMedium)
                        .foregroundStyle(Color.homiPrimary)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    private func detailRow<Content: View>(icon: String, title: String, @ViewBuilder content: () -> Content) -> some View {
        HStack(alignment: .top, spacing: HomiSpacing.lg) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundStyle(Color.homiPrimary)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(HomiFont.label)
                    .foregroundStyle(Color.homiTextMuted)
                    .textCase(.uppercase)
                content()
            }
        }
    }
}
