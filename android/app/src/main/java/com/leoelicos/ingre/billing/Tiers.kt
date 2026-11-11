package com.leoelicos.ingre.billing

import com.leoelicos.ingre.BuildConfig

/**
 * #314: the three tiers from #208/#312, sold as Google Play subscriptions. The product ids
 * are the same as the Stripe lookup keys and the App Store product ids.
 */
enum class Tier(val productId: String, val label: String, val usdPerMonth: Int) {
    EXPLORER("ingre_explorer_monthly", "Explorer", 4),
    MANAGER("ingre_manager_monthly", "Manager", 8),
    LEADER("ingre_leader_monthly", "Leader", 16);

    /** Shown until Google Play gives the local price. */
    val fallbackPrice: String get() = "$usdPerMonth USD a month"

    companion object {
        val productIds: List<String> = entries.map { it.productId }
        fun of(productId: String?): Tier? = entries.firstOrNull { it.productId == productId }
    }
}

/**
 * The `tiers` flag (#208). Off by default in native builds so publishing isn't affected;
 * a build with `-Pingre.tiers=true` turns Plans on.
 */
object Flags {
    val tiers: Boolean get() = BuildConfig.TIERS
}
