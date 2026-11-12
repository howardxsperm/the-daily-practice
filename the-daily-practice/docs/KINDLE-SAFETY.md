# Kindle / KOReader safety boundaries

Device context: 11th-generation Kindle; SpringBreak success was reported, and KOReader was opened. This repo does **not** check firmware versions, jailbreak status, native launcher support, or actual KOReader plugin compatibility.

## Default-safe behavior

- The project does not include SpringBreak binaries, firmware modifications, root scripts, update blockers, or destructive cleanup tools.
- `integrations/koreader/dailypractice.koplugin/main.lua` starts with `ENABLE_EXPERIMENTAL_PLUGIN = false`. KOReader's plugin loader should see `{ disabled = true }` if this folder is copied. **Do not turn it on until tested.**
- The repository does not alter or replace any KOReader, Kindle, or Amazon stock file.
- There is no background service, network telemetry, remote shell, or automatic app installation.
- The browser dashboard and KOReader use **different storage**. The current bridge does *not* communicate between them.

## Safe order of testing

1. Confirm KOReader launches and reads normally **without** our plugin.
2. Make an independent Mac backup of your KOReader settings and installed plugin tree.
3. Run `python3 -m unittest discover -s tests -v`, and a Lua syntax check with `luac -p` if you have Lua installed. On a Mac with Lua installed, you can also run `lua tests/test_koreader_mock.lua` from the repository root; it simulates page events without accessing the Kindle.
4. Prefer desktop emulation and manually inspected source first.
5. For an opt-in physical-device test later, copy **only** the `dailypractice.koplugin` directory into KOReader's plugins directory (not onto Amazon's system partition). Restart KOReader. It should remain disabled initially.
6. Only deliberately change the named opt-in switch after testing/understanding the code; then validate menu visibility and page-change events with a non-sensitive test ebook.
7. To roll back, exit KOReader and remove only **our** `dailypractice.koplugin` directory over USB. Do not delete `statistics.koplugin` or other existing plugin directories.

## Specific limitations of experimental counter

- Counts one *forward* page change after at least five seconds on the previous page; it does not prove the page was actually read.
- The saved same-day aggregate count is reloaded after restart, but the in-memory set of previously counted page identities is not. A restart may allow repeated counting.
- KOReader may deliver different page event shapes for different document engines; confirm on real version.
- Page numbers can change with font size or layout; current code clears its active page on `onDocumentRerendered` but cannot guarantee stable EPUB semantics.
- A successful `dailypractice_reading.tsv` write is not the same as a dashboard checkmark. No app-to-app adapter is installed.
- Timers and habit dates depend on the device clock and sleep behavior; are not proof of elapsed reading activity.
- Unknown errors in a third-party plugin can affect KOReader, even though the stock reader and jailbreak are separate.

**Never troubleshoot a KOReader plugin by factory resetting your Kindle.** Remove the experimental plugin first and consult KOReader's documented recovery routes.
