package com.leoelicos.ingre.ui

import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.ShoppingListStore
import org.json.JSONArray

private fun loadIngredients(context: Context): List<String> {
    val text = context.assets.open("ingredients.json").bufferedReader().use { it.readText() }
    val arr = JSONArray(text)
    return List(arr.length()) { i -> arr.getJSONObject(i).getString("name") }.sorted()
}

@Composable
fun ExploreScreen() {
    val context = LocalContext.current
    var all by remember { mutableStateOf<List<String>>(emptyList()) }
    var query by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        all = loadIngredients(context)
    }

    val filtered = remember(all, query) {
        val q = query.trim()
        if (q.isEmpty()) all else all.filter { it.contains(q, ignoreCase = true) }
    }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Explore", fontSize = 24.sp)
        if (message != null) {
            Text(message!!, fontSize = 14.sp, modifier = Modifier.padding(vertical = 4.dp))
        }
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("Search ingredients") },
            modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
            singleLine = true
        )
        Text("${filtered.size} ingredients — tap to add", fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
        LazyColumn {
            items(filtered) { name ->
                Text(
                    name,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            ShoppingListStore.add(name)
                            message = "Added $name"
                        }
                        .padding(vertical = 10.dp),
                    fontSize = 16.sp
                )
            }
        }
    }
}
