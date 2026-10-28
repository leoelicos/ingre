package com.leoelicos.ingre.data

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
}
