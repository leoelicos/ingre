package com.leoelicos.ingre.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class Customisation(
    val recipeId: String,
    val added: List<String> = emptyList(),
    val removed: List<String> = emptyList(),
    val amounts: Map<String, Float> = emptyMap(),
    val portions: Int? = null,
    val notes: String = ""
)

object CustomisationStore {
    private val _all = MutableStateFlow<Map<String, Customisation>>(emptyMap())
    val all: StateFlow<Map<String, Customisation>> = _all.asStateFlow()

    fun of(recipeId: String): Customisation = _all.value[recipeId] ?: Customisation(recipeId)

    private fun put(recipeId: String, next: Customisation) {
        _all.value = _all.value + (recipeId to next)
    }

    fun addIngredient(recipeId: String, name: String) {
        val current = of(recipeId)
        put(recipeId, current.copy(added = (current.added + name).distinct()))
    }

    fun removeIngredient(recipeId: String, name: String) {
        val current = of(recipeId)
        put(recipeId, current.copy(removed = (current.removed + name).distinct()))
    }

    fun setAmount(recipeId: String, name: String, amount: Float) {
        val current = of(recipeId)
        put(recipeId, current.copy(amounts = current.amounts + (name to amount)))
    }

    fun setPortions(recipeId: String, portions: Int) {
        put(recipeId, of(recipeId).copy(portions = portions))
    }

    fun setNotes(recipeId: String, notes: String) {
        put(recipeId, of(recipeId).copy(notes = notes))
    }

    fun reset(recipeId: String) {
        _all.value = _all.value - recipeId
    }

    fun resetAll() {
        _all.value = emptyMap()
    }
}
