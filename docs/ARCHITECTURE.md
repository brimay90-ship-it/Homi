# Architecture: Homi

## Overview

Homi follows **MVVM with @Observable** — Apple's recommended pattern for SwiftUI apps targeting iOS 17+. All state management uses the Swift Observation framework, eliminating the legacy `ObservableObject` / `@Published` boilerplate.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    HomiApp                          │
│                  (App Entry Point)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Router   │  │AppState  │  │ NightModeManager │  │
│  │(NavigationStack)│ │(@Observable)│ │  (Timer-based)  │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                  │            │
├───────┴──────────────┴──────────────────┴────────────┤
│                    Features/                         │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │  Calendar    │ │  Chores     │ │  MealPlanner  │  │
│  │  ├─Views     │ │  ├─Views    │ │  ├─Views      │  │
│  │  ├─ViewModels│ │  ├─ViewModels│ │  ├─ViewModels │  │
│  │  └─Models    │ │  └─Models   │ │  └─Models     │  │
│  └─────────────┘ └─────────────┘ └───────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │  Grocery     │ │  Weather    │ │  Family       │  │
│  │  ├─Views     │ │  ├─Views    │ │  ├─Views      │  │
│  │  ├─ViewModels│ │  ├─ViewModels│ │  ├─ViewModels │  │
│  │  └─Models    │ │  └─Models   │ │  └─Models     │  │
│  └─────────────┘ └─────────────┘ └───────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                     Core/                           │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────┐ │
│  │  Services/    │ │  Extensions/   │ │  Theme/    │ │
│  │  ├─EventKit   │ │  ├─Date+       │ │  ├─Colors  │ │
│  │  ├─Keychain   │ │  ├─View+       │ │  ├─Fonts   │ │
│  │  ├─BLE        │ │  └─String+     │ │  └─Tokens  │ │
│  │  └─Weather    │ │               │ │            │ │
│  └──────────────┘ └───────────────┘ └────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│                  Persistence                        │
│           SwiftData ModelContainer                  │
│  ┌────────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ │
│  │FamilyMember│ │  Chore  │ │MealEntry│ │Grocery │ │
│  └────────────┘ └────────┘ └─────────┘ └────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### App Layer
- `HomiApp.swift` — App entry point, sets up SwiftData ModelContainer, injects environment objects
- `AppState.swift` — Global @Observable state: current user, active tab, night mode status
- `Router.swift` — NavigationStack-based routing with type-safe Route enum

### Feature Modules
Each feature is self-contained with its own Views, ViewModels, and Models:

| Module | Purpose |
|--------|---------|
| `Calendar` | Month/Week/Day views, EventKit integration |
| `Family` | Profile management, PIN entry, onboarding wizard |
| `Chores` | Chore CRUD, assignment, completion tracking |
| `MealPlanner` | Weekly meal grid, meal entry editing |
| `Grocery` | Shared grocery list with categories |
| `Weather` | WeatherKit integration, forecast display |

### Core Services
- **CalendarService** — Wraps EventKit, manages permissions, fetches/caches events
- **KeychainService** — Secure PIN storage and retrieval
- **BLERelayService** — CoreBluetooth peripheral for receiving calendar data
- **WeatherService** — WeatherKit wrapper with caching
- **AccessControlService** — Enforces admin vs. standard permissions

### Persistence (SwiftData)
All on-device data uses SwiftData with a single ModelContainer:

```swift
@Model class FamilyMember {
    var id: UUID
    var name: String
    var emoji: String        // Avatar emoji
    var colorHex: String     // Profile color
    var accessLevel: AccessLevel  // .admin or .standard
    var createdAt: Date
}

@Model class Chore {
    var id: UUID
    var title: String
    var notes: String
    var assignee: FamilyMember?
    var frequency: ChoreFrequency  // .once, .daily, .weekly
    var isCompleted: Bool
    var completedAt: Date?
    var createdBy: FamilyMember?
    var createdAt: Date
}

@Model class MealEntry {
    var id: UUID
    var date: Date
    var mealType: MealType  // .breakfast, .lunch, .dinner
    var title: String
    var notes: String
}

@Model class GroceryItem {
    var id: UUID
    var name: String
    var category: GroceryCategory
    var isChecked: Bool
    var addedBy: FamilyMember?
    var addedAt: Date
}
```

---

## Navigation Architecture

```swift
enum AppTab: String, CaseIterable {
    case calendar
    case chores
    case meals
    case grocery
}

enum Route: Hashable {
    case eventDetail(EKEvent)
    case choreDetail(Chore)
    case familySettings
    case appSettings
    case addChore
    case addMeal(Date)
}
```

The app uses a **TabView** as the primary navigation container with a custom sidebar/tab bar optimized for portrait iPad. Each tab manages its own NavigationStack.

---

## Data Flow

```
EventKit (System Calendars)
    │
    ▼
CalendarService (@Observable)
    │
    ▼
CalendarViewModel (@Observable)  ◄── watches CalendarService
    │
    ▼
CalendarView (SwiftUI)  ◄── @Bindable viewModel
```

### Key Principles:
1. **Services** own the data source (EventKit, WeatherKit, SwiftData)
2. **ViewModels** transform service data for presentation
3. **Views** bind to ViewModels via `@Bindable` or `@State`
4. **No direct service calls from Views** — always through ViewModels
5. **Access control checks** happen in ViewModels before mutations

---

## Security Model

```
PIN Entry ──► KeychainService.verify(pin:) ──► AccessLevel
                                                   │
                                          ┌────────┴────────┐
                                          │                  │
                                       Admin             Standard
                                     (full CRUD)      (limited: no
                                                       delete, no
                                                       settings)
```

- PINs are hashed before Keychain storage
- No plaintext PIN ever persisted
- PIN prompt triggers on destructive actions for standard users
- Admin PIN can override any action

---

## BLE Architecture (v1 — iPad Side Only)

```
iPad (Peripheral)                    iPhone (Central) [v1.1]
┌────────────────┐                  ┌──────────────────┐
│ BLERelayService│◄── BLE ────────►│ Companion App     │
│                │                  │ (fetches calendar │
│ GATT Service:  │                  │  over cellular,   │
│  - CalendarData│                  │  pushes via BLE)  │
│  - SyncStatus  │                  └──────────────────┘
│  - DeviceInfo  │
└────────────────┘
```

Custom GATT Service UUID: `0xHOME` (to be defined)
- Characteristic: CalendarPayload (write, notify) — JSON-encoded event data
- Characteristic: SyncTimestamp (read) — last successful sync time
- Characteristic: DeviceIdentifier (read) — pairing verification

---

## Minimum Deployment & Dependencies

| Dependency | Source | Purpose |
|------------|--------|---------|
| EventKit | System | Calendar data |
| WeatherKit | System | Weather forecasts |
| CoreBluetooth | System | BLE communication |
| CoreLocation | System | Weather location |
| SwiftData | System | On-device persistence |
| Security (Keychain) | System | PIN storage |

**Zero third-party dependencies.** Everything uses Apple's native frameworks.
