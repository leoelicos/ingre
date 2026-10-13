# Test mock inventory

Generated 2026-10-14. Every `jest.mock` and module-level `jest.spyOn` (console spies excluded) in client and server tests, with a recommended non-mocking replacement. New tests must not mock module imports.

Totals: 151 usages in 60 files (client 138, server 13).

## Most-mocked targets

| Target | Uses | Replacement |
|---|---|---|
| `../../../utils/auth/AuthContext` | 20 | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `@apollo/client` | 14 | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `../../../utils/changeTitle` | 14 | Use the real function and assert document.title. |
| `../../../utils/state/GlobalState` | 12 | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `react-router-dom` | 10 | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `../../../components/NotLoggedIn` | 8 | Render the real child component; query by role/text instead of a stub. |
| `../../../components/Widgets/RecipeCard/RecipeCardContainer` | 4 | Prefer real implementation or DI. |
| `../useRecipeCard` | 2 | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `../../../../utils/auth/AuthContext` | 2 | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `../../../../utils/state/GlobalState` | 2 | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `../../../../../lib/icon/Icon` | 2 | Render the real child component; query by role/text instead of a stub. |
| `../../utils/auth/AuthContext` | 2 | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |

## Full list

| File | Kind | Target | Recommended replacement |
|---|---|---|---|
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Home/Home` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Search/Search` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Customise/Customise` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Saved/Saved` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Ingredients/Ingredients` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/TapOff/TapOff` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Admin/Login` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Admin/Signup` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Admin/Upgrade` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Admin/Success` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../pages/Admin/NoMatch` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/__tests__/App.test.tsx` | jest.mock | `../components/Header` | Render the real child component; query by role/text instead of a stub. |
| `client/src/__tests__/index.test.tsx` | jest.mock | `react-dom/client` | Keep entry test minimal: render real App into #root via jsdom, or test only the missing-root guard (done). |
| `client/src/__tests__/index.test.tsx` | jest.mock | `../App` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/components/Widgets/RecipeCard/__tests__/RecipeCard.states.test.tsx` | jest.mock | `../useRecipeCard` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/components/Widgets/RecipeCard/__tests__/RecipeCard.states.test.tsx` | jest.mock | `../../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/components/Widgets/RecipeCard/__tests__/RecipeCard.test.tsx` | jest.mock | `../useRecipeCard` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/components/Widgets/RecipeCard/__tests__/RecipeCard.test.tsx` | jest.mock | `../components/EditButton` | Render the real child component; query by role/text instead of a stub. |
| `client/src/components/Widgets/RecipeCard/__tests__/RecipeCard.test.tsx` | jest.mock | `../components/SaveButton` | Render the real child component; query by role/text instead of a stub. |
| `client/src/components/Widgets/RecipeCard/__tests__/RecipeCard.test.tsx` | jest.mock | `../components/TrashButton` | Render the real child component; query by role/text instead of a stub. |
| `client/src/components/Widgets/RecipeCard/__tests__/RecipeCardContainer.test.tsx` | jest.mock | `../../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/components/Widgets/RecipeCard/__tests__/RecipeCardContainer.test.tsx` | jest.mock | `../RecipeCard` | Render real pages under MemoryRouter + providers; or route-level smoke test asserting headings. |
| `client/src/components/Widgets/RecipeCard/__tests__/useRecipeCard.coverage.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/components/Widgets/RecipeCard/__tests__/useRecipeCard.coverage.test.ts` | jest.mock | `../../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/components/Widgets/RecipeCard/__tests__/useRecipeCard.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/components/Widgets/RecipeCard/__tests__/useRecipeCard.test.ts` | jest.mock | `../../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/components/Widgets/RecipeCard/components/__tests__/EditButton.test.tsx` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/components/Widgets/RecipeCard/components/__tests__/SaveButton.test.tsx` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/components/Widgets/RecipeCard/components/__tests__/SaveButton.test.tsx` | jest.mock | `../../../../../lib/icon/Icon` | Render the real child component; query by role/text instead of a stub. |
| `client/src/components/Widgets/RecipeCard/components/__tests__/TrashButton.test.tsx` | jest.mock | `../../../../../lib/icon/Icon` | Render the real child component; query by role/text instead of a stub. |
| `client/src/components/__tests__/AuthButton.test.tsx` | jest.mock | `../../hooks/useAuth` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/components/__tests__/Header.test.tsx` | jest.mock | `../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/components/__tests__/Header.test.tsx` | jest.mock | `../../lib/components` | Render the real child component; query by role/text instead of a stub. |
| `client/src/hooks/__tests__/useAuth.test.ts` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/hooks/__tests__/useAuth.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/hooks/__tests__/useAuth.test.ts` | jest.mock | `../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/lib/apollo/graphQL/__tests__/mutations.coverage.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/lib/components/__tests__/Header.test.tsx` | jest.mock | `../../../components/AuthButton` | Render the real child component; query by role/text instead of a stub. |
| `client/src/lib/icon/__tests__/Icon.test.tsx` | jest.mock | `@fortawesome/react-fontawesome` | Render the real child component; query by role/text instead of a stub. |
| `client/src/pages/Admin/__tests__/Login.form.test.tsx` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/pages/Admin/__tests__/Login.form.test.tsx` | jest.mock | `../../../hooks/useAuth` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/Login.form.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/Login.form.test.tsx` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Admin/__tests__/Login.test.tsx` | jest.mock | `../../../hooks/useAuth` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/Login.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/Login.test.tsx` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Admin/__tests__/NoMatch.test.tsx` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Admin/__tests__/Signup.states.test.tsx` | jest.mock | `../useSignup` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Admin/__tests__/Signup.test.tsx` | jest.mock | `../useSignup` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Admin/__tests__/Signup.test.tsx` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Admin/__tests__/Success.states.test.tsx` | jest.mock | `../useSuccess` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Admin/__tests__/Success.states.test.tsx` | jest.mock | `../../../components/NotLoggedIn` | Render the real child component; query by role/text instead of a stub. |
| `client/src/pages/Admin/__tests__/Success.test.tsx` | jest.mock | `../useSuccess` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Admin/__tests__/Success.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/Success.test.tsx` | jest.mock | `../../../components/NotLoggedIn` | Render the real child component; query by role/text instead of a stub. |
| `client/src/pages/Admin/__tests__/Upgrade.checkout.test.tsx` | jest.mock | `../useUpgrade` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Admin/__tests__/Upgrade.test.tsx` | jest.mock | `../useUpgrade` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Admin/__tests__/Upgrade.test.tsx` | jest.mock | `../../../components/NotLoggedIn` | Render the real child component; query by role/text instead of a stub. |
| `client/src/pages/Admin/__tests__/useSignup.coverage.test.ts` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/pages/Admin/__tests__/useSignup.coverage.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Admin/__tests__/useSignup.coverage.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/useSignup.coverage.test.ts` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Admin/__tests__/useSignup.test.ts` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/pages/Admin/__tests__/useSignup.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Admin/__tests__/useSignup.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/useSuccess.coverage.test.ts` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/pages/Admin/__tests__/useSuccess.coverage.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Admin/__tests__/useSuccess.coverage.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/useSuccess.test.ts` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/pages/Admin/__tests__/useSuccess.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Admin/__tests__/useSuccess.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/useUpgrade.coverage.test.ts` | jest.mock | `@stripe/stripe-js` | Inject a stripe loader (DI param/context) and pass a fake in tests. |
| `client/src/pages/Admin/__tests__/useUpgrade.coverage.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Admin/__tests__/useUpgrade.coverage.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Admin/__tests__/useUpgrade.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Admin/__tests__/useUpgrade.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Customise/__tests__/Customise.form.test.tsx` | jest.mock | `../useCustomiseForm` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Customise/__tests__/Customise.form.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Customise/__tests__/Customise.form.test.tsx` | jest.mock | `../../../lib/apollo/graphQL/useSaveRecipe` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Customise/__tests__/Customise.form.test.tsx` | jest.mock | `../../../lib/apollo/graphQL/updateRecipe` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Customise/__tests__/Customise.test.tsx` | jest.mock | `../useCustomiseForm` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Customise/__tests__/Customise.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Customise/__tests__/Customise.test.tsx` | jest.mock | `../../../components/NotLoggedIn` | Render the real child component; query by role/text instead of a stub. |
| `client/src/pages/Customise/__tests__/Customise.test.tsx` | jest.mock | `../../../lib/apollo/graphQL/useSaveRecipe` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Customise/__tests__/Customise.test.tsx` | jest.mock | `../../../lib/apollo/graphQL/updateRecipe` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Customise/__tests__/useCustomiseForm.coverage.test.ts` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/pages/Customise/__tests__/useCustomiseForm.coverage.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Customise/__tests__/useCustomiseForm.test.ts` | jest.mock | `react-router-dom` | Wrap in MemoryRouter/createMemoryRouter with initialEntries; assert on location. |
| `client/src/pages/Customise/__tests__/useCustomiseForm.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Customise/__tests__/useCustomiseForm.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Home/__tests__/Home.test.tsx` | jest.mock | `../useHome` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Home/__tests__/Home.test.tsx` | jest.mock | `../../../components/Widgets/RecipeCard/RecipeCardContainer` | Prefer real implementation or DI. |
| `client/src/pages/Home/__tests__/useHome.coverage.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Home/__tests__/useHome.coverage.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Home/__tests__/useHome.coverage.test.ts` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Home/__tests__/useHome.coverage.test.ts` | jest.mock | `../../../utils/library/recipeLibrary` | Use the real local library (pure, synchronous); assert on known starter recipes. |
| `client/src/pages/Home/__tests__/useHome.test.ts` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Home/__tests__/useHome.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Home/__tests__/useHome.test.ts` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Ingredients/__tests__/Ingredients.states.test.tsx` | jest.mock | `../useIngredients` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Ingredients/__tests__/Ingredients.states.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Ingredients/__tests__/Ingredients.test.tsx` | jest.mock | `../useIngredients` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Ingredients/__tests__/Ingredients.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Ingredients/__tests__/Ingredients.test.tsx` | jest.mock | `../../../components/NotLoggedIn` | Render the real child component; query by role/text instead of a stub. |
| `client/src/pages/Ingredients/__tests__/useIngredients.coverage.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Ingredients/__tests__/useIngredients.coverage.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Ingredients/__tests__/useIngredients.coverage.test.ts` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Ingredients/__tests__/useIngredients.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Ingredients/__tests__/useIngredients.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Saved/__tests__/Saved.states.test.tsx` | jest.mock | `../useSaved` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Saved/__tests__/Saved.states.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Saved/__tests__/Saved.states.test.tsx` | jest.mock | `../../../components/NotLoggedIn` | Render the real child component; query by role/text instead of a stub. |
| `client/src/pages/Saved/__tests__/Saved.states.test.tsx` | jest.mock | `../../../components/Widgets/RecipeCard/RecipeCardContainer` | Prefer real implementation or DI. |
| `client/src/pages/Saved/__tests__/Saved.test.tsx` | jest.mock | `../useSaved` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Saved/__tests__/Saved.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/Saved/__tests__/Saved.test.tsx` | jest.mock | `../../../components/NotLoggedIn` | Render the real child component; query by role/text instead of a stub. |
| `client/src/pages/Saved/__tests__/useSaved.coverage.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Saved/__tests__/useSaved.coverage.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Saved/__tests__/useSaved.coverage.test.ts` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Saved/__tests__/useSaved.test.ts` | jest.mock | `@apollo/client` | Wrap in Apollo MockedProvider with typed mocks for the exact GQL documents. |
| `client/src/pages/Saved/__tests__/useSaved.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Saved/__tests__/useSaved.test.ts` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Search/__tests__/Search.states.test.tsx` | jest.mock | `../useSearch` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Search/__tests__/Search.states.test.tsx` | jest.mock | `../../../components/Widgets/RecipeCard/RecipeCardContainer` | Prefer real implementation or DI. |
| `client/src/pages/Search/__tests__/Search.test.tsx` | jest.mock | `../useSearch` | Render the real hook behind providers (or pass hook result via props: split container/presentational component). |
| `client/src/pages/Search/__tests__/Search.test.tsx` | jest.mock | `../../../components/Widgets/RecipeCard/RecipeCardContainer` | Prefer real implementation or DI. |
| `client/src/pages/Search/__tests__/useSearch.coverage.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Search/__tests__/useSearch.coverage.test.ts` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/Search/__tests__/useSearch.coverage.test.ts` | jest.mock | `../../../utils/library/recipeLibrary` | Use the real local library (pure, synchronous); assert on known starter recipes. |
| `client/src/pages/Search/__tests__/useSearch.test.ts` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/Search/__tests__/useSearch.test.ts` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/TapOff/__tests__/TapOff.loggedin.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/TapOff/__tests__/TapOff.loggedin.test.tsx` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/TapOff/__tests__/TapOff.loggedin.test.tsx` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/TapOff/__tests__/TapOff.test.tsx` | jest.mock | `../../../utils/auth/AuthContext` | Render inside the real AuthProvider with a seeded token (or inject auth state via provider props). |
| `client/src/pages/TapOff/__tests__/TapOff.test.tsx` | jest.mock | `../../../utils/state/GlobalState` | Render inside the real StoreProvider (accept optional initialState prop for seeding). |
| `client/src/pages/TapOff/__tests__/TapOff.test.tsx` | jest.mock | `../../../utils/changeTitle` | Use the real function and assert document.title. |
| `client/src/pages/TapOff/__tests__/TapOff.test.tsx` | jest.mock | `../../../components/NotLoggedIn` | Render the real child component; query by role/text instead of a stub. |
| `server/src/datasources/ingredient.test.ts` | jest.spyOn | `Ingredient.create` | Use mongodb-memory-server real failure modes (e.g. invalid input, closed connection) or inject the model/repository. |
| `server/src/datasources/recipe.test.ts` | jest.spyOn | `recipeDataSource.generateIngredient` | Inject collaborator functions (DI) instead of spying on same-module exports. |
| `server/src/datasources/recipe.test.ts` | jest.spyOn | `recipeDataSource.updateUniqueCategoryName` | Inject collaborator functions (DI) instead of spying on same-module exports. |
| `server/src/datasources/recipe.test.ts` | jest.spyOn | `Recipe.findById` | Use mongodb-memory-server real failure modes (e.g. invalid input, closed connection) or inject the model/repository. |
| `server/src/datasources/stripe.test.ts` | jest.mock | `stripe` | Inject a Stripe client into StripeApi constructor (DI) and pass a fake object; no module mock. |
| `server/src/datasources/user.test.ts` | jest.spyOn | `User.findById` | Use mongodb-memory-server real failure modes (e.g. invalid input, closed connection) or inject the model/repository. |
| `server/src/datasources/user.test.ts` | jest.spyOn | `User.findById` | Use mongodb-memory-server real failure modes (e.g. invalid input, closed connection) or inject the model/repository. |
| `server/src/datasources/user.test.ts` | jest.spyOn | `User.findOne` | Use mongodb-memory-server real failure modes (e.g. invalid input, closed connection) or inject the model/repository. |
| `server/src/schemas/resolvers/recipe/saveRecipe.test.ts` | jest.spyOn | `saveRecipeMethods.createSaveIngredient` | Inject collaborator functions (DI) instead of spying on same-module exports. |
| `server/src/schemas/resolvers/session/login.test.ts` | jest.mock | `../../../utils/auth` | Use real signToken with JWT_SECRET set in test env; assert token decodes. |
| `server/src/schemas/resolvers/user/addUser.test.ts` | jest.mock | `../../../utils/auth` | Use real signToken with JWT_SECRET set in test env; assert token decodes. |
| `server/src/utils/auth.test.ts` | jest.spyOn | `jwt.sign` | Use real jwt with a test secret; produce failure via invalid/expired token instead of spying. |
| `server/src/utils/auth.test.ts` | jest.spyOn | `jwt.verify` | Use real jwt with a test secret; produce failure via invalid/expired token instead of spying. |
