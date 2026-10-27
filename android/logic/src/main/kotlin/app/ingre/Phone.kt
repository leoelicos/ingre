package app.ingre

/** The phone page, top to bottom. Same order as the web app below 576px. No overlays. */
enum class PhoneSection {
    Explore,
    Ingredients,
    Recipes,
    Extra
}

fun phoneSections(): List<PhoneSection> = listOf(
    PhoneSection.Explore,
    PhoneSection.Ingredients,
    PhoneSection.Recipes,
    PhoneSection.Extra
)

/** Explore starts open when the list is empty, or when Saved was asked for. Otherwise closed. */
fun exploreStartsOpen(pickedCount: Int, savedRequested: Boolean): Boolean =
    pickedCount == 0 || savedRequested

/** A closed recipe row's chip: the ingredient's name and nothing else. No amount, no badge. */
data class NameChip(val name: String)

fun closedChips(names: List<String>): List<NameChip> = names.map { NameChip(it) }

/** There is never a three-ingredient preview and never a badge (#191, #195). */
const val SHOWS_KEY_INGREDIENT_PREVIEW: Boolean = false
const val SHOWS_BADGES: Boolean = false

data class Line(val ingredientId: String, val name: String, val quantity: Double, val measure: String)

data class StoredRecipe(val id: String, val name: String, val lines: List<Line>)

/**
 * What the list remembers. Explore keeps the original. Recipes keeps the edited copy.
 * Picking stores both. Editing changes only the copy.
 */
data class ListMemory(
    val originals: Map<String, StoredRecipe> = emptyMap(),
    val copies: Map<String, StoredRecipe> = emptyMap()
)

fun pickRecipe(memory: ListMemory, recipe: StoredRecipe): ListMemory =
    if (memory.copies.containsKey(recipe.id)) memory
    else memory.copy(
        originals = memory.originals + (recipe.id to recipe),
        copies = memory.copies + (recipe.id to recipe)
    )

fun editCopy(memory: ListMemory, id: String, lines: List<Line>): ListMemory {
    val copy = memory.copies[id] ?: return memory
    return memory.copy(copies = memory.copies + (id to copy.copy(lines = lines)))
}

fun exploreRecipe(memory: ListMemory, id: String): StoredRecipe? = memory.originals[id]

fun recipeCopies(memory: ListMemory): List<StoredRecipe> = memory.copies.values.toList()

/** "Title (local name)" splits the same way as the web. */
fun splitTitle(name: String): Pair<String, String?> {
    val match = Regex("^(.*\\S)\\s*\\(([^()]+)\\)\\s*$").find(name) ?: return name.trim() to null
    val title = match.groupValues[1]
    val local = match.groupValues[2].trim()
    return title to local
}

/**
 * Upgrade must not start twice. The second tap is ignored and the starting line stays up.
 * Returns whether this call was the one that started checkout.
 */
class UpgradeStarter {
    var starting: Boolean = false
        private set

    fun start(): Boolean {
        if (starting) return false
        starting = true
        return true
    }
}

const val UPGRADE_STARTING: String = "Starting the Stripe checkout…"

/** The login mutation body, so the request can be checked without a server. */
fun loginBody(email: String, password: String): String =
    """{"query":"mutation Login(${'$'}email: String!, ${'$'}password: String!) { login(email: ${'$'}email, password: ${'$'}password) { token } }","variables":{"email":${jsonString(email)},"password":${jsonString(password)}}}"""

private fun jsonString(value: String): String =
    "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
