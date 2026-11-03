package com.leoelicos.ingre.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class CatalogueRecipe(
    val id: String,
    val name: String,
    val portions: Int,
    val ingredients: List<IngredientItem>,
    val instructions: String
)

fun loadCatalogueRecipes(context: Context): List<CatalogueRecipe> {
    val text = context.assets.open("recipes.json").bufferedReader().use { it.readText() }
    val arr = JSONArray(text)
    return List(arr.length()) { i ->
        val o = arr.getJSONObject(i)
        val ings = o.getJSONArray("ingredients")
        val items = List(ings.length()) { j ->
            val g = ings.getJSONObject(j)
            IngredientItem(
                name = g.getString("name"),
                quantity = g.getDouble("quantity").toFloat(),
                measure = g.getString("measure")
            )
        }
        CatalogueRecipe(
            id = o.getString("id"),
            name = o.getString("name"),
            portions = o.getInt("portions"),
            ingredients = items,
            instructions = o.optString("instructions")
        )
    }
}

fun catalogueRecipeToInput(context: Context, id: String): JSONObject? {
    val text = context.assets.open("recipes.json").bufferedReader().use { it.readText() }
    val arr = JSONArray(text)
    for (i in 0 until arr.length()) {
        val o = arr.getJSONObject(i)
        if (o.getString("id") == id) return o
    }
    return null
}
