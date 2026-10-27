# ingre

![https://stripe.com/docs/api](https://img.shields.io/badge/-Stripe-gold) ![https://react.dev](https://img.shields.io/badge/-React-blueviolet) ![https://www.apollographql.com](https://img.shields.io/badge/-Apollo_GraphQL-blueviolet) ![https://mongoosejs.com/docs](https://img.shields.io/badge/-Mongoose-blue) ![https://expressjs.com+](https://img.shields.io/badge/-Express-blue) ![https://jwt.io](https://img.shields.io/badge/-JWT_Token-blue) ![./LICENSE](https://img.shields.io/badge/-MIT-gray)

_Recipes have traditionally been based on ingredients. We take the opposite approach and make ingredients from recipes._

[Website](https://ingre.vercel.app/)

## Hosting

- Frontend (Vite + React): [Vercel](https://ingre.vercel.app/), deployed from `main`, with a preview for each pull request.
- Backend (Express + Apollo GraphQL): [Render](https://ingre-backend.onrender.com/graphql). It uses the free tier, so the first request after it has been idle can take around 30 seconds.
- Database: MongoDB via Mongoose.

## Native apps (#195)

Phone only, matching the web app below 576px: Explore (open when the list is empty), then Ingredients, then Recipes with Extra underneath. No sheets. The catalogue is copied from `client/src/data` and is not edited in `ios/` or `android/`.

```sh
node scripts/copy-native-library.mjs
```

iOS: Swift 6 and SwiftUI, iOS 17. The wording and list rules live in `ios/IngreCore` (`swift test` in that folder). The app project is generated, not hand-edited:

```sh
brew install xcodegen
cd ios && xcodegen generate
open Ingre.xcodeproj
```

Android: Kotlin and Jetpack Compose, minSdk 26. `android/logic` is the same wording and list rules. From `android/`:

```sh
./gradlew :logic:test :app:assembleDebug
```

`npm test` is still only the web app.

