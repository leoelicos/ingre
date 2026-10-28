package com.leoelicos.ingre.data

import org.json.JSONObject

data class AuthResult(val token: String, val firstName: String, val email: String)

class AuthRepository(private val client: GraphQLClient = GraphQLClient()) {
    fun login(email: String, password: String): AuthResult {
        val query = """
            mutation Login(${'$'}email: String!, ${'$'}password: String!) {
              login(email: ${'$'}email, password: ${'$'}password) {
                token
                user { firstName email }
              }
            }
        """.trimIndent()
        val vars = JSONObject().apply {
            put("email", email)
            put("password", password)
        }
        val data = client.query(query, vars)
        val auth = data.getJSONObject("login")
        val user = auth.getJSONObject("user")
        return AuthResult(
            token = auth.getString("token"),
            firstName = user.getString("firstName"),
            email = user.getString("email")
        )
    }
}
