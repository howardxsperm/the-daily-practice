# Experimental KOReader plugin

`dailypractice.koplugin` is based on the **separate plugin extension pattern** exposed by KOReader's Hello example and the page-statistics behavior studied in KOReader's Reading Statistics plugin. We **do not** vendor KOReader or overwrite either original plugin.

**It is disabled by default in `main.lua`.** This is intentional, not a bug.

What happens if enabled: a status menu item tracks forward page progress with a minimum dwell time, writes a three-field TSV to the reader settings dir, and reloads the same-day aggregate on restart. This is **not** a complete or device-verified tracker; it does not communicate with the Chrome dashboard. A restart resets the list of seen page identities, so old pages can be re-counted.

Before installing, follow `../../docs/KINDLE-SAFETY.md` from repo root (or [Kindle safety](../../docs/KINDLE-SAFETY.md)). Only an explicit, tested opt-in should alter the flag. To undo an experiment, remove this plugin folder; do not alter stock KOReader code.
