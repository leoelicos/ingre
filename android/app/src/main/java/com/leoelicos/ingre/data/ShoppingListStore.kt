package com.leoelicos.ingre.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class ShopItem(val name: String, val quantity: Float = 1f, val measure: String = "")

object ShoppingListStore {
    private val _items = MutableStateFlow<List<ShopItem>>(emptyList())
    val items: StateFlow<List<ShopItem>> = _items.asStateFlow()

    fun add(name: String) {
        val current = _items.value
        if (current.any { it.name.equals(name, ignoreCase = true) }) return
        _items.value = (current + ShopItem(name)).sortedBy { it.name }
    }

    fun remove(name: String) {
        _items.value = _items.value.filterNot { it.name.equals(name, ignoreCase = true) }
    }

    fun clear() {
        _items.value = emptyList()
    }
}
