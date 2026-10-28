package com.leoelicos.ingre.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val sampleIngredients = listOf(
    "beef mince", "chicken thigh", "onion", "garlic", "tomato", "pasta",
    "olive oil", "salt", "pepper", "carrot", "potato", "milk", "butter",
    "egg", "rice", "soy sauce", "ginger", "capsicum", "broccoli"
)

@Composable
fun ExploreScreen() {
    var query by remember { mutableStateOf("") }
    val filtered = remember(query) {
        sampleIngredients.filter { it.contains(query.trim(), ignoreCase = true) }
    }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Explore", fontSize = 24.sp)
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("Search ingredients") },
            modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
            singleLine = true
        )
        LazyColumn {
            items(filtered) { name ->
                Text(name, modifier = Modifier.padding(vertical = 8.dp), fontSize = 16.sp)
            }
        }
    }
}
