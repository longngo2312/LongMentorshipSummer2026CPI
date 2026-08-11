# Build guide — parsing layer (Mon 10 Aug · PR #1)

## What you're building

One function that takes a file sitting on disk and gives back its text:

```ts
extractText(absolutePath, mimeType) → { text, pages, method, warnings }
```

That's the whole PR. No database writes, no new API routes, no background worker.
Just a function, and a command-line script to run it by hand.

Keeping it that small is deliberate — you can test it today, before tomorrow's
worker exists.

---

## Where this fits: a document's journey

```
STEP 1 — the user uploads
────────────────────────────────────────────────────────────────
  Browser  ──  POST /api/documents (file + schema_id)  ──►  API


STEP 2 — the API stores it and replies immediately        [already built]
────────────────────────────────────────────────────────────────
  writes the file    →  storage/uploads/user_5/a1b2c3.pdf
  inserts a row      →  documents        status = "uploaded"
  inserts a job      →  extraction_jobs  status = "queued"

  ──►  201 back to the browser. The user does NOT wait for parsing.


STEP 3 — a worker picks the job up                       [built Tuesday]
────────────────────────────────────────────────────────────────
  job    status = "queued" → "running"
  doc    status = "uploaded" → "processing"

  calls  extractText(path, mimeType)   ◄── everything below is TODAY


STEP 4 — parsing                                            [TODAY'S PR]
────────────────────────────────────────────────────────────────
  file on disk  ──►  text

  (the rest of this document)


STEP 5 — the worker saves the text                       [built Tuesday]
────────────────────────────────────────────────────────────────
  worked?  →  save text, doc status = "extracted"
  failed?  →  save the reason, doc status = "failed"
```

Today you build Step 4 only. Steps 3 and 5 are tomorrow. That's why
`extractText` takes a file path and returns an object — it knows nothing about
jobs, users, or the database, so it can't be blocked by them.

---

## Inside Step 4: which parser runs?

```
                      extractText(path, mimeType)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  What kind of file?     │
                    └─────────────────────────┘
                                 │
        ┌───────────────┬────────┴────────┬──────────────────┐
        ▼               ▼                 ▼                  ▼
     .pdf          .png .jpg          .docx .xlsx         .txt .csv
                                        .pptx               .md
        │               │                 │                  │
        ▼               ▼                 ▼                  ▼
  pdf.parser.ts   image.parser.ts   office.parser.ts   text.parser.ts
        │               │                 │                  │
        └───────────────┴────────┬────────┴──────────────────┘
                                 ▼
                        same shape comes back
                     { text, pages, method, ... }
```

The four parsers all return the same object, so the worker never has to care
which one ran.

---

## Why PDFs get their own path

A PDF made by Word, Google Docs or a browser's "print to PDF" contains the
**actual letters**. Open it in a reader and you can select and copy the text.
Pulling the text out is instant and perfect.

A PDF made by a **scanner or a phone camera** contains no letters at all. It's
photographs of paper. Selecting text does nothing, because there is no text —
only pixels. Getting words out means running OCR (optical character
recognition): software looks at the picture and guesses what letters it sees.

The two feel identical to the user. Both are "a PDF". But one takes 50
milliseconds and is always right, and the other takes 5 seconds a page and gets
things wrong. So the parser has to tell them apart on its own.

**And a single PDF can be both.** A 30-page contract where someone scanned page
12 because it needed a signature is completely normal. So the check happens
**per page**, not per file.

### How the check works

```
PDF PATH
─────────────────────────────────────────────────────────────────────────
Read the file once. Ask pdf-parse for the text of every page.

   page 1  →  1,743 characters  →  real text        →  keep it
   page 2  →      0 characters  →  must be a scan   →  OCR it
   page 3  →     12 characters  →  must be a scan   →  OCR it
   page 4  →  2,353 characters  →  real text        →  keep it

Then, for each page that needs OCR, one at a time:

   render the page to a PNG image  ──►  Tesseract reads it  ──►  text

Finally, stitch all four pages back together in order.
```

The character counts above are real — I ran this on
`docs/Document Extraction Architecture Design.pdf` and its six pages measured
455 to 2,353 characters each. A scanned page normally comes back with 0 to 30
characters of junk. So **100 characters** is a safe dividing line: it sits in a
wide gap where nothing real lands. Don't agonise over the exact number, but do
make it a named constant, because you'll want to tune it once real scans arrive.

---

## Packages

```bash
cd DocumentExtraction/api
npm i pdf-parse@^2.4.5 tesseract.js
```

| Package                 | Does what                             | Status                             |
| ----------------------- | ------------------------------------- | ---------------------------------- |
| `pdf-parse`             | PDF text, and renders pages to images | on disk, but only as a sub-package |
| `tesseract.js`          | OCR — reads text out of a picture     | not installed                      |
| `office-text-extractor` | docx, xlsx, pptx                      | already installed                  |

`pdf-parse` is already on your machine because `office-text-extractor` depends
on it. Install it properly anyway — otherwise an update to
`office-text-extractor` can quietly take it away and your build breaks for no
visible reason.

**Good news on OCR:** rendering a PDF page to an image normally needs extra
software installed on the machine (Ghostscript, poppler, GraphicsMagick) and is
a well-known pain on Windows. `pdf-parse` does it in JavaScript with no outside
help. I tested it here: 152 ms per page.

---

## The API you'll be calling

I ran all of this on this machine, so it's confirmed working, not copied from docs:

```ts
import { PDFParse } from "pdf-parse";

const parser = new PDFParse({ data: new Uint8Array(fs.readFileSync(file)) });

// --- get the text of every page ---
const result = await parser.getText({ pageJoiner: "" });
result.total; // 6            → number of pages
result.pages; // [{ num: 1, text: "..." }, { num: 2, text: "..." }]
result.text; // every page glued together
// took 673 ms for a 6-page PDF

// --- turn one page into a picture, for OCR ---
const shot = await parser.getScreenshot({
  partial: [3], // page 3 only
  scale: 3, // bigger = easier for OCR to read
  imageDataUrl: false, // skip the base64 copy you'd never use
});
shot.pages[0].data; // Uint8Array — a PNG

await parser.destroy(); // always. it holds a background worker open
```

Two details worth knowing:

- **`pages[].text` is clean.** `pageJoiner` adds "page 3 of 6" markers, but only
  to the glued-together `result.text` — never to the individual pages. So
  counting characters on a page is trustworthy. Set `pageJoiner: ""` anyway and
  glue the pages yourself, so OCR'd pages and normal pages get treated the same.
- **`scale: 3` is about 216 DPI.** Tesseract wants 300 DPI and struggles below 200. `scale: 2` (144 DPI) visibly misreads small print. Start at 3.

---

# The stages

Build them in this order — each one compiles on its own, and each one only uses
things you've already written.

```
src/features/parsing/
├── index.ts                   Stage 10 — the front door
├── router.ts                  Stage  9 — picks a parser
├── types.ts                   Stage  1 — the shape everything returns
├── parsing.error.ts           Stage  2 — how failures are described
├── utils/text.util.ts         Stage  3 — tidying helpers
├── ocr/tesseract.ts           Stage  4 — reads text out of pictures
└── parsers/
    ├── pdf.parser.ts          Stage  5 — the hard one
    ├── image.parser.ts        Stage  6
    ├── office.parser.ts       Stage  7
    └── text.parser.ts         Stage  8

scripts/parse-file.ts          Stage 11 — run it by hand
```

---

## Stage 1 — `types.ts`

**What it is:** the shape every parser hands back. Write it first; everything
else refers to it.

```ts
export type ParseMethod =
  | "pdf-text" // every page had real text
  | "pdf-ocr" // every page was a scan
  | "pdf-hybrid" // some of each
  | "image-ocr"
  | "office"
  | "plain";

export interface ParsedPage {
  page: number; // 1, 2, 3… matching what a person sees in a reader
  text: string;
  source: "text" | "ocr"; // how this page's text was obtained
}

export interface ParsedDocument {
  text: string; // all pages glued together — what the LLM will read
  pages: ParsedPage[];
  pageCount: number;
  method: ParseMethod;
  charCount: number;
  warnings: string[];
  durationMs: number;
}
```

- [x] Write the three types above.

**Why `pages` exists even for a .txt file:** a text file becomes a list of one
page. It looks silly, but on Thursday the chunker splits text for search and
records which page each piece came from, so answers can say "page 4". If some
files have pages and others don't, that chunker needs two code paths — and two
code paths means two sets of bugs.

**Why `warnings` is separate from errors:** warnings are for "this worked, but
you should know something" — like _OCR stopped after 20 of 45 pages_. The
document still parsed. Errors mean nothing came back at all.

## Stage 2 — `parsing.error.ts`

**What it is:** one error type, so tomorrow's worker only has to catch one thing.

```ts
export class ParsingError extends Error {
  constructor(
    public code: "unsupported" | "corrupt" | "empty" | "encrypted",
    message: string,
  ) {
    super(message);
  }
}
```

- [x] Copy the shape of `document/utils/error.utils.ts`, which does the same job
      for uploads.

**Why the code matters:** tomorrow, a failed job gets retried up to 3 times. But
retrying an `unsupported` file is pointless — attempts 2 and 3 fail identically
and just clog the queue. Same for `encrypted`. A `corrupt` file is worth one
retry, since a half-finished upload can look corrupt. The worker reads this code
to decide.

**Write the message for a human.** It ends up in `extraction_jobs.error` and
eventually on the user's screen. "Cannot read .doc files — please save as .docx"
is useful. "ENOENT" is not.

## Stage 3 — `utils/text.util.ts`

**What it is:** three small helpers used by all four parsers.

- [x] `normalizeWhitespace(text)` — turn `\r\n` into `\n`, strip trailing spaces,
      squash 3+ blank lines down to 2.
- [x] `joinPages(pages)` — glue pages together with `\n\n--- page 2 ---\n\n`
      between them.
- [x] `hasUsableText(pageText, min = 100)` — the scan check from earlier.

**Why normalize:** PDF text comes out ragged, with stray spaces and huge runs of
blank lines. On Wednesday you pay the LLM per word, and blank lines are words
you're paying for. It also makes the command-line output readable today.

**Why the page markers:** they give the LLM something concrete to point at when
it cites a source, and they survive being chopped into chunks on Thursday.

## Stage 4 — `ocr/tesseract.ts`

**What it is:** a wrapper that turns a picture into text.

```ts
let workerPromise = null;

function getWorker() {
  if (!workerPromise) workerPromise = createWorker("eng");
  return workerPromise;
}

export async function ocrImage(png: Uint8Array): Promise<string> {
  const worker = await getWorker();
  const { data } = await worker.recognize(Buffer.from(png));
  return data.text;
}
```

- [x] Build the worker **once** and reuse it, exactly as above.
- [x] Export `shutdownOcr()` that calls `worker.terminate()`, and call it on
      `SIGINT` in `server.ts`.
- [x] Double-check `createWorker`'s arguments against whatever version npm
      installs. This changed between tesseract.js v4 and v5, and I couldn't test
      it — the package isn't installed yet.

**Why build it once:** `createWorker` starts a background process and loads a
~10 MB language model. That takes several seconds. Do it per page and a 20-page
scan spends minutes just starting up over and over.

**Why the shutdown matters:** `npm run dev` restarts on every save. Without
`terminate()`, each restart leaves a Tesseract process running. After an
afternoon of editing you'll have a very warm laptop and no idea why.

## Stage 5 — `parsers/pdf.parser.ts`

**What it is:** the path from the diagram above. The only complicated file here.

```ts
const MIN_CHARS_PER_PAGE = 100;
const OCR_PAGE_CAP = 20;
const OCR_SCALE = 3;
```

- [x] Read the file into memory once. Build one `PDFParse`.
- [x] `await parser.getText({ pageJoiner: "" })` → text for every page.
- [x] Sort pages into two lists using `hasUsableText`.
- [x] **If nothing needs OCR, stop here** and return `method: "pdf-text"`. This
      is the common case and it should be the fast one.
- [x] Otherwise, take the first `OCR_PAGE_CAP` pages that need OCR. If there are
      more, add a warning saying how many you skipped.
- [x] OCR them **one at a time**, in a plain `for` loop: `getScreenshot` for that
      page, then `ocrImage`.
- [x] Set `method` — all text → `pdf-text`, all OCR → `pdf-ocr`, mixed →
      `pdf-hybrid`.
- [x] Put `parser.destroy()` in a `finally`.
- [x] If the whole document produced zero characters, throw
      `ParsingError("empty", …)`.

**Why one at a time and not `Promise.all`:** each rendered page is a
multi-megabyte image. Firing off 20 at once means holding 20 in memory
simultaneously, and Tesseract processes them one at a time regardless. You'd get
the same speed and a much bigger memory spike.

**Why cap at 20 pages:** OCR runs 2–8 seconds per page. A 200-page scanned
document would occupy the queue for twenty minutes while every other upload
waits behind it. Better to extract 20 pages, say so in a warning, and keep
moving.

**Why `imageDataUrl: false`:** it defaults to `true`, which base64-encodes every
rendered page into a string. You never read that string. It's pure waste.

**Why throw on empty:** a scanned PDF with more pages than the cap, or a blank
document, would otherwise return `""` — and tomorrow the worker would mark it
"extracted" and hand the LLM nothing. Failing loudly is much easier to debug.

Encrypted PDFs throw from `getText()`. Catch that and rethrow it as
`ParsingError("encrypted", …)` so it doesn't get retried three times.

## Stage 6 — `parsers/image.parser.ts`

**What it is:** the easy half of the OCR path. Someone uploaded a PNG or a photo.

- [x] Read the file, hand it to `ocrImage`, return it as a single page with
      `method: "image-ocr"`.
- [x] If OCR returns nothing, throw `ParsingError("empty", …)` — a photo of a
      whiteboard genuinely can produce zero text.

## Stage 7 — `parsers/office.parser.ts`

**What it is:** Word, Excel and PowerPoint. One library handles all three.

```ts
const text = await getTextExtractor().extractText({
  input: absolutePath,
  type: "file",
});
```

- [] Return it as a single page, `method: "office"`.

**Note on spreadsheets:** the library dumps each sheet as YAML rather than a
table. It looks odd, but it keeps each value attached to its row and column
name, which is exactly what an LLM needs. Resist writing a custom Excel parser
today.

**Note on file types:** this library identifies files by looking _inside_ them,
not by the extension. That's better than trusting `mime_type` in the database,
which came from the user's browser.

## Stage 8 — `parsers/text.parser.ts`

**What it is:** plain text files. The trivial one.

- [x] `fs.readFileSync(path, "utf8")`, normalize, return one page,
      `method: "plain"`.
- [x] Covers `.txt`, `.csv`, `.md`.

**Why CSV isn't parsed properly:** an LLM reads raw comma-separated text
perfectly well. A real CSV parser would give you rows and columns you'd only
flatten back into text anyway.

## Stage 9 — `router.ts`

**What it is:** the branch point in the diagram. Given a file type, pick a parser.

- [ ] A map of file type → parser, plus a second map of extension → parser.
- [ ] Check the mime type first. If nothing matches, fall back to the extension.
- [ ] Still nothing? Throw `ParsingError("unsupported", …)` naming the type.

**Why two maps:** `req.file.mimetype` comes from the user's browser and is often
wrong. Windows reports `.csv` files as `application/vnd.ms-excel`. Some clients
label everything `application/octet-stream`. The extension is also unreliable on
its own — anyone can rename a file. Together they cover nearly everything.

## Stage 10 — `index.ts`

**What it is:** the front door. Tomorrow's worker imports from here and nowhere
deeper.

- [ ] Export `extractText()`: resolve the path, call the router, time it, fill in
      `durationMs` and `charCount`, return.
- [ ] Re-export the types and `ParsingError`.

## Stage 11 — `scripts/parse-file.ts` and an npm script

**What it is:** how you actually see this working today.

```bash
npm run parse -- "../docs/Document Extraction Architecture Design.pdf"
```

- [ ] Print the method, page count, duration, character count, any warnings, then
      the first ~500 characters of each page.
- [ ] Add a `--full` flag that prints everything.

**Why this is worth 20 minutes:** it's the only way to test parsing before the
worker exists. It also stays useful all week — when Wednesday's extraction misses
a field, the first question is always "did we even get that text out?", and this
answers it in two seconds.

Files to test against (put them in `api/tests/fixtures/`):

| File              | Should report       |
| ----------------- | ------------------- |
| the design PDF    | `pdf-text`, 6 pages |
| a scanned PDF     | `pdf-ocr`           |
| a .docx           | `office`            |
| a .xlsx           | `office`            |
| a .pptx           | `office`            |
| a .txt or .csv    | `plain`             |
| a screenshot .png | `image-ocr`         |

No scanned PDF handy? Print a page and photograph it, or print-to-PDF from your
phone's camera roll.

## Stage 12 — fix the upload file types

**What it is:** the upload form currently offers file types nothing can read.

From `frontend/src/utils/upload.ts`:

| Offered in the UI                  | Reality                               |
| ---------------------------------- | ------------------------------------- |
| `.pdf .docx .xlsx .pptx .txt .csv` | works after today                     |
| `.png .jpg .jpeg .tiff`            | works via OCR (test `.tiff` yourself) |
| **`.doc .rtf .xls .ppt`**          | **nothing can read these**            |

Those four are the pre-2007 Microsoft formats. They're a completely different
file structure from `.docx`/`.xlsx`/`.pptx`, and reading them needs a separate
program installed on the server (LibreOffice, or `antiword`). Nothing in the
project touches them, and today's router will reject all four.

- [ ] Remove those four from `ACCEPTED_FILE_TYPES`.
- [ ] Add the same check on the server, as a multer `fileFilter` in
      `document/utils/storage.util.ts`, sharing the list from `router.ts`.

**Why the server check is the important half:** the `accept` attribute on a file
input is only a suggestion. Drag-and-drop ignores it, and anyone calling the API
directly never saw it. Rejecting at upload with a 400 also tells the user
_immediately_ — rather than showing a cheerful green "uploaded" row that quietly
turns red 30 seconds later with no explanation.

---

## Not today

- **Anything touching the database or job queue.** That's tomorrow. Mixing it in
  makes this PR hard to review and hard to roll back.
- **Splitting text into chunks for search.** Thursday. Today's parser returns
  page text; it doesn't decide how that gets sliced.
- **Reading tables out of PDFs.** `pdf-parse` has a `getTable()` and it is very
  tempting. Wait until Wednesday shows plain text isn't good enough.
- **Languages other than English.** `createWorker("eng")` stays hardcoded.

## Checking your work

```bash
cd DocumentExtraction/api
npx tsc --noEmit
npm run parse -- <each test file>
```

You're done when every test file parses, the scanned PDF reports `pdf-ocr` or
`pdf-hybrid`, and uploading a `.doc` is refused at upload time rather than
failing later.

## House rules

- `.then()` always gets an explicit arrow: `.then((x) => f(x))`, never
  `.then(f)`. Mostly `async/await` here, but it will come up.
- Follow the existing folder shape — `features/parsing/{parsers,ocr,utils}`.
  No `controllers/` or `routes/` folder: parsing isn't an endpoint, it's a
  library the worker calls.
- No bare numbers in the code. `MIN_CHARS_PER_PAGE`, `OCR_PAGE_CAP` and
  `OCR_SCALE` are all values you _will_ tune once you see real scans, and you
  want one obvious place to change them.
