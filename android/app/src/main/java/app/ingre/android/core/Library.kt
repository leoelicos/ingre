package app.ingre.android.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** Shop sections (mirrors client/src/utils/shopping/sections.ts), in shop order. */
@Serializable
enum class ShopSection(val raw: String, private val key: String) {
    @SerialName("Fruit & Veg")
    FruitVeg("Fruit & Veg", "fruitVeg"),

    @SerialName("Meat & Seafood")
    MeatSeafood("Meat & Seafood", "meatSeafood"),

    @SerialName("Dairy, Eggs & Fridge")
    Dairy("Dairy, Eggs & Fridge", "dairy"),

    @SerialName("Deli")
    Deli("Deli", "deli"),

    @SerialName("Bakery")
    Bakery("Bakery", "bakery"),

    @SerialName("Pantry")
    Pantry("Pantry", "pantry"),

    @SerialName("Frozen")
    Frozen("Frozen", "frozen"),

    @SerialName("Other")
    Other("Other", "other")
    ;

    /** The short name a chip and its heading show ("Dairy", not the full name). */
    val label: String get() = L10n.t("section.$key")

    companion object {
        fun fromRaw(raw: String): ShopSection? = entries.firstOrNull { it.raw == raw }

        /** The section a catalogue aisle sits in; unknown aisles are Other. */
        fun forAisle(aisle: String): ShopSection = when (aisle) {
            "fruit & veg" -> FruitVeg

            "meat", "seafood" -> MeatSeafood

            "dairy & eggs" -> Dairy

            "deli" -> Deli

            "bakery" -> Bakery

            "baking", "canned food", "herbs & spices", "international", "oils & vinegar",
            "pasta & rice", "sauces", "breakfast & spreads", "tea & coffee"
            -> Pantry

            else -> Other
        }
    }
}

/** The colour family a section's chips use (ingredients.json `sectionColours`). */
@Serializable
enum class SectionTone {
    @SerialName("produce")
    Produce,

    @SerialName("meat")
    Meat,

    @SerialName("dairy")
    Dairy,

    @SerialName("deli")
    Deli,

    @SerialName("bakery")
    Bakery,

    @SerialName("pantry")
    Pantry,

    @SerialName("frozen")
    Frozen,

    @SerialName("neutral")
    Neutral
}

@Serializable
enum class BaseUnit(val raw: String) {
    @SerialName("g")
    G("g"),

    @SerialName("ml")
    Ml("ml"),

    @SerialName("count")
    Count("count")
}

@Serializable
data class Amount(val amount: Double, val unit: BaseUnit)

@Serializable
data class SoldOption(val type: String, val size: Amount? = null)

@Serializable
data class CountUnit(val one: String, val other: String)

/** One catalogue item (client/src/data/ingredients.json). */
@Serializable
data class LibraryIngredient(
    val id: String,
    val name: String,
    val category: String,
    val staple: Boolean? = null,
    val sold: List<SoldOption>,
    val approxGrams: Double? = null,
    val measureGrams: Map<String, Double>? = null,
    val allergens: List<String> = emptyList(),
    val countUnit: CountUnit? = null,
    val partMeasure: String? = null
) {
    val section: ShopSection get() = ShopSection.forAisle(category)
}

@Serializable
data class LibraryRecipeIngredient(val ingredientId: String, val quantity: Double, val measure: String)

/** One library recipe (client/src/data/recipes.json). */
@Serializable
data class LibraryRecipe(
    val id: String,
    val name: String,
    val portions: Int,
    val ingredients: List<LibraryRecipeIngredient>,
    val method: List<String> = emptyList()
) {
    /** "Shaking beef (bò lúc lắc)" -> "Shaking beef": the row title without a local name. */
    val title: String get() {
        val open = name.lastIndexOf('(')
        if (open < 0 || !name.endsWith(")")) return name.trim()
        val head = name.substring(0, open).trim()
        return head.ifEmpty { name }
    }
}

/** The bundled library: the web client's JSON, copied into the assets at build time (#195). */
class Library(
    val ingredients: List<LibraryIngredient>,
    val recipes: List<LibraryRecipe>,
    private val sectionTones: Map<ShopSection, SectionTone>
) {
    private val itemsById = ingredients.associateBy { it.id }
    private val recipesById = recipes.associateBy { it.id }

    fun item(id: String): LibraryIngredient? = itemsById[id]

    fun recipe(id: String): LibraryRecipe? = recipesById[id]

    fun tone(section: ShopSection): SectionTone = sectionTones[section] ?: SectionTone.Neutral

    @Serializable
    private data class IngredientFile(
        val sectionColours: Map<String, SectionTone>,
        val ingredients: List<LibraryIngredient>
    )

    @Serializable
    private data class RecipeFile(val recipes: List<LibraryRecipe>)

    companion object {
        private val json = Json { ignoreUnknownKeys = true }

        /** Parses the two files; a typo in the data fails loudly, as on the web. */
        fun parse(ingredients: String, recipes: String): Library {
            val items = json.decodeFromString<IngredientFile>(ingredients)
            val dishes = json.decodeFromString<RecipeFile>(recipes)
            val tones = items.sectionColours.mapNotNull { (key, tone) -> ShopSection.fromRaw(key)?.let { it to tone } }
            return Library(items.ingredients, dishes.recipes, tones.toMap())
        }
    }
}

/** "brown onion" -> "Brown onion", for a name that starts a sentence. */
fun capitaliseFirst(text: String): String = text.replaceFirstChar { it.uppercaseChar() }
