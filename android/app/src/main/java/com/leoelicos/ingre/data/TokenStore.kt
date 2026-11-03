package com.leoelicos.ingre.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "auth")

class TokenStore(private val context: Context) {
    private val key = stringPreferencesKey("token")

    val token: Flow<String?> = context.dataStore.data.map { it[key] }

    suspend fun save(token: String) {
        context.dataStore.edit { it[key] = token }
    }

    suspend fun clear() {
        context.dataStore.edit { it.remove(key) }
    }
}
