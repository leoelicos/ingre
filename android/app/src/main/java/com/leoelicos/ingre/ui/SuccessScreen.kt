package com.leoelicos.ingre.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SuccessScreen(onDone: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("Success!", fontSize = 28.sp)
        Text("Thank you for your purchase!", modifier = Modifier.padding(vertical = 12.dp))
        Text("You are pro.")
        Button(onClick = onDone, modifier = Modifier.padding(top = 24.dp)) { Text("Go home") }
    }
}
