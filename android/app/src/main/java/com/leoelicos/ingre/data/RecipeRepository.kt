package com.leoelicos.ingre.data

import org.json.JSONObject

data class RecipeSummary(val id: String, val name: String, val portions: Int)

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
}
