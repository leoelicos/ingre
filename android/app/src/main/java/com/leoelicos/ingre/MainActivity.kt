package com.leoelicos.ingre

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import com.leoelicos.ingre.ui.HomeScreen
import com.leoelicos.ingre.ui.IngreTheme
import com.leoelicos.ingre.ui.LoginScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            IngreTheme {
                var token by rememberSaveable { mutableStateOf<String?>(null) }
                if (token != null) {
                    HomeScreen()
                } else {
                    LoginScreen(onLogin = { token = it })
                }
            }
        }
    }
}
