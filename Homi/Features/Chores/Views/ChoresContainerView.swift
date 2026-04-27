// ChoresContainerView.swift
// Homi
// Chore management with assignment and completion tracking

import SwiftUI
import SwiftData

struct ChoresContainerView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Chore.createdAt, order: .reverse) private var allChores: [Chore]
    @Query(sort: \FamilyMember.createdAt) private var members: [FamilyMember]

    @State private var showingAddChore = false
    @State private var selectedMemberFilter: FamilyMember?

    var body: some View {
        VStack(spacing: 0) {
            Spacer().frame(height: 70) // Header bar space

            // Filter bar
            memberFilterBar

            ScrollView {
                VStack(spacing: HomiSpacing.lg) {
                    // Progress summary
                    progressSummary

                    // Chore list grouped by member
                    if let filter = selectedMemberFilter {
                        choreSection(for: filter)
                    } else {
                        ForEach(members) { member in
                            choreSection(for: member)
                        }
                    }
                }
                .padding(HomiSpacing.lg)
            }

            // Add chore FAB
            .overlay(alignment: .bottomTrailing) {
                addChoreButton
            }
        }
        .sheet(isPresented: $showingAddChore) {
            AddChoreView()
        }
        .onAppear { resetRecurringChores() }
    }

    // MARK: - Member Filter

    private var memberFilterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: HomiSpacing.md) {
                filterChip(label: "All", isSelected: selectedMemberFilter == nil) {
                    selectedMemberFilter = nil
                }
                ForEach(members) { member in
                    filterChip(
                        label: "\(member.emoji) \(member.name)",
                        isSelected: selectedMemberFilter?.id == member.id,
                        color: Color(hex: member.colorHex)
                    ) {
                        selectedMemberFilter = member
                    }
                }
            }
            .padding(.horizontal, HomiSpacing.lg)
            .padding(.vertical, HomiSpacing.md)
        }
    }

    private func filterChip(label: String, isSelected: Bool, color: Color = .homiePrimary, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(HomiFont.bodyMedium)
                .foregroundStyle(isSelected ? .white : Color.homiTextSecondary)
                .padding(.horizontal, HomiSpacing.lg)
                .padding(.vertical, HomiSpacing.sm)
                .background(isSelected ? color : Color.homiBgTertiary)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    // MARK: - Progress Summary

    private var progressSummary: some View {
        let todayChores = allChores.filter { !$0.needsReset }
        let completed = todayChores.filter(\.isCompleted).count
        let total = todayChores.count
        let progress = total > 0 ? Double(completed) / Double(total) : 0

        return HStack(spacing: HomiSpacing.xl) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Today's Progress")
                    .font(HomiFont.titleMedium)
                    .foregroundStyle(Color.homiTextPrimary)
                Text("\(completed) of \(total) chores completed")
                    .font(HomiFont.caption)
                    .foregroundStyle(Color.homiTextSecondary)
            }

            Spacer()

            ZStack {
                Circle()
                    .stroke(Color.homiSuccess.opacity(0.2), lineWidth: 8)
                    .frame(width: 60, height: 60)
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(Color.homiSuccess, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .frame(width: 60, height: 60)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.5), value: progress)
                Text("\(Int(progress * 100))%")
                    .font(HomiFont.label)
                    .foregroundStyle(Color.homiTextPrimary)
            }
        }
        .homiCard()
    }

    // MARK: - Chore Section

    private func choreSection(for member: FamilyMember) -> some View {
        let memberChores = allChores.filter { $0.assignee?.id == member.id }
        guard !memberChores.isEmpty else { return AnyView(EmptyView()) }

        return AnyView(
            VStack(alignment: .leading, spacing: HomiSpacing.md) {
                HStack(spacing: HomiSpacing.sm) {
                    Text(member.emoji).font(.system(size: 24))
                    Text(member.name)
                        .font(HomiFont.titleMedium)
                        .foregroundStyle(Color.homiTextPrimary)

                    let done = memberChores.filter(\.isCompleted).count
                    Text("\(done)/\(memberChores.count)")
                        .font(HomiFont.label)
                        .foregroundStyle(Color.homiTextMuted)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.homiBgTertiary)
                        .clipShape(Capsule())

                    Spacer()
                }

                ForEach(memberChores) { chore in
                    choreRow(chore, memberColor: Color(hex: member.colorHex))
                }
            }
        )
    }

    private func choreRow(_ chore: Chore, memberColor: Color) -> some View {
        HStack(spacing: HomiSpacing.lg) {
            Button {
                withAnimation(.spring(response: 0.3)) {
                    toggleChoreCompletion(chore)
                }
            } label: {
                Image(systemName: chore.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 26))
                    .foregroundStyle(chore.isCompleted ? Color.homiSuccess : memberColor.opacity(0.4))
                    .symbolEffect(.bounce, value: chore.isCompleted)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 2) {
                Text(chore.title)
                    .font(HomiFont.body)
                    .foregroundStyle(chore.isCompleted ? Color.homiTextMuted : Color.homiTextPrimary)
                    .strikethrough(chore.isCompleted, color: Color.homiTextMuted)

                HStack(spacing: HomiSpacing.sm) {
                    Image(systemName: chore.frequency.icon)
                        .font(.system(size: 11))
                    Text(chore.frequency.rawValue)
                        .font(HomiFont.label)
                }
                .foregroundStyle(Color.homiTextMuted)
            }

            Spacer()

            if !appState.isAdmin {
                // Standard users see lock icon on admin-created chores
                if chore.createdBy?.isAdmin == true {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.homiTextMuted.opacity(0.5))
                }
            }
        }
        .padding(HomiSpacing.md)
        .background(Color.homiBgSecondary)
        .clipShape(RoundedRectangle(cornerRadius: HomiSpacing.smallRadius, style: .continuous))
        .contextMenu {
            if appState.isAdmin {
                Button(role: .destructive) {
                    modelContext.delete(chore)
                } label: {
                    Label("Delete", systemImage: "trash")
                }
            }
        }
    }

    // MARK: - Add Chore Button

    private var addChoreButton: some View {
        Button {
            showingAddChore = true
        } label: {
            Image(systemName: "plus")
                .font(.system(size: 24, weight: .medium))
                .foregroundStyle(.white)
                .frame(width: 56, height: 56)
                .background(Color.homiPrimary)
                .clipShape(Circle())
                .shadow(color: Color.homiPrimary.opacity(0.3), radius: 12, y: 6)
        }
        .padding(HomiSpacing.xl)
    }

    // MARK: - Logic

    private func toggleChoreCompletion(_ chore: Chore) {
        chore.isCompleted.toggle()
        chore.completedAt = chore.isCompleted ? Date() : nil

        if chore.isCompleted, let memberName = appState.currentMember?.name {
            let completion = ChoreCompletion(chore: chore, completedByName: memberName)
            modelContext.insert(completion)
        }
    }

    private func resetRecurringChores() {
        for chore in allChores {
            chore.resetIfNeeded()
        }
    }
}

// MARK: - Add Chore View

struct AddChoreView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \FamilyMember.createdAt) private var members: [FamilyMember]

    @State private var title = ""
    @State private var notes = ""
    @State private var frequency: ChoreFrequency = .daily
    @State private var selectedAssignee: FamilyMember?

    var body: some View {
        NavigationStack {
            Form {
                Section("Chore Details") {
                    TextField("What needs to be done?", text: $title)
                    TextField("Notes (optional)", text: $notes)
                }
                Section("Schedule") {
                    Picker("Frequency", selection: $frequency) {
                        ForEach(ChoreFrequency.allCases) { freq in
                            Label(freq.rawValue, systemImage: freq.icon).tag(freq)
                        }
                    }
                }
                Section("Assign To") {
                    ForEach(members) { member in
                        Button {
                            selectedAssignee = member
                        } label: {
                            HStack {
                                Text(member.emoji)
                                Text(member.name)
                                    .foregroundStyle(Color.homiTextPrimary)
                                Spacer()
                                if selectedAssignee?.id == member.id {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(Color.homiPrimary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("New Chore")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Add") { saveChore() }
                        .font(HomiFont.bodyMedium)
                        .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func saveChore() {
        let chore = Chore(
            title: title.trimmingCharacters(in: .whitespaces),
            notes: notes,
            frequency: frequency,
            assignee: selectedAssignee,
            createdBy: appState.currentMember
        )
        modelContext.insert(chore)
        dismiss()
    }
}
