// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "IngreCore",
    products: [
        .library(name: "IngreCore", targets: ["IngreCore"])
    ],
    targets: [
        .target(name: "IngreCore"),
        .testTarget(name: "IngreCoreTests", dependencies: ["IngreCore"])
    ]
)
