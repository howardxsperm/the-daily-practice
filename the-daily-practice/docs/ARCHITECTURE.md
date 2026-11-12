# Architecture: separation before integration

## Present state

```text
Chrome / modern browser
  dashboard/index.html + style.css + app.js
    ↳ localStorage: settings, habits, notes, training
    ↳ IndexedDB: user-imported ebook blobs
    ↳ TXT viewer: two forward page advances → read habit

KOReader (separate application)
  KOReader internal reader + own book/state storage
  integrations/koreader/dailypractice.koplugin (disabled by default)
    ↳ when opted in, intended output: settings/dailypractice_reading.tsv

NO automatic bridge between these systems exists yet.
```

## Planned integration boundary

A **read-only bridge adapter** should accept normalized events:

```json
{"event":"read_goal","date":"YYYY-MM-DD","pages":2,"complete":true,"source":"koreader"}
```

This JSON is a **proposed interchange contract**, not existing output. The Lua prototype writes a 3-column TSV. We should not have the browser poll KOReader files unless access is explicitly available and safe; a controlled file transfer or local host adapter may be required.

## Constraints

- Keep browser prototype functional with no KOReader installed.
- Never claim the browser's `read` check equals KOReader progress until synchronization is implemented.
- Keep user-generated data local and backed up; avoid embedding data in repo.
- Aim for no animation, event-driven repaint, and browser-neutral styling. Native e-ink waveforms require separate testing.
- Preserve training tools: stack, script rehearsal, effect knowledge; keep browser launcher.
- Future Ask Book needs independent text indexing/citations; the current app only searches TXT.
