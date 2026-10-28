package com.leoelicos.ingre.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class ShopItem(
    val name: String,
    val quantity: Float = 1f,
    val measure: String = "",
    val section: String = "Other",
    val crossed: Boolean = false
)

object ShoppingListStore {
    private val _items = MutableStateFlow<List<ShopItem>>(emptyList())
    val items: StateFlow<List<ShopItem>> = _items.asStateFlow()

    fun add(name: String, section: String = "Other") {
        val current = _items.value
        if (current.any { it.name.equals(name, ignoreCase = true) }) return
        _items.value = (current + ShopItem(name, section = section)).sortedBy { it.section + it.name }
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
}
