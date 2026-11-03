package com.leoelicos.ingre.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object SavedRecipesStore {
    private val _ids = MutableStateFlow<Set<String>>(emptySet())
    val ids: StateFlow<Set<String>> = _ids.asStateFlow()

    fun save(id: String) {
        _ids.value = _ids.value + id
    }

    fun remove(id: String) {
        _ids.value = _ids.value - id
    }

    fun clear() {
        _ids.value = emptySet()
    }
}
