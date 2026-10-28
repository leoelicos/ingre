package com.leoelicos.ingre.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

private val Context.listStore by preferencesDataStore(name = "shopping")

data class ShopItem(
    val name: String,
    val quantity: Float = 1f,
    val measure: String = "",
    val section: String = "Other",
    val crossed: Boolean = false,
    val sources: List<String> = emptyList()
)

object ShoppingListStore {
    private val _items = MutableStateFlow<List<ShopItem>>(emptyList())
    val items: StateFlow<List<ShopItem>> = _items.asStateFlow()
    private val key = stringPreferencesKey("items")

    fun add(name: String, section: String = "Other", source: String = "Extra") {
        val current = _items.value
        val existing = current.find { it.name.equals(name, ignoreCase = true) }
        _items.value = if (existing == null) {
            (current + ShopItem(name, section = section, sources = listOf(source))).sortedBy { it.section + it.name }
        } else {
            current.map {
                if (it.name.equals(name, ignoreCase = true))
                    it.copy(sources = (it.sources + source).distinct())
                else it
            }
        }
    }

    fun setQuantity(name: String, quantity: Float) {
        _items.value = _items.value.map {
            if (it.name.equals(name, ignoreCase = true)) it.copy(quantity = quantity) else it
        }
    }

    fun toggleCrossed(name: String) {
        _items.value = _items.value.map {
            if (it.name.equals(name, ignoreCase = true)) it.copy(crossed = !it.crossed) else it
        }
    }

    fun remove(name: String) {
        _items.value = _items.value.filterNot { it.name.equals(name, ignoreCase = true) }
    }

    fun clear() {
        _items.value = emptyList()
    }

    suspend fun persist(context: Context) {
        val arr = JSONArray()
        _items.value.forEach { item ->
            arr.put(JSONObject().apply {
                put("name", item.name)
                put("quantity", item.quantity)
                put("section", item.section)
                put("crossed", item.crossed)
                put("sources", JSONArray(item.sources))
            })
        }
        context.listStore.edit { it[key] = arr.toString() }
    }

    suspend fun load(context: Context) {
        context.listStore.data.collect { prefs ->
            val raw = prefs[key] ?: return@collect
            val arr = JSONArray(raw)
            _items.value = List(arr.length()) { i ->
                val o = arr.getJSONObject(i)
                val sources = o.optJSONArray("sources")
                ShopItem(
                    name = o.getString("name"),
                    quantity = o.optDouble("quantity", 1.0).toFloat(),
                    section = o.optString("section", "Other"),
                    crossed = o.optBoolean("crossed"),
                    sources = if (sources == null) emptyList() else List(sources.length()) { sources.getString(it) }
                )
            }
        }
    }
}
