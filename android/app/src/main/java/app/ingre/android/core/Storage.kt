package app.ingre.android.core

import java.util.concurrent.ConcurrentHashMap
import kotlin.math.floor
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonPrimitive

/**
 * The web app's localStorage keys (client/src/utils/storage/shoppingState.ts). The app keeps
 * the same JSON under the same keys, in DataStore (#195).
 */
enum class StorageKey(val key: String) {
    Copies("ingre.list.copies"),
    Extras("ingre.list.extras"),
    Crossed("ingre.chips.crossed"),
    Edits("ingre.chips.edits")
}

/** Raw JSON strings by key. */
interface KeyValueStore {
    fun read(key: StorageKey): String?

    fun write(key: StorageKey, value: String)
}

/** For tests and UI tests: nothing touches the disk. */
class MemoryStore(values: Map<StorageKey, String> = emptyMap()) : KeyValueStore {
    private val values = ConcurrentHashMap(values)

    override fun read(key: StorageKey): String? = values[key]

    override fun write(key: StorageKey, value: String) {
        values[key] = value
    }
}

/** The list as stored: copies, extras, crossed-off chips and category edits. */
data class ListState(
    val copies: List<RecipeCopy> = emptyList(),
    val extras: List<Extra> = emptyList(),
    val crossed: Set<String> = emptySet(),
    val edits: Map<String, ChipEdit> = emptyMap()
)

/** Typed access to the store. Bad, missing or unreadable values yield the default, as on the web. */
class ListStorage(private val store: KeyValueStore) {
    private val json = Json { encodeDefaults = true }

    private fun element(key: StorageKey): JsonElement? =
        store.read(key)?.let { runCatching { Json.parseToJsonElement(it) }.getOrNull() }

    private fun JsonObject.number(name: String): Double? =
        (this[name] as? JsonPrimitive)?.takeIf { !it.isString && it.booleanOrNull == null }?.doubleOrNull

    private fun JsonObject.string(name: String): String? = (this[name] as? JsonPrimitive)?.takeIf {
        it.isString
    }?.content

    fun load(): ListState {
        val seen = mutableSetOf<String>()
        val copies = (element(StorageKey.Copies) as? JsonArray).orEmpty().mapNotNull { raw ->
            val obj = raw as? JsonObject ?: return@mapNotNull null
            val id = obj.string("recipeId") ?: return@mapNotNull null
            val portions = obj.number("portions") ?: return@mapNotNull null
            if (!seen.add(id)) return@mapNotNull null
            val amounts = (obj["amounts"] as? JsonObject).orEmpty().mapNotNull { (k, v) ->
                val n = (v as? JsonPrimitive)?.takeIf { !it.isString && v !is JsonNull }?.doubleOrNull
                if (n != null && n.isFinite() && n >= 0) k to n else null
            }.toMap()
            RecipeCopy(id, RecipeCopy.clampPortions(portions), amounts)
        }
        val extras = (element(StorageKey.Extras) as? JsonArray).orEmpty().mapNotNull { raw ->
            val obj = raw as? JsonObject ?: return@mapNotNull null
            val id = obj.string("id") ?: return@mapNotNull null
            val name = obj.string("name") ?: return@mapNotNull null
            val quantity = obj.number("quantity") ?: return@mapNotNull null
            if (quantity <= 0 || quantity != floor(quantity)) return@mapNotNull null
            Extra(id, name, obj.string("ingredientId"), quantity.toInt())
        }
        val crossed = (element(StorageKey.Crossed) as? JsonArray)?.let { array ->
            if (array.all {
                    it is JsonPrimitive && it.isString
                }
            ) {
                array.map { it.jsonPrimitive.content }.toSet()
            } else {
                null
            }
        } ?: emptySet()
        val edits = (element(StorageKey.Edits) as? JsonObject).orEmpty().mapNotNull { (id, edit) ->
            val raw = (edit as? JsonObject)?.string("section") ?: return@mapNotNull null
            ShopSection.fromRaw(raw)?.let { id to ChipEdit(it) }
        }.toMap()
        return ListState(copies, extras, crossed, edits)
    }

    fun save(state: ListState) {
        store.write(
            StorageKey.Copies,
            json.encodeToString(
                state.copies.map {
                    it.copy(amounts = it.amounts.toSortedMap().toMap())
                }
            )
        )
        store.write(StorageKey.Extras, json.encodeToString(state.extras))
        store.write(StorageKey.Crossed, json.encodeToString(state.crossed.sorted()))
        store.write(StorageKey.Edits, json.encodeToString(state.edits.toSortedMap().toMap()))
    }
}
