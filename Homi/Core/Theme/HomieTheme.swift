// HomiTheme.swift
// Homi
// Design system — colors, typography, spacing tokens

import SwiftUI

// MARK: - Color Palette

extension Color {
    // Primary brand colors
    static let homiPrimary = Color(hex: "#5B7FFF")       // Calm blue
    static let homiSecondary = Color(hex: "#FF6B8A")     // Warm coral
    static let homiAccent = Color(hex: "#FFB347")        // Friendly amber

    // Backgrounds
    static let homiBgPrimary = Color(hex: "#F8F9FE")     // Light mode background
    static let homiBgSecondary = Color(hex: "#FFFFFF")   // Cards
    static let homiBgTertiary = Color(hex: "#F0F1F8")    // Subtle sections

    // Dark mode backgrounds
    static let homiDarkBg = Color(hex: "#0D1117")        // Dark background
    static let homiDarkCard = Color(hex: "#161B22")      // Dark card
    static let homiDarkSurface = Color(hex: "#21262D")   // Dark surface

    // Text
    static let homiTextPrimary = Color(hex: "#1A1D29")   // Primary text (light mode)
    static let homiTextSecondary = Color(hex: "#6B7280") // Secondary text
    static let homiTextMuted = Color(hex: "#9CA3AF")     // Muted text

    // Semantic colors
    static let homiSuccess = Color(hex: "#34D399")       // Green
    static let homiWarning = Color(hex: "#FBBF24")       // Yellow
    static let homiError = Color(hex: "#F87171")         // Red
    static let homiInfo = Color(hex: "#60A5FA")          // Blue

    /// Initialize a Color from a hex string
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Typography

struct HomiFont {
    /// Large display title for headers (32pt, semibold)
    static let displayLarge = Font.system(size: 32, weight: .semibold, design: .rounded)

    /// Section headers (24pt, semibold)
    static let displayMedium = Font.system(size: 24, weight: .semibold, design: .rounded)

    /// Card titles (20pt, medium)
    static let titleLarge = Font.system(size: 20, weight: .medium, design: .rounded)

    /// Smaller titles (17pt, semibold)
    static let titleMedium = Font.system(size: 17, weight: .semibold, design: .rounded)

    /// Body text (16pt, regular)
    static let body = Font.system(size: 16, weight: .regular, design: .rounded)

    /// Body text bold (16pt, medium)
    static let bodyMedium = Font.system(size: 16, weight: .medium, design: .rounded)

    /// Secondary text (14pt, regular)
    static let caption = Font.system(size: 14, weight: .regular, design: .rounded)

    /// Small labels (12pt, medium)
    static let label = Font.system(size: 12, weight: .medium, design: .rounded)

    /// Calendar day numbers (28pt, light) — must be readable from distance
    static let calendarDay = Font.system(size: 28, weight: .light, design: .rounded)

    /// Time labels (13pt, regular, monospaced)
    static let timeLabel = Font.system(size: 13, weight: .regular, design: .monospaced)

    /// Weather temperature (36pt, thin)
    static let weatherTemp = Font.system(size: 36, weight: .thin, design: .rounded)

    /// PIN entry digits (48pt, light)
    static let pinDigit = Font.system(size: 48, weight: .light, design: .rounded)
}

// MARK: - Spacing & Layout Tokens

struct HomiSpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
    static let xxxl: CGFloat = 48

    /// Standard card padding
    static let cardPadding: CGFloat = 16

    /// Standard corner radius for cards
    static let cardRadius: CGFloat = 16

    /// Standard corner radius for buttons
    static let buttonRadius: CGFloat = 12

    /// Standard corner radius for small elements
    static let smallRadius: CGFloat = 8

    /// Avatar size in the top bar
    static let avatarSize: CGFloat = 44

    /// Tab icon size
    static let tabIconSize: CGFloat = 28
}

// MARK: - Shadows

struct HomiShadow {
    static let card = ShadowStyle(
        color: Color.black.opacity(0.06),
        radius: 12,
        x: 0,
        y: 4
    )

    static let elevated = ShadowStyle(
        color: Color.black.opacity(0.1),
        radius: 20,
        x: 0,
        y: 8
    )

    static let subtle = ShadowStyle(
        color: Color.black.opacity(0.04),
        radius: 6,
        x: 0,
        y: 2
    )
}

struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

// MARK: - View Modifiers

extension View {
    /// Apply the standard Homi card style
    func homiCard() -> some View {
        self
            .padding(HomiSpacing.cardPadding)
            .background(Color.homiBgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.cardRadius, style: .continuous))
            .shadow(
                color: HomiShadow.card.color,
                radius: HomiShadow.card.radius,
                x: HomiShadow.card.x,
                y: HomiShadow.card.y
            )
    }

    /// Apply elevated card style (for modals, popovers)
    func homiElevatedCard() -> some View {
        self
            .padding(HomiSpacing.cardPadding)
            .background(Color.homiBgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.cardRadius, style: .continuous))
            .shadow(
                color: HomiShadow.elevated.color,
                radius: HomiShadow.elevated.radius,
                x: HomiShadow.elevated.x,
                y: HomiShadow.elevated.y
            )
    }

    /// Standard Homi page background
    func homiBackground() -> some View {
        self.background(Color.homiBgPrimary.ignoresSafeArea())
    }
}
