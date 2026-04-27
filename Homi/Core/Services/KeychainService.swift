// KeychainService.swift
// Homi
// Secure PIN storage using iOS Keychain

import Foundation
import Security
import CryptoKit

/// Service for securely storing and verifying family member PINs
struct KeychainService {
    private static let serviceName = "com.homi.familypin"

    // MARK: - Public API

    /// Store a PIN for a family member (hashed before storage)
    /// - Parameters:
    ///   - pin: The 4-digit PIN string
    ///   - memberID: The family member's UUID
    /// - Returns: Whether the operation succeeded
    @discardableResult
    static func storePin(_ pin: String, for memberID: UUID) -> Bool {
        let hashedPin = hashPin(pin, salt: memberID.uuidString)

        // Delete existing PIN if present
        deletePin(for: memberID)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: memberID.uuidString,
            kSecValueData as String: hashedPin.data(using: .utf8)!,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }

    /// Verify a PIN against the stored hash
    /// - Parameters:
    ///   - pin: The PIN to verify
    ///   - memberID: The family member's UUID
    /// - Returns: Whether the PIN matches
    static func verifyPin(_ pin: String, for memberID: UUID) -> Bool {
        guard let storedHash = retrieveHash(for: memberID) else { return false }
        let inputHash = hashPin(pin, salt: memberID.uuidString)
        return storedHash == inputHash
    }

    /// Delete the stored PIN for a family member
    /// - Parameter memberID: The family member's UUID
    @discardableResult
    static func deletePin(for memberID: UUID) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: memberID.uuidString
        ]

        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess || status == errSecItemNotFound
    }

    /// Check if a PIN exists for a family member
    static func hasPin(for memberID: UUID) -> Bool {
        retrieveHash(for: memberID) != nil
    }

    // MARK: - Private Helpers

    /// Hash a PIN using SHA-256 with a salt (member UUID)
    private static func hashPin(_ pin: String, salt: String) -> String {
        let input = "\(salt):\(pin)"
        let data = Data(input.utf8)
        let hash = SHA256.hash(data: data)
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }

    /// Retrieve the stored hash for a member
    private static func retrieveHash(for memberID: UUID) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: memberID.uuidString,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let hash = String(data: data, encoding: .utf8) else {
            return nil
        }

        return hash
    }
}
