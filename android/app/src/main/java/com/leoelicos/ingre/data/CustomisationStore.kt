package com.leoelicos.ingre.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class Customisation(
    val recipeId: String,
    val added: List<String> = emptyList(),
    val removed: List<String> = emptyList(),
    val portions: Int? = null
)

object CustomisationStore {
    private val _all = MutableStateFlow<Map<String, Customisation>>(emptyMap())
    val all: StateFlow<Map<String, Customisation>> = _all.asStateFlow()

    fun of(recipeId: String): Customisation = _all.value[recipeId] ?: Customisation(recipeId)

    fun addIngredient(recipeId: String, name: String) {
        val current = of(recipeId)
        _all.value = _all.value + (recipeId to current.copy(added = (current.added + name).distinct()))
    }

    fun removeIngredient(recipeId: String, name: String) {
        val current = of(recipeId)
        _all.value = _all.value + (recipeId to current.copy(removed = (current.removed + name).distinct()))
    }

    fun setPortions(recipeId: String, portions: Int) {
        val current = of(recipeId)
        _all.value = _all.value + (recipeId to current.copy(portions = portions))
    }

    fun reset(recipeId: String) {
        _all.value = _all.value - recipeId
    }

    fun resetAll() {
        _all.value = emptyMap()
    }
}
