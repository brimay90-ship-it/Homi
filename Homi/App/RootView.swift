// RootView.swift
// Homi
// Root view that handles onboarding vs main app flow

import SwiftUI
import SwiftData

struct RootView: View {
    @Environment(AppState.self) private var appState
    @Environment(NightModeManager.self) private var nightMode
    @Environment(\.modelContext) private var modelContext
    @Query private var members: [FamilyMember]

    var body: some View {
        Group {
            if !appState.hasCompletedOnboarding || members.isEmpty {
                OnboardingView()
                    .transition(.opacity.combined(with: .scale(scale: 0.95)))
            } else if appState.currentMember == nil {
                LockScreenView()
                    .transition(.opacity)
            } else {
                MainTabView()
                    .transition(.opacity.combined(with: .move(edge: .trailing)))
            }
        }
        .animation(.smooth(duration: 0.4), value: appState.hasCompletedOnboarding)
        .animation(.smooth(duration: 0.4), value: appState.currentMember?.id)
        .overlay {
            if nightMode.isNightMode {
                NightModeOverlay()
            }
        }
    }
}

// MARK: - Night Mode Overlay

struct NightModeOverlay: View {
    @Environment(NightModeManager.self) private var nightMode

    var body: some View {
        Color.black
            .opacity(nightMode.dimmingOpacity)
            .ignoresSafeArea()
            .allowsHitTesting(false)
            .animation(.easeInOut(duration: 2.0), value: nightMode.dimmingOpacity)
    }
}

#Preview {
    RootView()
        .environment(AppState())
        .environment(NightModeManager())
}
