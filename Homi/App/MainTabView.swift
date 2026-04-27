// MainTabView.swift
// Homi
// Primary navigation with custom sidebar tab bar for portrait iPad

import SwiftUI

struct MainTabView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        @Bindable var state = appState

        HStack(spacing: 0) {
            // Custom side tab bar
            sideTabBar

            // Content area
            ZStack {
                switch appState.activeTab {
                case .calendar:
                    CalendarContainerView()
                case .chores:
                    ChoresContainerView()
                case .meals:
                    MealPlannerView()
                case .grocery:
                    GroceryListView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .homiBackground()
        }
        .overlay(alignment: .top) {
            HeaderBar()
        }
        .sheet(isPresented: $state.showingPINEntry) {
            AdminPINEntryView { verified in
                appState.pinVerificationCallback?(verified)
                appState.showingPINEntry = false
                appState.pinVerificationCallback = nil
            }
        }
    }

    // MARK: - Side Tab Bar

    private var sideTabBar: some View {
        VStack(spacing: HomiSpacing.lg) {
            Spacer()
                .frame(height: 80) // Room for header bar

            ForEach(AppTab.allCases) { tab in
                tabButton(for: tab)
            }

            Spacer()

            // Settings button at bottom
            Button {
                appState.requireAdmin {
                    // Navigate to settings
                }
            } label: {
                Image(systemName: "gearshape")
                    .font(.system(size: HomiSpacing.tabIconSize))
                    .foregroundStyle(Color.homiTextMuted)
                    .frame(width: 56, height: 56)
            }

            // Logout button
            Button {
                withAnimation(.spring(response: 0.3)) {
                    appState.logout()
                }
            } label: {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 22))
                    .foregroundStyle(Color.homiTextMuted)
                    .frame(width: 56, height: 56)
            }

            Spacer()
                .frame(height: HomiSpacing.lg)
        }
        .frame(width: 72)
        .background {
            Rectangle()
                .fill(Color.homiBgSecondary)
                .shadow(color: .black.opacity(0.05), radius: 8, x: 2, y: 0)
                .ignoresSafeArea()
        }
    }

    private func tabButton(for tab: AppTab) -> some View {
        let isActive = appState.activeTab == tab

        return Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                appState.activeTab = tab
            }
        } label: {
            VStack(spacing: 4) {
                ZStack {
                    if isActive {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color.homiPrimary.opacity(0.12))
                            .frame(width: 50, height: 50)
                    }

                    Image(systemName: isActive ? tab.activeIcon : tab.icon)
                        .font(.system(size: HomiSpacing.tabIconSize))
                        .foregroundStyle(isActive ? Color.homiPrimary : Color.homiTextMuted)
                        .symbolEffect(.bounce, value: isActive)
                }

                Text(tab.rawValue)
                    .font(HomiFont.label)
                    .foregroundStyle(isActive ? Color.homiPrimary : Color.homiTextMuted)
            }
            .frame(width: 64, height: 70)
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isActive)
    }
}

// MARK: - Header Bar

struct HeaderBar: View {
    @Environment(AppState.self) private var appState
    @State private var currentTime = Date()

    private let timer = Timer.publish(every: 60, on: .main, in: .common).autoconnect()

    var body: some View {
        HStack(spacing: HomiSpacing.lg) {
            // Left padding for tab bar
            Spacer()
                .frame(width: 72)

            // Homi logo / title
            HStack(spacing: HomiSpacing.sm) {
                Text("🏠")
                    .font(.system(size: 24))
                Text("Homi")
                    .font(HomiFont.titleLarge)
                    .foregroundStyle(Color.homiTextPrimary)
            }

            Spacer()

            // Weather widget placeholder
            WeatherWidgetSmall()

            // Current time
            Text(currentTime, format: .dateTime.hour().minute())
                .font(HomiFont.displayMedium)
                .foregroundStyle(Color.homiTextPrimary)
                .monospacedDigit()
                .contentTransition(.numericText())

            // Current date
            Text(currentTime, format: .dateTime.weekday(.wide).month(.abbreviated).day())
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextSecondary)

            Spacer()

            // Current user avatar
            if let member = appState.currentMember {
                HStack(spacing: HomiSpacing.sm) {
                    Text(member.emoji)
                        .font(.system(size: 28))
                        .frame(width: HomiSpacing.avatarSize, height: HomiSpacing.avatarSize)
                        .background(Color(hex: member.colorHex).opacity(0.2))
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: 2) {
                        Text(member.name)
                            .font(HomiFont.bodyMedium)
                            .foregroundStyle(Color.homiTextPrimary)
                        Text(member.accessLevel.rawValue)
                            .font(HomiFont.label)
                            .foregroundStyle(Color.homiTextMuted)
                    }
                }
                .padding(.trailing, HomiSpacing.lg)
            }
        }
        .padding(.vertical, HomiSpacing.md)
        .background {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea(edges: .top)
        }
        .onReceive(timer) { time in
            withAnimation {
                currentTime = time
            }
        }
    }
}

// MARK: - Weather Widget (Small)

struct WeatherWidgetSmall: View {
    var body: some View {
        HStack(spacing: HomiSpacing.sm) {
            Image(systemName: "sun.max.fill")
                .font(.system(size: 20))
                .foregroundStyle(.yellow)
                .symbolEffect(.pulse)

            Text("72°")
                .font(HomiFont.titleMedium)
                .foregroundStyle(Color.homiTextPrimary)
        }
        .padding(.horizontal, HomiSpacing.md)
        .padding(.vertical, HomiSpacing.sm)
        .background(Color.homiAccent.opacity(0.1))
        .clipShape(Capsule())
    }
}

#Preview {
    let appState = AppState()
    appState.currentMember = FamilyMember(
        name: "Mom",
        emoji: "👩",
        colorHex: "#E05B8C",
        accessLevel: .admin
    )

    return MainTabView()
        .environment(appState)
        .environment(NightModeManager())
}
