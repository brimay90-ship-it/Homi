// OnboardingView.swift
// Homi
// First-run setup wizard for creating admin profile

import SwiftUI
import SwiftData

struct OnboardingView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.modelContext) private var modelContext

    @State private var step: OnboardingStep = .welcome
    @State private var name: String = ""
    @State private var selectedEmoji: String = "😊"
    @State private var selectedColorHex: String = FamilyMember.presetColors[0].hex
    @State private var pin: String = ""
    @State private var confirmPin: String = ""
    @State private var pinMismatch: Bool = false

    enum OnboardingStep: Int, CaseIterable {
        case welcome, profile, color, pin, confirmPinStep, done

        var title: String {
            switch self {
            case .welcome: return "Welcome to Homi"
            case .profile: return "Create Your Profile"
            case .color: return "Pick Your Color"
            case .pin: return "Set Your PIN"
            case .confirmPinStep: return "Confirm PIN"
            case .done: return "You're All Set!"
            }
        }
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.homiPrimary.opacity(0.06), Color.homiBgPrimary],
                startPoint: .top, endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: HomiSpacing.xxl) {
                // Progress indicator
                progressDots

                Spacer()

                // Step content
                Group {
                    switch step {
                    case .welcome: welcomeStep
                    case .profile: profileStep
                    case .color: colorStep
                    case .pin: pinStep
                    case .confirmPinStep: confirmPinView
                    case .done: doneStep
                    }
                }
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing).combined(with: .opacity),
                    removal: .move(edge: .leading).combined(with: .opacity)
                ))

                Spacer()

                // Navigation buttons
                navigationButtons
            }
            .padding(HomiSpacing.xxl)
        }
    }

    // MARK: - Progress Dots

    private var progressDots: some View {
        HStack(spacing: HomiSpacing.sm) {
            ForEach(OnboardingStep.allCases, id: \.rawValue) { s in
                Circle()
                    .fill(s.rawValue <= step.rawValue ? Color.homiPrimary : Color.homiTextMuted.opacity(0.3))
                    .frame(width: 10, height: 10)
                    .scaleEffect(s == step ? 1.3 : 1.0)
                    .animation(.spring(response: 0.3), value: step)
            }
        }
        .padding(.top, HomiSpacing.xl)
    }

    // MARK: - Steps

    private var welcomeStep: some View {
        VStack(spacing: HomiSpacing.xl) {
            Text("🏠").font(.system(size: 80))
            Text("Welcome to Homi")
                .font(HomiFont.displayLarge)
                .foregroundStyle(Color.homiTextPrimary)
            Text("Your family's command center.\nLet's set up the first admin account.")
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextSecondary)
                .multilineTextAlignment(.center)
        }
    }

    private var profileStep: some View {
        VStack(spacing: HomiSpacing.xl) {
            Text(selectedEmoji).font(.system(size: 72))

            Text("What's your name?")
                .font(HomiFont.displayMedium)
                .foregroundStyle(Color.homiTextPrimary)

            TextField("Your name", text: $name)
                .font(HomiFont.titleLarge)
                .multilineTextAlignment(.center)
                .padding()
                .background(Color.homiBgTertiary)
                .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.buttonRadius))
                .frame(maxWidth: 300)

            Text("Pick an emoji")
                .font(HomiFont.caption)
                .foregroundStyle(Color.homiTextSecondary)

            LazyVGrid(columns: Array(repeating: GridItem(.fixed(52)), count: 5), spacing: HomiSpacing.md) {
                ForEach(FamilyMember.presetEmojis, id: \.self) { emoji in
                    Button {
                        selectedEmoji = emoji
                    } label: {
                        Text(emoji)
                            .font(.system(size: 28))
                            .frame(width: 48, height: 48)
                            .background(
                                Circle().fill(selectedEmoji == emoji ? Color.homiPrimary.opacity(0.15) : Color.clear)
                            )
                            .overlay {
                                Circle().stroke(selectedEmoji == emoji ? Color.homiPrimary : Color.clear, lineWidth: 2)
                            }
                    }
                    .buttonStyle(.plain)
                }
            }
            .frame(maxWidth: 320)
        }
    }

    private var colorStep: some View {
        VStack(spacing: HomiSpacing.xl) {
            Text(selectedEmoji)
                .font(.system(size: 64))
                .frame(width: 100, height: 100)
                .background(Circle().fill(Color(hex: selectedColorHex).opacity(0.2)))

            Text("Pick your color")
                .font(HomiFont.displayMedium)
                .foregroundStyle(Color.homiTextPrimary)

            Text("Events and chores will use this color")
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextSecondary)

            LazyVGrid(columns: Array(repeating: GridItem(.fixed(72)), count: 4), spacing: HomiSpacing.lg) {
                ForEach(FamilyMember.presetColors, id: \.hex) { color in
                    Button {
                        selectedColorHex = color.hex
                    } label: {
                        VStack(spacing: 4) {
                            Circle()
                                .fill(Color(hex: color.hex))
                                .frame(width: 48, height: 48)
                                .overlay {
                                    if selectedColorHex == color.hex {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 20, weight: .bold))
                                            .foregroundStyle(.white)
                                    }
                                }
                            Text(color.name)
                                .font(HomiFont.label)
                                .foregroundStyle(Color.homiTextSecondary)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .frame(maxWidth: 360)
        }
    }

    private var pinStep: some View {
        VStack(spacing: HomiSpacing.xl) {
            Image(systemName: "lock.shield")
                .font(.system(size: 48))
                .foregroundStyle(Color.homiPrimary)

            Text("Set a 4-digit PIN")
                .font(HomiFont.displayMedium)
                .foregroundStyle(Color.homiTextPrimary)

            Text("This PIN gives you admin access")
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextSecondary)

            pinDots(for: pin)
            inlineNumberPad(binding: $pin, maxLength: 4)
        }
    }

    private var confirmPinView: some View {
        VStack(spacing: HomiSpacing.xl) {
            Image(systemName: "lock.shield.fill")
                .font(.system(size: 48))
                .foregroundStyle(Color.homiPrimary)

            Text("Confirm your PIN")
                .font(HomiFont.displayMedium)
                .foregroundStyle(Color.homiTextPrimary)

            if pinMismatch {
                Text("PINs don't match — try again")
                    .font(HomiFont.caption)
                    .foregroundStyle(Color.homiError)
            }

            pinDots(for: confirmPin)
            inlineNumberPad(binding: $confirmPin, maxLength: 4)
        }
    }

    private var doneStep: some View {
        VStack(spacing: HomiSpacing.xl) {
            Text("🎉").font(.system(size: 80))

            Text("You're all set!")
                .font(HomiFont.displayLarge)
                .foregroundStyle(Color.homiTextPrimary)

            HStack(spacing: HomiSpacing.md) {
                Text(selectedEmoji).font(.system(size: 36))
                VStack(alignment: .leading) {
                    Text(name).font(HomiFont.titleLarge).foregroundStyle(Color.homiTextPrimary)
                    Text("Admin").font(HomiFont.caption).foregroundStyle(Color.homiPrimary)
                }
            }
            .padding()
            .background(Color(hex: selectedColorHex).opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.cardRadius))

            Text("You can add more family members from Settings.")
                .font(HomiFont.body)
                .foregroundStyle(Color.homiTextSecondary)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: - Reusable Components

    private func pinDots(for value: String) -> some View {
        HStack(spacing: HomiSpacing.lg) {
            ForEach(0..<4, id: \.self) { i in
                Circle()
                    .fill(i < value.count ? Color.homiPrimary : Color.homiTextMuted.opacity(0.3))
                    .frame(width: 18, height: 18)
                    .scaleEffect(i < value.count ? 1.2 : 1.0)
                    .animation(.spring(response: 0.2), value: value.count)
            }
        }
    }

    private func inlineNumberPad(binding: Binding<String>, maxLength: Int) -> some View {
        let rows: [[String]] = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]]
        return VStack(spacing: HomiSpacing.sm) {
            ForEach(rows, id: \.self) { row in
                HStack(spacing: HomiSpacing.sm) {
                    ForEach(row, id: \.self) { btn in
                        if btn.isEmpty {
                            Color.clear.frame(width: 64, height: 64)
                        } else {
                            Button {
                                if btn == "⌫" {
                                    if !binding.wrappedValue.isEmpty { binding.wrappedValue.removeLast() }
                                } else if binding.wrappedValue.count < maxLength {
                                    binding.wrappedValue += btn
                                }
                            } label: {
                                Group {
                                    if btn == "⌫" {
                                        Image(systemName: "delete.left").font(.system(size: 20))
                                    } else {
                                        Text(btn).font(.system(size: 28, weight: .light, design: .rounded))
                                    }
                                }
                                .foregroundStyle(Color.homiTextPrimary)
                                .frame(width: 64, height: 64)
                                .background(Circle().fill(Color.homiBgTertiary))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Navigation Buttons

    private var navigationButtons: some View {
        HStack {
            if step != .welcome {
                Button {
                    withAnimation(.spring(response: 0.4)) {
                        goBack()
                    }
                } label: {
                    HStack {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                    .font(HomiFont.bodyMedium)
                    .foregroundStyle(Color.homiTextSecondary)
                    .padding(.horizontal, HomiSpacing.xl)
                    .padding(.vertical, HomiSpacing.md)
                }
            }

            Spacer()

            Button {
                withAnimation(.spring(response: 0.4)) {
                    goForward()
                }
            } label: {
                HStack {
                    Text(step == .done ? "Get Started" : "Next")
                    Image(systemName: step == .done ? "arrow.right.circle.fill" : "chevron.right")
                }
                .font(HomiFont.bodyMedium)
                .foregroundStyle(.white)
                .padding(.horizontal, HomiSpacing.xl)
                .padding(.vertical, HomiSpacing.md)
                .background(canProceed ? Color.homiPrimary : Color.homiTextMuted)
                .clipShape(Capsule())
            }
            .disabled(!canProceed)
        }
        .padding(.bottom, HomiSpacing.lg)
    }

    // MARK: - Navigation Logic

    private var canProceed: Bool {
        switch step {
        case .welcome: return true
        case .profile: return !name.trimmingCharacters(in: .whitespaces).isEmpty
        case .color: return true
        case .pin: return pin.count == 4
        case .confirmPinStep: return confirmPin.count == 4
        case .done: return true
        }
    }

    private func goForward() {
        switch step {
        case .welcome: step = .profile
        case .profile: step = .color
        case .color: step = .pin
        case .pin: step = .confirmPinStep
        case .confirmPinStep:
            if pin == confirmPin {
                pinMismatch = false
                step = .done
            } else {
                pinMismatch = true
                confirmPin = ""
            }
        case .done:
            createAdminAndFinish()
        }
    }

    private func goBack() {
        switch step {
        case .welcome: break
        case .profile: step = .welcome
        case .color: step = .profile
        case .pin: step = .color
        case .confirmPinStep: step = .pin; confirmPin = ""
        case .done: step = .confirmPinStep
        }
    }

    private func createAdminAndFinish() {
        let member = FamilyMember(
            name: name.trimmingCharacters(in: .whitespaces),
            emoji: selectedEmoji,
            colorHex: selectedColorHex,
            accessLevel: .admin
        )
        modelContext.insert(member)
        KeychainService.storePin(pin, for: member.id)

        try? modelContext.save()

        appState.hasCompletedOnboarding = true
        appState.currentMember = member
    }
}

#Preview {
    OnboardingView()
        .environment(AppState())
}
