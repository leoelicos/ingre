import Apollo
import ApolloAPI
import Foundation

/// The GraphQL client (#195): Apollo iOS with the operations in ios/graphql/operations, generated
/// by apollo-ios-cli into Network/Generated. The JWT rides in `authorization: Bearer …`, as on
/// the web (client/src/lib/apollo).
final class ApolloIngreAPI: IngreAPI {
    private let client: ApolloClient

    /// - Parameters:
    ///   - endpoint: the server's /graphql URL (GRAPHQL_URL in the build configuration).
    ///   - webOrigin: sent as Referer, because the server builds Stripe's return URLs from it.
    ///   - session: URLSession.shared, or one with the mock protocol in UI tests.
    init(endpoint: URL, webOrigin: String, tokens: any TokenStore, session: URLSession) {
        let store = ApolloStore(cache: InMemoryNormalizedCache())
        let transport = RequestChainNetworkTransport(
            urlSession: session,
            interceptorProvider: Interceptors(tokens: tokens),
            store: store,
            endpointURL: endpoint,
            additionalHeaders: ["Referer": webOrigin]
        )
        client = ApolloClient(networkTransport: transport, store: store)
    }

    /// The default interceptors, plus the token header.
    private struct Interceptors: InterceptorProvider {
        let tokens: any TokenStore

        func httpInterceptors<Operation: GraphQLOperation>(for operation: Operation) -> [any HTTPInterceptor] {
            [AuthInterceptor(tokens: tokens), ResponseCodeInterceptor()]
        }
    }

    private struct AuthInterceptor: HTTPInterceptor {
        let tokens: any TokenStore

        func intercept(request: URLRequest, next: NextHTTPInterceptorFunction) async throws -> HTTPResponse {
            var request = request
            if let token = tokens.read() {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "authorization")
            }
            return try await next(request)
        }
    }

    // MARK: Requests

    private func query<Query: GraphQLQuery>(_ query: Query) async throws -> Query.Data
    where Query.ResponseFormat == SingleResponseFormat {
        try Self.unwrap(await Self.mapErrors { try await client.fetch(query: query, cachePolicy: .networkOnly) })
    }

    private func mutate<Mutation: GraphQLMutation>(_ mutation: Mutation) async throws -> Mutation.Data
    where Mutation.ResponseFormat == SingleResponseFormat {
        try Self.unwrap(await Self.mapErrors { try await client.perform(mutation: mutation) })
    }

    private static func mapErrors<T>(_ work: () async throws -> T) async throws -> T {
        do {
            return try await work()
        } catch let error as ResponseCodeInterceptor.ResponseCodeError {
            throw APIError.http(error.response.statusCode)
        } catch let error as URLError {
            throw error.code == .notConnectedToInternet ? APIError.offline : APIError.http(0)
        }
    }

    private static func unwrap<Operation: GraphQLOperation>(
        _ response: GraphQLResponse<Operation>
    ) throws -> Operation.Data {
        if let errors = response.errors, !errors.isEmpty {
            throw APIError.graphQL(errors.map { $0.message ?? "" })
        }
        guard let data = response.data else { throw APIError.noData }
        return data
    }

    // MARK: IngreAPI

    func login(email: String, password: String) async throws -> (token: String, user: UserProfile) {
        let data = try await mutate(IngreGraphQL.LoginMutation(email: email, password: password))
        let user = data.login.user
        return (
            data.login.token, UserProfile(id: user._id, email: user.email, firstName: user.firstName, pro: user.pro)
        )
    }

    func currentUser() async throws -> UserProfile {
        let user = try await query(IngreGraphQL.GetUserQuery()).getUser
        return UserProfile(id: user._id, email: user.email, firstName: user.firstName, pro: user.pro)
    }

    func savedRecipes() async throws -> [SavedRecipeSummary] {
        try await query(IngreGraphQL.GetSavedRecipesQuery()).getSavedRecipes.map {
            SavedRecipeSummary(id: $0._id, libraryId: $0.libraryId)
        }
    }

    func saveRecipe(_ input: RecipeInputValue) async throws -> SavedRecipeSummary {
        let saved = try await mutate(IngreGraphQL.SaveRecipeMutation(input: Self.graphQLInput(input))).saveRecipe
        return SavedRecipeSummary(id: saved._id, libraryId: saved.libraryId)
    }

    func removeRecipe(id: String) async throws -> Bool {
        try await mutate(IngreGraphQL.RemoveRecipeMutation(recipeId: id)).removeRecipe
    }

    func checkoutSession() async throws -> String? {
        try await query(IngreGraphQL.CheckoutQuery()).checkout.session
    }

    func makeUserPro() async throws -> Bool {
        try await mutate(IngreGraphQL.MakeUserProMutation()).makeUserPro.pro
    }

    static func graphQLInput(_ input: RecipeInputValue) -> IngreGraphQL.RecipeInput {
        let custom = input.customisations
        return IngreGraphQL.RecipeInput(
            name: input.name,
            portions: input.portions,
            ingredients: input.ingredients.map {
                IngreGraphQL.IngredientInput(
                    name: $0.name, quantity: $0.quantity, measure: $0.measure, category: $0.category,
                    ingredientId: $0.ingredientId
                )
            },
            picture_url: input.pictureURL,
            libraryId: .some(input.libraryId),
            instructions: .none,
            customisations: IngreGraphQL.CustomisationsInput(
                added: custom.added.map { .init(ingredientId: $0.ingredientId, to: $0.to) },
                removed: custom.removed.map { .init(ingredientId: $0.ingredientId, from: $0.from) },
                changed: custom.changed.map { .init(ingredientId: $0.ingredientId, from: $0.from, to: $0.to) },
                portions: custom.portions.map { .some(.init(from: $0.from, to: $0.to)) } ?? .none
            )
        )
    }
}
