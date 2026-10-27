import com.android.build.api.variant.ApplicationVariant
import javax.inject.Inject
import org.gradle.process.ExecOperations

// #195: the ingré Android app (Kotlin, Jetpack Compose, Hilt, Apollo Kotlin, DataStore).
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
    alias(libs.plugins.apollo)
}

android {
    namespace = "app.ingre.android"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "app.ingre.android"
        minSdk = 26
        targetSdk = 37
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "app.ingre.android.HiltTestRunner"
        // screenshots are written with TestStorage and pulled by the Gradle run
        testInstrumentationRunnerArguments["useTestStorageService"] = "true"
        buildConfigField("String", "WEB_ORIGIN", "\"https://ingre.vercel.app\"")
        buildConfigField("String", "CHECKOUT_BASE_URL", "\"https://checkout.stripe.com/c/pay/\"")
    }

    buildTypes {
        debug {
            // Debug talks to the live Render server so journeys can be checked end to end.
            // Use http://10.0.2.2:3001/graphql for a server on the emulator's host.
            buildConfigField("String", "GRAPHQL_URL", "\"https://ingre-backend.onrender.com/graphql\"")
        }
        release {
            buildConfigField("String", "GRAPHQL_URL", "\"https://ingre-backend.onrender.com/graphql\"")
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    testOptions {
        unitTests {
            isReturnDefaultValues = true
            all { it.useJUnitPlatform() }
        }
        animationsDisabled = true
    }

    lint {
        warningsAsErrors = true
        abortOnError = true
        checkReleaseBuilds = true
        lintConfig = file("lint.xml")
    }

    packaging {
        resources.excludes += setOf("META-INF/LICENSE*", "META-INF/AL2.0", "META-INF/LGPL2.1")
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

apollo {
    service("ingre") {
        packageName.set("app.ingre.android.graphql")
        // the schema is exported from the server by scripts/export-graphql-schema.sh
        schemaFiles.from("src/main/graphql/schema.graphqls")
        srcDir("src/main/graphql")
        mapScalar("ID", "kotlin.String")
    }
}

/**
 * Copies client/src/data/recipes.json and ingredients.json into the build's assets with
 * scripts/copy-native-data.sh. The web client's files are the only copy (#195).
 */
abstract class CopyNativeData
@Inject
constructor(private val exec: ExecOperations) : DefaultTask() {
    @get:InputFile
    @get:PathSensitive(PathSensitivity.RELATIVE)
    abstract val script: RegularFileProperty

    @get:InputFiles
    @get:PathSensitive(PathSensitivity.RELATIVE)
    abstract val data: ConfigurableFileCollection

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @TaskAction
    fun copy() {
        exec.exec {
            commandLine("sh", script.get().asFile.absolutePath, outputDir.get().asFile.absolutePath)
        }
    }
}

val repoRoot = rootDir.parentFile

androidComponents {
    onVariants { variant: ApplicationVariant ->
        val name = variant.name.replaceFirstChar { it.uppercase() }
        val task =
            tasks.register<CopyNativeData>("copy${name}NativeData") {
                script.set(File(repoRoot, "scripts/copy-native-data.sh"))
                data.from(
                    File(repoRoot, "client/src/data/recipes.json"),
                    File(repoRoot, "client/src/data/ingredients.json")
                )
            }
        variant.sources.assets?.addGeneratedSourceDirectory(task, CopyNativeData::outputDir)
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.hilt.lifecycle.viewmodel.compose)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.browser)
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.foundation)
    implementation(libs.compose.material3)
    implementation(libs.compose.ui.tooling.preview)
    debugImplementation(libs.compose.ui.tooling)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.apollo.runtime)
    implementation(libs.okhttp)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)

    testImplementation(platform(libs.junit.bom))
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly(libs.junit.platform.launcher)
    testImplementation(libs.turbine)
    testImplementation(libs.kotlinx.coroutines.test)

    androidTestImplementation(platform(libs.compose.bom))
    androidTestImplementation(libs.compose.ui.test.junit4)
    debugImplementation(libs.compose.ui.test.manifest)
    androidTestImplementation(libs.androidx.test.runner)
    androidTestImplementation(libs.androidx.test.core)
    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.test.storage)
    androidTestUtil(libs.androidx.test.services)
    androidTestImplementation(libs.hilt.android.testing)
    kspAndroidTest(libs.hilt.compiler)
}
