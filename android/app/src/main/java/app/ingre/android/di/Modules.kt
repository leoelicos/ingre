package app.ingre.android.di

import android.content.Context
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.preferencesDataStoreFile
import app.ingre.android.AppConfig
import app.ingre.android.account.Clock
import app.ingre.android.account.KeystoreTokenStore
import app.ingre.android.core.CheckoutOpener
import app.ingre.android.core.IngreApi
import app.ingre.android.core.KeyValueStore
import app.ingre.android.core.Library
import app.ingre.android.core.ListStorage
import app.ingre.android.core.TokenStore
import app.ingre.android.network.ApolloIngreApi
import app.ingre.android.platform.DataStoreKeyValueStore
import app.ingre.android.upgrade.CustomTabCheckoutOpener
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import java.util.concurrent.TimeUnit
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import okhttp3.OkHttpClient

/** What every build shares: the bundled library and the clock. */
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun library(@ApplicationContext context: Context): Library = Library.parse(
        ingredients = context.assets.open("ingredients.json").bufferedReader().use { it.readText() },
        recipes = context.assets.open("recipes.json").bufferedReader().use { it.readText() }
    )

    @Provides
    fun clock(): Clock = Clock { System.currentTimeMillis() / 1000.0 }

    @Provides
    fun listStorage(store: KeyValueStore): ListStorage = ListStorage(store)

    @Provides
    @Singleton
    fun api(config: AppConfig, tokens: TokenStore, http: OkHttpClient): IngreApi =
        ApolloIngreApi(config.graphQlUrl, config.webOrigin, tokens, http)
}

/** The server and Stripe URLs, from BuildConfig. UI tests replace this module. */
@Module
@InstallIn(SingletonComponent::class)
object ConfigModule {
    @Provides
    fun config(): AppConfig = AppConfig.fromBuild
}

/** The list in DataStore and the JWT in the Keystore. UI tests replace this module. */
@Module
@InstallIn(SingletonComponent::class)
object StorageModule {
    @Provides
    @Singleton
    fun store(@ApplicationContext context: Context): KeyValueStore {
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
        val dataStore = PreferenceDataStoreFactory.create(scope = scope) { context.preferencesDataStoreFile("ingre") }
        return DataStoreKeyValueStore(dataStore, scope)
    }

    @Provides
    @Singleton
    fun tokens(@ApplicationContext context: Context): TokenStore = KeystoreTokenStore(context)
}

/** The HTTP client Apollo uses. UI tests replace it with one answered by MockGraphQl. */
@Module
@InstallIn(SingletonComponent::class)
object HttpModule {
    @Provides
    @Singleton
    fun http(): OkHttpClient = OkHttpClient.Builder()
        // the free Render server sleeps; its first answer can take most of a minute
        .callTimeout(90, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .build()
}

/** Stripe's checkout in a Custom Tab. UI tests replace it with MockCheckoutOpener. */
@Module
@InstallIn(SingletonComponent::class)
object CheckoutModule {
    @Provides
    @Singleton
    fun opener(@ApplicationContext context: Context): CheckoutOpener = CustomTabCheckoutOpener(context)
}
