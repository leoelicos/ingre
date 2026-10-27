import Foundation

/// Canned GraphQL answers for UI tests and screenshots (#195). The real Apollo client sends real
/// requests; this URLProtocol answers them by operation name, so every type is decoded for real.
/// Launch with INGRE_MOCK=success, server-error (HTTP 500) or not-found (HTTP 404).
enum MockMode: String, Sendable {
    case success
    case serverError = "server-error"
    case notFound = "not-found"

    var status: Int {
        switch self {
        case .success: 200
        case .serverError: 500
        case .notFound: 404
        }
    }
}

final class MockURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) static var mode: MockMode = .success
    /// Seconds before each answer (INGRE_MOCK_DELAY), so a test can see "Starting…".
    nonisolated(unsafe) static var delay: TimeInterval = 0

    /// A token the app accepts: a real JWT shape for "Ann", expiring in 2100.
    static let token: String = {
        func part(_ json: String) -> String {
            Data(json.utf8).base64EncodedString().replacingOccurrences(of: "=", with: "")
                .replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_")
        }
        let payload = #"{"data":{"_id":"u1","email":"ann@example.com","firstName":"Ann","pro":false},"exp":4102444800}"#
        return "\(part(#"{"alg":"HS256","typ":"JWT"}"#)).\(part(payload)).mock"
    }()

    static func body(for operation: String) -> String {
        let user = #"{"__typename":"User","_id":"u1","email":"ann@example.com","firstName":"Ann","pro":false}"#
        switch operation {
        case "Login":
            return #"{"data":{"login":{"__typename":"Auth","token":"\#(token)","user":\#(user)}}}"#
        case "GetUser":
            return #"{"data":{"getUser":\#(user)}}"#
        case "GetSavedRecipes":
            return #"{"data":{"getSavedRecipes":[]}}"#
        case "SaveRecipe":
            return #"{"data":{"saveRecipe":{"__typename":"Recipe","_id":"saved-1","libraryId":null}}}"#
        case "RemoveRecipe":
            return #"{"data":{"removeRecipe":true}}"#
        case "Checkout":
            return #"{"data":{"checkout":{"__typename":"Checkout","session":"cs_test_mock"}}}"#
        case "MakeUserPro":
            return #"{"data":{"makeUserPro":{"__typename":"User","_id":"u1","pro":true}}}"#
        default:
            return #"{"errors":[{"message":"Unknown operation \#(operation)"}]}"#
        }
    }

    static func operationName(_ request: URLRequest) -> String {
        var data = request.httpBody
        if data == nil, let stream = request.httpBodyStream {
            stream.open()
            defer { stream.close() }
            var bytes = Data()
            var buffer = [UInt8](repeating: 0, count: 4096)
            while stream.hasBytesAvailable {
                let read = stream.read(&buffer, maxLength: buffer.count)
                if read <= 0 { break }
                bytes.append(buffer, count: read)
            }
            data = bytes
        }
        if let data, let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let name = json["operationName"] as? String
        {
            return name
        }
        return URLComponents(url: request.url!, resolvingAgainstBaseURL: false)?
            .queryItems?.first { $0.name == "operationName" }?.value ?? ""
    }

    override static func canInit(with request: URLRequest) -> Bool { true }
    override static func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        let mode = Self.mode
        let body =
            mode == .success
            ? Self.body(for: Self.operationName(request))
            : #"{"errors":[{"message":"HTTP \#(mode.status)"}]}"#
        let response = HTTPURLResponse(
            url: request.url!, statusCode: mode.status, httpVersion: "HTTP/1.1",
            headerFields: ["Content-Type": "application/json"]
        )!
        let send: @Sendable () -> Void = { [self] in
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: Data(body.utf8))
            client?.urlProtocolDidFinishLoading(self)
        }
        if Self.delay > 0 {
            DispatchQueue.global().asyncAfter(deadline: .now() + Self.delay, execute: send)
        } else {
            send()
        }
    }

    override func stopLoading() {}

    static func session() -> URLSession {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [MockURLProtocol.self]
        return URLSession(configuration: configuration)
    }
}
