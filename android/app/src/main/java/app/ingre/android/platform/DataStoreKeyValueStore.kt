package app.ingre.android.platform

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import app.ingre.android.core.KeyValueStore
import app.ingre.android.core.StorageKey
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

/**
 * The list in Preferences DataStore under the web app's localStorage keys, as the same JSON
 * (#195). The values are read once when the app starts (a few small strings), then served from
 * memory; every change is written back in the background.
 */
class DataStoreKeyValueStore(
    private val dataStore: DataStore<Preferences>,
    private val scope: CoroutineScope
) : KeyValueStore {
    private val cache = ConcurrentHashMap<StorageKey, String>()

    init {
        val prefs = runBlocking { dataStore.data.first() }
        for (key in StorageKey.entries) prefs[stringPreferencesKey(key.key)]?.let { cache[key] = it }
    }

    override fun read(key: StorageKey): String? = cache[key]

    override fun write(key: StorageKey, value: String) {
        if (cache[key] == value) return
        cache[key] = value
        scope.launch { dataStore.edit { it[stringPreferencesKey(key.key)] = value } }
    }
}
