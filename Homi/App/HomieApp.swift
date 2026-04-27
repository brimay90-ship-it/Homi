// HomiApp.swift
// Homi — Wall-mounted family calendar for iPadOS
// App entry point

import SwiftUI
import SwiftData

@main
struct HomiApp: App {
    @State private var appState = AppState()
    @State private var nightModeManager = NightModeManager()

    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            FamilyMember.self,
            Chore.self,
            ChoreCompletion.self,
            MealEntry.self,
            GroceryItem.self,
            AppSettings.self
        ])
        let modelConfiguration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false
        )

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appState)
                .environment(nightModeManager)
                .preferredColorScheme(nightModeManager.isNightMode ? .dark : .light)
                .onAppear {
                    // Prevent screen from sleeping — always-on display
                    UIApplication.shared.isIdleTimerDisabled = true
                    nightModeManager.startMonitoring()
                }
        }
        .modelContainer(sharedModelContainer)
    }
}
