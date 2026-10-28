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
        if (data.isNull("login")) {
            throw Exception("Invalid email or password")
        }
        val auth = data.getJSONObject("login")
        val user = auth.getJSONObject("user")
        return AuthResult(
            token = auth.getString("token"),
            firstName = user.getString("firstName"),
            email = user.getString("email")
        )
    }

    fun signup(firstName: String, lastName: String, email: String, password: String): AuthResult {
        val query = """
            mutation Signup(${'$'}input: UserInput!) {
              addUser(input: ${'$'}input) {
                token
                user { firstName email }
              }
            }
        """.trimIndent()
        val input = JSONObject().apply {
            put("firstName", firstName)
            put("lastName", lastName)
            put("email", email)
            put("password", password)
        }
        val vars = JSONObject().apply { put("input", input) }
        val data = client.query(query, vars)
        val auth = data.getJSONObject("addUser")
        val user = auth.getJSONObject("user")
        return AuthResult(
            token = auth.getString("token"),
            firstName = user.getString("firstName"),
            email = user.getString("email")
        )
    }
}
