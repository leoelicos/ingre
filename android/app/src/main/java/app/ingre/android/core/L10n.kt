package app.ingre.android.core

/**
 * Strings from res/values/strings.xml, keyed by the web locale's keys (client/src/i18n), with
 * i18next-style `{{name}}` placeholders and `_one` / `_other` plural keys (#195). A key's
 * resource name is the key with "." and " " as "_": `measure.g tin` is `measure_g_tin`.
 */
object L10n {
    /** The string lookup: Android resources in the app, strings.xml parsed in JVM tests. */
    @Volatile
    var lookup: (String) -> String = { it }

    fun resourceName(key: String): String = key.replace('.', '_').replace(' ', '_')

    fun t(key: String, args: Map<String, String> = emptyMap()): String = interpolate(lookup(key), args)

    /** The `_one` or `_other` form the plural rules choose for [count]. */
    fun plural(key: String, count: Double, args: Map<String, String> = emptyMap()): String =
        t("${key}_${PluralRules.english(count)}", args)

    /** The key's string, or [fallback] when there is no such key. */
    fun tOr(key: String, fallback: String, args: Map<String, String> = emptyMap()): String {
        val value = lookup(key)
        return if (value == key) fallback else interpolate(value, args)
    }

    fun interpolate(template: String, args: Map<String, String>): String =
        args.entries.fold(template) { text, (name, value) -> text.replace("{{$name}}", value) }
}

/** Plural categories as Intl.PluralRules gives them for English: "one" only for exactly 1. */
object PluralRules {
    fun english(n: Double): String = if (n == 1.0) "one" else "other"
}
