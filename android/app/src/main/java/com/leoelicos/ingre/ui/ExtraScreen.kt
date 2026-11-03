package com.leoelicos.ingre.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.ExtraStore

@Composable
fun ExtraScreen() {
    val items by ExtraStore.items.collectAsState()
    var name by remember { mutableStateOf("") }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Extra", fontSize = 24.sp)
        Text("Staples and anything else, not from a recipe.", fontSize = 12.sp)
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Add an ingredient") },
            modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
            singleLine = true
        )
        Button(
            onClick = {
                if (name.isNotBlank()) {
                    ExtraStore.add(name.trim())
                    name = ""
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = name.isNotBlank()
        ) { Text("Add") }
        LazyColumn(Modifier.weight(1f).padding(top = 12.dp)) {
            items(items) { item ->
                Text(item.name, modifier = Modifier.padding(vertical = 8.dp), fontSize = 16.sp)
            }
        }
        if (items.isNotEmpty()) {
            Button(onClick = { ExtraStore.clear() }, modifier = Modifier.fillMaxWidth()) { Text("Clear extra") }
        }
    }
}
