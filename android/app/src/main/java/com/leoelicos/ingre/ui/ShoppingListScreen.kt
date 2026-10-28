package com.leoelicos.ingre.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.ShoppingListStore

@Composable
fun ShoppingListScreen() {
    val items by ShoppingListStore.items.collectAsState()

    if (items.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Nothing on your list yet.\nAdd ingredients from Explore.", fontSize = 16.sp)
        }
        return
    }

    val grouped = items.groupBy { it.section }
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Shopping list", fontSize = 24.sp)
        Text("${items.size} items · ${items.count { it.crossed }} crossed off", fontSize = 12.sp)
        LazyColumn(Modifier.weight(1f)) {
            grouped.forEach { (section, group) ->
                item { Text(section, fontSize = 18.sp, modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)) }
                items(group) { item ->
                    Text(
                        item.name,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { ShoppingListStore.toggleCrossed(item.name) }
                            .padding(vertical = 8.dp),
                        fontSize = 16.sp,
                        textDecoration = if (item.crossed) TextDecoration.LineThrough else null
                    )
                }
            }
        }
        Button(onClick = { ShoppingListStore.clear() }, modifier = Modifier.fillMaxWidth()) {
            Text("Clear list")
        }
    }
}
