package app.ingre.android.network

import app.ingre.android.core.ApiException
import app.ingre.android.core.IngreApi
import app.ingre.android.core.RecipeInputValue
import app.ingre.android.core.SavedRecipeSummary
import app.ingre.android.core.TokenStore
import app.ingre.android.core.UserProfile
import app.ingre.android.graphql.CheckoutQuery
import app.ingre.android.graphql.GetSavedRecipesQuery
import app.ingre.android.graphql.GetUserQuery
import app.ingre.android.graphql.LoginMutation
import app.ingre.android.graphql.MakeUserProMutation
import app.ingre.android.graphql.RemoveRecipeMutation
import app.ingre.android.graphql.SaveRecipeMutation
import app.ingre.android.graphql.type.AddedIngredientInput
import app.ingre.android.graphql.type.ChangedIngredientInput
import app.ingre.android.graphql.type.CustomisationsInput
import app.ingre.android.graphql.type.IngredientInput
import app.ingre.android.graphql.type.PortionsChangeInput
import app.ingre.android.graphql.type.RecipeInput
import app.ingre.android.graphql.type.RemovedIngredientInput
import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.api.ApolloResponse
import com.apollographql.apollo.api.Operation
import com.apollographql.apollo.api.Optional
import com.apollographql.apollo.exception.ApolloHttpException
import com.apollographql.apollo.network.okHttpClient
import okhttp3.Interceptor
import okhttp3.OkHttpClient

/**
 * The GraphQL server through Apollo Kotlin (#195). The JWT goes in `authorization: Bearer`, as
 * the web client sends it; the Referer is the web origin because the server builds Stripe's
 * return URLs from it.
 */
class ApolloIngreApi(
    endpoint: String,
    webOrigin: String,
    private val tokens: TokenStore,
    http: OkHttpClient
) : IngreApi {
    private val client: ApolloClient = ApolloClient.Builder()
        .serverUrl(endpoint)
        .okHttpClient(
            http.newBuilder()
                .addInterceptor(
                    Interceptor { chain ->
                        val request = chain.request().newBuilder().header("Referer", webOrigin)
                        tokens.read()?.let { request.header("authorization", "Bearer $it") }
                        chain.proceed(request.build())
                    }
                )
                .build()
        )
        .build()

    private fun <D : Operation.Data> unwrap(response: ApolloResponse<D>): D {
        response.exception?.let { error ->
            throw if (error is ApolloHttpException) ApiException.Http(error.statusCode) else ApiException.Offline()
        }
        response.errors?.takeIf {
            it.isNotEmpty()
        }?.let { errors -> throw ApiException.GraphQl(errors.map { it.message }) }
        return response.data ?: throw ApiException.NoData()
    }

    override suspend fun login(email: String, password: String): Pair<String, UserProfile> {
        val login =
            unwrap(client.mutation(LoginMutation(email, password)).execute()).login ?: throw ApiException.NoData()
        val user = login.user
        return login.token to UserProfile(user._id, user.email, user.firstName, user.pro == true)
    }

    override suspend fun currentUser(): UserProfile {
        val user = unwrap(client.query(GetUserQuery()).execute()).getUser ?: throw ApiException.NoData()
        return UserProfile(user._id, user.email, user.firstName, user.pro == true)
    }

    override suspend fun savedRecipes(): List<SavedRecipeSummary> =
        unwrap(client.query(GetSavedRecipesQuery()).execute()).getSavedRecipes.orEmpty().filterNotNull().map {
            SavedRecipeSummary(it._id, it.libraryId)
        }

    override suspend fun saveRecipe(input: RecipeInputValue): SavedRecipeSummary {
        val saved = unwrap(client.mutation(SaveRecipeMutation(graphQlInput(input))).execute()).saveRecipe
            ?: throw ApiException.NoData()
        return SavedRecipeSummary(saved._id, saved.libraryId)
    }

    override suspend fun removeRecipe(id: String): Boolean =
        unwrap(client.mutation(RemoveRecipeMutation(id)).execute()).removeRecipe == true

    override suspend fun checkoutSession(): String? = unwrap(client.query(CheckoutQuery()).execute()).checkout?.session

    override suspend fun makeUserPro(): Boolean =
        unwrap(client.mutation(MakeUserProMutation()).execute()).makeUserPro?.pro == true

    companion object {
        fun graphQlInput(input: RecipeInputValue): RecipeInput {
            val custom = input.customisations
            return RecipeInput(
                name = input.name,
                portions = input.portions,
                ingredients = input.ingredients.map {
                    IngredientInput(it.name, it.quantity, it.measure, it.category, it.ingredientId)
                },
                picture_url = input.pictureUrl,
                libraryId = Optional.present(input.libraryId),
                instructions = Optional.absent(),
                customisations = CustomisationsInput(
                    added = custom.added.map { AddedIngredientInput(it.ingredientId, it.to) },
                    removed = custom.removed.map { RemovedIngredientInput(it.ingredientId, it.from) },
                    changed = custom.changed.map { ChangedIngredientInput(it.ingredientId, it.from, it.to) },
                    portions = Optional.presentIfNotNull(custom.portions?.let { PortionsChangeInput(it.from, it.to) })
                )
            )
        }
    }
}
