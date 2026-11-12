# the daily practice. — v0.3 / underground edition

A minimal, local-first **browser prototype** for a Kindle-inspired habit dashboard and a professional magician's rehearsal workspace.

Designed around the principles in *Atomic Habits* by James Clear. This is an independent interpretation, **not an official James Clear product**. The editorial monochrome imagery in this version was generated for this project; it is not affiliated with VICE.

## Open in Chrome (Windows)

1. Extract `daily-practice-v0.3-underground.zip` into a folder.
2. Open the extracted `daily-practice-v0.3-underground` folder.
3. Double-click **`index.html`**, or drag it into Chrome.
4. The homepage should open with **read, meditate, study, journal**, the magician's desk, and the browser link.

**For more reliable browser storage**, use a stable local address rather than moving `index.html` between different folders:

```powershell
cd path\to\daily-practice-v0.3-underground
py -m http.server 8000
```

Then visit `http://localhost:8000` in Chrome. Leave the terminal window open while using it. This local server uses only your own PC; internet access is not required for the dashboard. (`python -m http.server 8000` also works if your Python command is `python`.) Keep using the **same address and folder** in future sessions so the browser can find its saved data.

Do not move the entire project to a different URL/path expecting browser data to follow automatically. **Export your dashboard data regularly** from `notifications → export private data / settings`, and keep the original ebook files.

## What's included

| Area | Working features in v0.3 |
|---|---|
| Home | Four editorial anchor cards, six compact wellbeing tiles, full-width black magician's desk banner, six utility tiles; occult emblem, bold lowercase typography |
| Automatic checkmarks | Journal: a sentence with punctuation when saved. Study: successful flashcard or a saved concept. Meditate: 120+ seconds completed. Read: two new forward pages in the built-in TXT reader. |
| The magician's desk | Functional **stack trainer**, **script rehearsal**, and **effect knowledge** review; persistent private notes for repertoire, show builder, prop inventory, research, and performance log |
| Stack trainer | Custom ordered decks, card-to-position, position-to-card, previous/next, cyclical wraparound |
| Script rehearsal | Custom scripts separated into beats; private cue/reveal/review interaction |
| Flashcards | "reveal", "again", and "got it"; self-rated history and simple due-date intervals for successful reviews |
| Library | Import/store PDF, TXT, EPUB in IndexedDB; reading statuses; TXT reading with saved page; PDF opens in built-in Chrome viewer; EPUB export |
| Local passage search | Keyword retrieval across TXT books, with book/page references. **This is not a generative LLM.** |
| RSS | Save feed URLs, import offline RSS/Atom XML or OPML sources, browse/save cached articles; manual network refresh if CORS permits |
| Browser | Address/search box, open in new tab or same tab, bookmark manager. **Uses Chrome/Kindle's existing web browser.** |
| Timer | Static/quarter-mark focus and meditation timer, stopwatch; background timing while this page remains open |
| Calendar, notifications | Locally stored appointments and manual reminder inbox; no Google/Apple sync and no system push |
| E-ink mode | Top-right **clean ink** control removes photography, dot textures, and visual noise for a simpler static high-contrast screen; no CSS animations |
| Backup | JSON export/import of private dashboard data **except ebook file blobs** |

## How the automatic checks work

- **read:** In an imported `.txt` ebook, press **next page** twice into two previously unreached pages that day. The app tracks new page advances, not just taps. TXT pages are ~1,200 characters, *not* Kindle hardware page positions.
- **meditate:** Start a 2+ minute meditation timer and let it reach completion while the app remains running.
- **study:** Answer a training question, reveal, and mark **got it**, or write and save a short concept.
- **journal:** Write and save an entry containing a sentence ending with `.`, `!`, or `?`. A simple heuristic is used, not a full grammar parser.

The homepage shows ✓ upon returning. Completion does not prevent further use. No streak punishments.

## Using the magician's desk

1. Select **the magician's desk.** from the homepage or top navigation.
2. Open **stack trainer**. The included 52-card deck is **ordinary new-deck order only**, a demonstrator—not a claimed memorized stack.
3. For tarot, click **new stack**, enter a title, then paste each card name on its own line in *your exact order*. The app wraps around from last card to first for neighbor drills.
4. In **script rehearsal**, use a blank line to separate beats. Put the short **cue on the first line** and the hidden passage on subsequent lines. Click **rehearse** to test recall.
5. Use **effect knowledge** to add your own method, terminology, sourcing, and reset questions. This content is private on this device and never appears on the homepage.

### Custom script format example

```text
Introduce the story
There's something interesting about how people used to understand memory.

Invite the participant
Would you mind helping me with something for a moment?
```

## Ebooks and offline search

- **TXT** is readable in-app and searchable via Ask Book / Ask Library. Imported TXT books are paginated approximately; this is a prototype, not a full ebook typesetting engine.
- **PDF** opens in Chrome's PDF viewer. Its page events aren't exposed to the dashboard, so the **read** checkmark requires manual confirmation for PDFs.
- **EPUB** files are stored and exportable but **do not render inside v0.3**. This is intentionally disclosed rather than pretending an EPUB engine exists.

For a **DRM-free EPUB**, you can optionally convert it to a readable, searchable TXT file with the included **standard-library-only Python tool**:

```powershell
py tools\epub_to_txt.py "My Book.epub"
```

It creates `My Book.txt` next to the input file; import that TXT in Library. It respects the EPUB spine reading order but does not reproduce book typography or images. DRM-protected material is unsupported.

**Ask Book** in v0.3 is only passage retrieval from your own TXT files. A truly offline LLM and cross-format RAG index remain future work and require more processing power than this browser prototype can assume.

## Browser and RSS notes

- **browser** is a gateway to the actual web browser, not a sandboxed iframe. External sites usually block being embedded. "Open in new tab" tries to keep the dashboard available; "open in this tab" is a fallback for browsers without tab support.
- RSS subscriptions are manual. A direct network refresh may fail because of CORS restrictions; the app explains this. You can import an RSS or Atom XML download for **fully offline article snapshots**. OPML import saves subscriptions but does not itself download their articles.

## Privacy and compatibility

- No analytics, tracking scripts, remote API calls, ads, CDNs, background network polling, or animation libraries are included.
- User notes, scripts, bookmarks, habit records, and RSS text are stored in this browser's **localStorage**. Ebook blobs are in **IndexedDB**. Site-data deletion, browser-profile switching, or origin changes can remove the saved data.
- Your browser's private/incognito mode may not preserve data after closing.
- Exported JSON backups can contain sensitive private rehearsal notes. Store them appropriately. EPUB/PDF/TXT blobs are **not** included in those backups.
- JS timers are accurate by checking the clock rather than repainting each second; they **do not keep running once the browser process is closed**. Sleep/throttling behavior varies.
- This is built for **modern Chrome** first. **Kindle firmware 5.19.2.0.1, jailbroken Kindle browser access, native e-ink partial refresh, and actual on-device compatibility have NOT been tested.** The prototype does not replace the Kindle launcher or its stock reader.
- CSS animations and transitions are completely absent. E-ink mode simplifies imagery but cannot command native Kindle refresh hardware from a regular browser page.

## Folder map

```text
daily-practice-v0.3/
  index.html             entry point for Chrome
  style.css              responsive monochrome editorial layout
  app.js                 navigation, timers, training, storage, RSS, reader
  assets/*.jpg           cropped, compressed monochrome editorial art
  tools/epub_to_txt.py   optional offline, DRM-free EPUB-to-TXT conversion
  README.md              this guide
  CHANGELOG.md           build summary
```

## Good next milestones (not yet implemented)

1. Native or compatible EPUB renderer with stable chapter anchors and reading progress.
2. Real EPUB/PDF text extraction and cited, offline Ask Book index; optional PC-hosted LLM connector.
3. A Kindle-specific integration layer, after confirming model, browser capabilities, and a safe modification path.
4. Export/import that includes ebooks, plus improved scheduled practice algorithms.

*the daily practice. — small actions. lasting change.*

## Underground visual revision (same v0.3 functions)

This edition follows the portrait concept combining modernist clarity and underground zine art direction: large lowercase wordmark, restrained occult eye emblem, halftone-style monochrome imagery, precise 2×2 / 3×2 grid, and a bold featured magician's desk. **All old v0.3 functions remain present.** The tool and training screens keep their working behavior.

The masthead **clean ink / editorial ink** control switches between the photographed editorial treatment and the plainer e-ink profile. Nothing animates; screen updates occur on actions or necessary timer milestones. These are browser render decisions, not low-level Kindle waveform controls.

**Data precaution:** The storage key was not changed, so existing data should persist if you deploy the revised files at exactly the same local URL/origin. If you move folders, open a different file URL, or change browser profiles, stored data may not follow. Export a JSON backup from `notifications → settings` before replacing the older version; export does not include ebook blobs.

**Viewport target:** The layout is responsive and is checked at 600×800 and a narrower portrait viewport in Chrome. Native Kindle browser support and physical e-ink refreshes still require on-device testing.
