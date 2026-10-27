package app.ingre

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** The phone page. Sections stay on the page. Nothing opens a sheet. */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { PhoneScreen() }
    }
}

@androidx.compose.runtime.Composable
fun PhoneScreen() {
    var picked by remember { mutableStateOf(0) }
    var saved by remember { mutableStateOf(false) }
    var open by remember { mutableStateOf(exploreStartsOpen(picked, saved)) }
    Column(Modifier.padding(16.dp)) {
        Row(Modifier.fillMaxWidth().heightIn(min = 48.dp)) {
            Text("Explore", fontSize = 22.sp, modifier = Modifier.weight(1f).padding(top = 10.dp))
            Button(onClick = { open = !open }, modifier = Modifier.heightIn(min = 48.dp)) {
                Text(if (open) "Hide Explore" else "Show Explore")
            }
        }
        if (open) {
            Text("Search ingredients and recipes", modifier = Modifier.padding(vertical = 8.dp))
        }
        Text("Ingredients", fontSize = 22.sp, modifier = Modifier.padding(top = 16.dp))
        Text("Recipes", fontSize = 22.sp, modifier = Modifier.padding(top = 16.dp))
        Text("Red lentil dahl", fontSize = 18.sp, modifier = Modifier.padding(top = 8.dp))
        Row {
            closedChips(listOf("onion", "garlic")).forEach { chip ->
                Text(
                    chip.name,
                    modifier = Modifier.padding(end = 8.dp).heightIn(min = 48.dp)
                )
            }
        }
        Text("Extra", fontSize = 22.sp, modifier = Modifier.padding(top = 8.dp))
    }
}
