package com.leoelicos.ingre.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class RecipeSummary(val id: String, val name: String, val portions: Int)

data class IngredientItem(val name: String, val quantity: Float, val measure: String)

data class RecipeDetail(
    val id: String,
    val name: String,
    val portions: Int,
    val ingredients: List<IngredientItem>,
    val instructions: String?
)

class RecipeRepository(private val client: GraphQLClient = GraphQLClient()) {
    fun getSavedRecipes(token: String): List<RecipeSummary> {
        val query = """
            query {
              getSavedRecipes {
                _id
                name
                portions
              }
            }
        """.trimIndent()
        val data = client.query(query, JSONObject(), token)
        val arr = data.getJSONArray("getSavedRecipes")
        return List(arr.length()) { i ->
            val o = arr.getJSONObject(i)
            RecipeSummary(
                id = o.getString("_id"),
                name = o.getString("name"),
                portions = o.getInt("portions")
            )
        }
    }

    fun getRecipe(token: String, id: String): RecipeDetail {
        val query = """
            query GetRecipe(${'$'}id: ID!) {
              getRecipe(_id: ${'$'}id) {
                _id
                name
                portions
                instructions
                ingredients { name quantity measure }
              }
            }
        """.trimIndent()
        val vars = JSONObject().apply { put("id", id) }
        val data = client.query(query, vars, token)
        val r = data.getJSONObject("getRecipe")
        val ings = r.getJSONArray("ingredients")
        val items = List(ings.length()) { i ->
            val o = ings.getJSONObject(i)
            IngredientItem(
                name = o.getString("name"),
                quantity = o.getDouble("quantity").toFloat(),
                measure = o.getString("measure")
            )
        }
        return RecipeDetail(
            id = r.getString("_id"),
            name = r.getString("name"),
            portions = r.getInt("portions"),
            ingredients = items,
            instructions = if (r.isNull("instructions")) null else r.getString("instructions")
        )
    }

    fun saveCatalogueRecipe(context: Context, token: String, catalogueId: String): String {
        val source = catalogueRecipeToInput(context, catalogueId)
            ?: throw Exception("Recipe not found")
        val query = """
            mutation Save(${'$'}input: RecipeInput!) {
              saveRecipe(input: ${'$'}input) { _id name }
            }
        """.trimIndent()
        val ingredients = source.getJSONArray("ingredients")
        val inputIngs = JSONArray()
        for (i in 0 until ingredients.length()) {
            val g = ingredients.getJSONObject(i)
            inputIngs.put(JSONObject().apply {
                put("name", g.getString("name"))
                put("quantity", g.getDouble("quantity"))
                put("measure", g.getString("measure"))
                put("category", g.optString("category", "other"))
                put("ingredientId", g.getString("ingredientId"))
            })
        }
        val input = JSONObject().apply {
            put("name", source.getString("name"))
            put("portions", source.getInt("portions"))
            put("ingredients", inputIngs)
            put("picture_url", "")
            put("libraryId", source.getString("id"))
            put("instructions", source.optString("instructions"))
            put("customisations", JSONObject().apply {
                put("added", JSONArray())
                put("removed", JSONArray())
                put("changed", JSONArray())
            })
        }
        val vars = JSONObject().apply { put("input", input) }
        val data = client.query(query, vars, token)
        return data.getJSONObject("saveRecipe").getString("_id")
    }
}
