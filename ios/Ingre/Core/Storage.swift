import Foundation

/// The web app's localStorage keys (client/src/utils/storage/shoppingState.ts), used as file
/// names so both native apps keep the same shape of data (#195).
enum StorageKey: String, CaseIterable, Sendable {
    case copies = "ingre.list.copies"
    case extras = "ingre.list.extras"
    case crossed = "ingre.chips.crossed"
    case edits = "ingre.chips.edits"
}

/// Raw JSON values by key.
protocol KeyValueStore: Sendable {
    func read(_ key: StorageKey) -> Data?
    func write(_ key: StorageKey, _ data: Data)
}

/// Codable files in Application Support, one per key: `ingre.list.copies.json`.
struct FileStore: KeyValueStore {
    let directory: URL

    init(directory: URL? = nil) {
        let base =
            directory
            ?? FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Ingre", isDirectory: true)
        try? FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        self.directory = base
    }

    private func url(_ key: StorageKey) -> URL {
        directory.appendingPathComponent("\(key.rawValue).json")
    }

    func read(_ key: StorageKey) -> Data? {
        try? Data(contentsOf: url(key))
    }

    func write(_ key: StorageKey, _ data: Data) {
        try? data.write(to: url(key), options: .atomic)
    }
}

/// For tests and UI-test launches: nothing touches the disk.
final class MemoryStore: KeyValueStore, @unchecked Sendable {
    private let lock = NSLock()
    private var values: [StorageKey: Data]

    init(_ values: [StorageKey: Data] = [:]) {
        self.values = values
    }

    func read(_ key: StorageKey) -> Data? {
        lock.withLock { values[key] }
    }

    func write(_ key: StorageKey, _ data: Data) {
        lock.withLock { values[key] = data }
    }
}

/// The list as stored: copies, extras, crossed-off chips and category edits.
struct ListState: Equatable, Sendable {
    var copies: [RecipeCopy] = []
    var extras: [Extra] = []
    var crossed: Set<String> = []
    var edits: [String: ChipEdit] = [:]
}

/// Typed access to the store. Bad, missing or unreadable values yield the default, as on the web.
struct ListStorage: Sendable {
    let store: any KeyValueStore

    private func decode<T: Decodable>(_ type: T.Type, _ key: StorageKey) -> T? {
        guard let data = store.read(key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }

    private struct LenientCopy: Decodable {
        var recipeId: String?
        var portions: Double?
        var amounts: [String: Double?]?
    }

    private struct LenientExtra: Decodable {
        var id: String?
        var name: String?
        var ingredientId: String?
        var quantity: Double?
    }

    func load() -> ListState {
        var state = ListState()
        var seen: Set<String> = []
        for raw in decode([LenientCopy?].self, .copies) ?? [] {
            guard let raw, let id = raw.recipeId, let portions = raw.portions, !seen.contains(id) else { continue }
            seen.insert(id)
            let amounts = (raw.amounts ?? [:]).compactMapValues { $0 }.filter { $0.value.isFinite && $0.value >= 0 }
            state.copies.append(
                RecipeCopy(recipeId: id, portions: RecipeCopy.clampPortions(portions), amounts: amounts))
        }
        for raw in decode([LenientExtra?].self, .extras) ?? [] {
            guard let raw, let id = raw.id, let name = raw.name, let quantity = raw.quantity,
                quantity > 0, quantity == quantity.rounded()
            else { continue }
            state.extras.append(Extra(id: id, name: name, ingredientId: raw.ingredientId, quantity: Int(quantity)))
        }
        state.crossed = Set(decode([String].self, .crossed) ?? [])
        let edits = decode([String: [String: String?]].self, .edits) ?? [:]
        for (id, edit) in edits {
            if let raw = edit["section"].flatMap({ $0 }), let section = ShopSection(rawValue: raw) {
                state.edits[id] = ChipEdit(section: section)
            }
        }
        return state
    }

    func save(_ state: ListState) {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .sortedKeys
        if let data = try? encoder.encode(state.copies) { store.write(.copies, data) }
        if let data = try? encoder.encode(state.extras) { store.write(.extras, data) }
        if let data = try? encoder.encode(state.crossed.sorted()) { store.write(.crossed, data) }
        if let data = try? encoder.encode(state.edits) { store.write(.edits, data) }
    }
}
