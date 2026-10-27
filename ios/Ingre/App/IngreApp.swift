import SwiftUI

@main
struct IngreApp: App {
    @State private var model: AppModel?
    @State private var failure: String?

    init() {
        do {
            _model = State(initialValue: try AppModel.launch())
        } catch {
            _failure = State(initialValue: String(describing: error))
        }
    }

    var body: some Scene {
        WindowGroup {
            if let model {
                RootView(model: model)
                    .onOpenURL { url in Task { await model.handle(url) } }
            } else {
                Text(failure ?? "")
                    .padding()
                    .accessibilityIdentifier("app.loadError")
            }
        }
    }
}

struct RootView: View {
    @Bindable var model: AppModel

    var body: some View {
        NavigationStack(path: $model.path) {
            ListScreen(model: model)
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .account: AccountScreen(model: model)
                    case .upgrade: UpgradeScreen(model: model)
                    }
                }
        }
        .tint(Theme.text)
        .task {
            await model.account.loadSaved()
        }
    }
}
