package com.leoelicos.ingre.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.data.TokenStore
import kotlinx.coroutines.launch

@Composable
fun AccountScreen(token: String?, store: TokenStore) {
    val scope = rememberCoroutineScope()
    var mode by remember { mutableStateOf("menu") }

    if (token != null) {
        Column(
            Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("Account", fontSize = 28.sp)
            Text("Signed in. Saved recipes sync to the server.")
            Button(onClick = { scope.launch { store.clear() } }, modifier = Modifier.fillMaxWidth()) {
                Text("Log out")
            }
        }
        return
    }

    when (mode) {
        "login" -> LoginScreen(
            onLogin = { t -> scope.launch { store.save(t); mode = "menu" } },
            onSignup = { mode = "signup" }
        )
        "signup" -> SignupScreen(
            onSignup = { t -> scope.launch { store.save(t); mode = "menu" } },
            onBack = { mode = "menu" }
        )
        else -> Column(
            Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("Account", fontSize = 28.sp)
            Text("Optional. The app works without an account. Sign in to sync saved recipes.")
            Button(onClick = { mode = "login" }, modifier = Modifier.fillMaxWidth()) { Text("Log in") }
            Button(onClick = { mode = "signup" }, modifier = Modifier.fillMaxWidth()) { Text("Sign up") }
        }
    }
}
