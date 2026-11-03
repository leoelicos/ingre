package app.ingre.android

/** Where the app talks to: from BuildConfig per build type, or the mocks in UI tests (#195). */
data class AppConfig(val graphQlUrl: String, val webOrigin: String, val checkoutBaseUrl: String) {
    companion object {
        val fromBuild = AppConfig(BuildConfig.GRAPHQL_URL, BuildConfig.WEB_ORIGIN, BuildConfig.CHECKOUT_BASE_URL)
    }
}
