package com.leoelicos.ingre.data

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class GraphQLClient(
    private val endpoint: String = "https://ingre-backend.onrender.com/graphql"
) {
    private val client = OkHttpClient()
    private val jsonMedia = "application/json".toMediaType()

    fun query(query: String, variables: JSONObject = JSONObject(), token: String? = null): JSONObject {
        val body = JSONObject().apply {
            put("query", query)
            put("variables", variables)
        }.toString().toRequestBody(jsonMedia)

        val request = Request.Builder()
            .url(endpoint)
            .post(body)
            .apply { if (token != null) header("Authorization", "Bearer $token") }
            .build()

        client.newCall(request).execute().use { response ->
            val text = response.body?.string() ?: throw Exception("Empty response")
            val json = JSONObject(text)
            if (json.has("errors")) {
                throw Exception(json.getJSONArray("errors").getJSONObject(0).getString("message"))
            }
            return json.getJSONObject("data")
        }
    }
}
