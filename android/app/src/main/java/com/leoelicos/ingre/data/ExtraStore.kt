package com.leoelicos.ingre.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class ExtraItem(val name: String, val section: String = "Other")

object ExtraStore {
    private val _items = MutableStateFlow<List<ExtraItem>>(emptyList())
    val items: StateFlow<List<ExtraItem>> = _items.asStateFlow()

    fun add(name: String, section: String = "Other") {
        if (_items.value.any { it.name.equals(name, ignoreCase = true) }) return
        _items.value = (_items.value + ExtraItem(name, section)).sortedBy { it.name }
    }

    fun remove(name: String) {
        _items.value = _items.value.filterNot { it.name.equals(name, ignoreCase = true) }
    }

    fun clear() {
        _items.value = emptyList()
    }
}
