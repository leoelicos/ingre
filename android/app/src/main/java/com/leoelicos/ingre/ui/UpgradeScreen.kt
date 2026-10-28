package com.leoelicos.ingre.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun UpgradeScreen() {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("Upgrade", fontSize = 28.sp)
        Text("Why upgrade?", fontSize = 18.sp, modifier = Modifier.padding(top = 16.dp))
        Text(
            "Get an extra button that opens cooking instructions for each recipe. Only 5 USD. Secure payment with Stripe.",
            modifier = Modifier.padding(vertical = 12.dp)
        )
        Button(onClick = {}, modifier = Modifier.fillMaxWidth()) {
            Text("Checkout with Stripe")
        }
        Text("Stripe checkout is not wired on Android yet.", fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
    }
}
