package app.ingre.android

import android.app.Application
import app.ingre.android.platform.AndroidStrings
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class IngreApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AndroidStrings.install(this)
    }
}
