package com.leoelicos.ingre

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import com.leoelicos.ingre.data.TokenStore
import com.leoelicos.ingre.ui.HomeScreen
import com.leoelicos.ingre.ui.IngreTheme
import com.leoelicos.ingre.ui.LoginScreen
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val store = TokenStore(this)
        setContent {
            IngreTheme {
                val token by store.token.collectAsState(initial = null)
                val scope = rememberCoroutineScope()
                if (token != null) {
                    HomeScreen(token = token!!)
                } else {
                    LoginScreen(onLogin = { t -> scope.launch { store.save(t) } })
                }
            }
        }
    }
}
