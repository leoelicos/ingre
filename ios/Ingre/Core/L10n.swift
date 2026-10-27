import Foundation

/// Strings from the string catalog (Localizable.xcstrings), with i18next-style `{{name}}`
/// placeholders and `_one` / `_other` plural keys, as in client/src/i18n (#195). English only
/// for now; another language is another localization in the catalog.
enum L10n {
    /// The catalog lookup; tests on other platforms can swap it.
    nonisolated(unsafe) static var lookup: (String) -> String = { key in
        Bundle.main.localizedString(forKey: key, value: nil, table: nil)
    }

    static func t(_ key: String, _ args: [String: String] = [:]) -> String {
        interpolate(lookup(key), args)
    }

    /// The `_one` or `_other` form chosen by the plural rules for `count`.
    static func plural(_ key: String, count: Double, _ args: [String: String] = [:]) -> String {
        t("\(key)_\(PluralRules.english(count))", args)
    }

    /// The key's string, or `fallback` when the catalog has no such key.
    static func t(_ key: String, or fallback: String, _ args: [String: String] = [:]) -> String {
        let value = lookup(key)
        return value == key ? fallback : interpolate(value, args)
    }

    static func interpolate(_ template: String, _ args: [String: String]) -> String {
        var result = template
        for (name, value) in args {
            result = result.replacingOccurrences(of: "{{\(name)}}", with: value)
        }
        return result
    }
}

/// Plural categories the way Intl.PluralRules gives them for English: "one" only for exactly 1.
enum PluralRules {
    static func english(_ n: Double) -> String {
        n == 1 ? "one" : "other"
    }
}
