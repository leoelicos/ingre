package app.ingre.android.platform

import android.annotation.SuppressLint
import android.content.Context
import app.ingre.android.core.L10n

/** Points [L10n] at res/values/strings.xml: a key's resource is the key with "." and " " as "_". */
object AndroidStrings {
    // The web locale's keys are looked up by name, so the resource id is found at runtime.
    @SuppressLint("DiscouragedApi")
    fun install(context: Context) {
        val resources = context.applicationContext.resources
        val packageName = context.applicationContext.packageName
        val ids = java.util.concurrent.ConcurrentHashMap<String, Int>()
        L10n.lookup = { key ->
            val id = ids.getOrPut(key) { resources.getIdentifier(L10n.resourceName(key), "string", packageName) }
            if (id == 0) key else resources.getString(id)
        }
    }
}
