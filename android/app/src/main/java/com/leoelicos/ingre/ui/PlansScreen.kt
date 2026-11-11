package com.leoelicos.ingre.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoelicos.ingre.billing.PlanAction
import com.leoelicos.ingre.billing.SubscriptionManager
import com.leoelicos.ingre.billing.Tier
import com.leoelicos.ingre.billing.planAction
import com.leoelicos.ingre.billing.planButtonLabel
import kotlinx.coroutines.launch

/** What each tier adds (docs/TIERS.md). */
private val ADDS = mapOf(
    Tier.EXPLORER to "Suggestions, capture support, triage",
    Tier.MANAGER to "Budget, calendar, composed menus, guest profiles, risk handling",
    Tier.LEADER to "Precise execution, multi-day prep, dietary separation, HACCP, exact technique"
)

/**
 * #314: the Plans screen (only with the `tiers` flag). Monthly subscriptions through
 * Google Play; each tier includes the one below.
 */
@Composable
fun PlansScreen(manager: SubscriptionManager, onBack: () -> Unit) {
    val state by manager.state.collectAsState()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    LaunchedEffect(manager) { manager.load() }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        TextButton(onClick = onBack, modifier = Modifier.heightIn(min = 48.dp)) { Text("Back") }
        Text("Plans", fontSize = 28.sp, modifier = Modifier.semantics { heading() })
        Text("Monthly, through Google Play. Each plan includes the one below. Cancel any time in Google Play.")
        state.message?.let {
            Text(it, modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite })
        }
        if (state.loading) Text("Loading plans…")
        Tier.entries.forEach { tier ->
            val action = planAction(state.current, tier)
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(tier.label, fontSize = 20.sp, modifier = Modifier.semantics { heading() })
                    Text(state.prices[tier]?.let { "$it a month" } ?: tier.fallbackPrice)
                    Text(ADDS[tier].orEmpty())
                    if (action == PlanAction.CURRENT) {
                        // text, not colour, says which plan is yours
                        Text("Your plan")
                    } else {
                        Button(
                            onClick = { manager.choose(tier) },
                            enabled = state.available && !state.busy && !state.loading,
                            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
                        ) { Text(planButtonLabel(state.current, tier)) }
                        if (action == PlanAction.DOWNGRADE) {
                            Text("Starts when your current month ends.", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
        OutlinedButton(
            onClick = { scope.launch { manager.restore() } },
            enabled = state.available && !state.busy,
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
        ) { Text("Restore purchases") }
        OutlinedButton(
            onClick = {
                val sku = state.current?.productId?.let { "&sku=$it" }.orEmpty()
                context.startActivity(
                    Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://play.google.com/store/account/subscriptions?package=${context.packageName}$sku")
                    )
                )
            },
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
        ) { Text("Manage subscription in Google Play") }
    }
}
