// LockScreenView.swift
// Homi
// PIN entry lock screen with family member selection

import SwiftUI
import SwiftData

struct LockScreenView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \FamilyMember.createdAt) private var members: [FamilyMember]

    @State private var selectedMember: FamilyMember?
    @State private var pin: String = ""
    @State private var showError: Bool = false
    @State private var isVerifying: Bool = false

    private let pinLength = 4

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color.homiPrimary.opacity(0.08),
                    Color.homiBgPrimary,
                    Color.homiSecondary.opacity(0.05)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: HomiSpacing.xxxl) {
                Spacer()
                logoSection
                memberAvatarScroll

                if selectedMember != nil {
                    pinEntrySection
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                }

                Spacer()
                clockSection
                Spacer().frame(height: HomiSpacing.xxl)
            }
        }
    }

    // MARK: - Sections

    private var logoSection: some View {
        VStack(spacing: HomiSpacing.lg) {
            Text("🏠").font(.system(size: 64))
            Text("Homi")
                .font(.system(size: 42, weight: .semibold, design: .rounded))
                .foregroundStyle(Color.homiTextPrimary)
            Text("Who's checking in?")
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextSecondary)
        }
    }

    private var memberAvatarScroll: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: HomiSpacing.xl) {
                ForEach(members) { member in
                    memberAvatar(member)
                }
            }
            .padding(.horizontal, HomiSpacing.xxl)
        }
    }

    private var pinEntrySection: some View {
        VStack(spacing: HomiSpacing.xl) {
            HStack(spacing: HomiSpacing.lg) {
                ForEach(0..<pinLength, id: \.self) { index in
                    Circle()
                        .fill(index < pin.count ? Color.homiPrimary : Color.homiTextMuted.opacity(0.3))
                        .frame(width: 20, height: 20)
                        .scaleEffect(index < pin.count ? 1.2 : 1.0)
                        .animation(.spring(response: 0.2), value: pin.count)
                }
            }
            .modifier(ShakeEffect(shakes: showError ? 4 : 0))
            .animation(.easeInOut(duration: 0.4), value: showError)

            if showError {
                Text("Incorrect PIN")
                    .font(HomiFont.caption)
                    .foregroundStyle(Color.homiError)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }

            numberPad
        }
    }

    private var clockSection: some View {
        VStack(spacing: HomiSpacing.sm) {
            Text(Date(), format: .dateTime.hour().minute())
                .font(.system(size: 64, weight: .ultraLight, design: .rounded))
                .foregroundStyle(Color.homiTextPrimary.opacity(0.6))
                .monospacedDigit()
            Text(Date(), format: .dateTime.weekday(.wide).month(.wide).day())
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextSecondary)
        }
    }

    // MARK: - Member Avatar

    private func memberAvatar(_ member: FamilyMember) -> some View {
        let isSelected = selectedMember?.id == member.id

        return Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                selectedMember = member
                pin = ""
                showError = false
            }
        } label: {
            VStack(spacing: HomiSpacing.sm) {
                Text(member.emoji)
                    .font(.system(size: isSelected ? 48 : 40))
                    .frame(width: 80, height: 80)
                    .background(
                        Circle().fill(Color(hex: member.colorHex).opacity(isSelected ? 0.25 : 0.12))
                    )
                    .overlay {
                        Circle().stroke(
                            isSelected ? Color(hex: member.colorHex) : Color.clear,
                            lineWidth: 3
                        )
                    }
                    .scaleEffect(isSelected ? 1.1 : 1.0)

                Text(member.name)
                    .font(isSelected ? HomiFont.bodyMedium : HomiFont.body)
                    .foregroundStyle(isSelected ? Color.homiTextPrimary : Color.homiTextSecondary)

                if member.isAdmin {
                    Text("Admin")
                        .font(HomiFont.label)
                        .foregroundStyle(Color.homiPrimary)
                }
            }
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isSelected)
    }

    // MARK: - Number Pad

    private var numberPad: some View {
        let buttons: [[String]] = [
            ["1", "2", "3"], ["4", "5", "6"],
            ["7", "8", "9"], ["", "0", "⌫"]
        ]
        return VStack(spacing: HomiSpacing.md) {
            ForEach(buttons, id: \.self) { row in
                HStack(spacing: HomiSpacing.md) {
                    ForEach(row, id: \.self) { button in
                        if button.isEmpty {
                            Color.clear.frame(width: 80, height: 80)
                        } else {
                            numberButton(button)
                        }
                    }
                }
            }
        }
    }

    private func numberButton(_ value: String) -> some View {
        Button {
            handleButtonTap(value)
        } label: {
            Group {
                if value == "⌫" {
                    Image(systemName: "delete.left")
                        .font(.system(size: 24))
                        .foregroundStyle(Color.homiTextSecondary)
                } else {
                    Text(value)
                        .font(HomiFont.pinDigit)
                        .foregroundStyle(Color.homiTextPrimary)
                }
            }
            .frame(width: 80, height: 80)
            .background(Circle().fill(Color.homiBgTertiary))
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.impact(flexibility: .soft), trigger: pin.count)
    }

    // MARK: - Logic

    private func handleButtonTap(_ value: String) {
        guard let member = selectedMember else { return }
        if value == "⌫" {
            if !pin.isEmpty { pin.removeLast(); showError = false }
        } else {
            guard pin.count < pinLength else { return }
            pin += value
            if pin.count == pinLength { verifyPIN(for: member) }
        }
    }

    private func verifyPIN(for member: FamilyMember) {
        isVerifying = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            if KeychainService.verifyPin(pin, for: member.id) {
                withAnimation(.spring(response: 0.4)) {
                    appState.currentMember = member
                }
            } else {
                withAnimation { showError = true }
                pin = ""
                UINotificationFeedbackGenerator().notificationOccurred(.error)
            }
            isVerifying = false
        }
    }
}

// MARK: - Shake Effect

struct ShakeEffect: GeometryEffect {
    var shakes: CGFloat
    var animatableData: CGFloat {
        get { shakes }
        set { shakes = newValue }
    }
    func effectValue(size: CGSize) -> ProjectionTransform {
        ProjectionTransform(CGAffineTransform(translationX: sin(shakes * .pi * 2) * 10, y: 0))
    }
}
