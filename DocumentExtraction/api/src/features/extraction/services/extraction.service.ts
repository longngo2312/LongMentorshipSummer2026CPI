import type Database from "better-sqlite3";
import { DocumentRecord } from "../../document/models/document.model.js";
import { DOCUMENT_SQL } from "../../document/sqls/document.sql.js";
import type { ParsedPage } from "../../parsing/types.js";
import { SchemaColumns } from "../../schema/models/schema.model.js";
import { SCHEMA_SQL } from "../../schema/sqls/schema.sql.js";
import { LlmRequest } from "../llms/dtos.js";
import { OllamaProvider } from "../llms/ollama.js";
import {
  DocumentText,
  LlmFieldAnswer,
  PageSpans,
} from "../models/extraction.model.js";
import { DOCUMENT_TEXT_SQL } from "../sql/documentText.sql.js";
import { EXTRACTED_VALUES_SQL } from "../sql/extractedValues.sql.js";
import { coerce } from "../utils/coerce.util.js";
import { resolveQuote } from "../utils/resolveQuote.util.js";
import { schemaToJsonSchema } from "../utils/schemaToJsonSchema.util.js";

const MAX_INPUT_CHARS = 16000;

const SYSTEM_PROMPT =
  "You extract structured data from documents. Use only information that is " +
  "present in the document. If a field is not stated in the document, return " +
  "null for it. Do not guess.\n\n" +
  "For each field also return:\n" +
  '- "quote": the exact sentence or line from the document that contains the ' +
  "answer, copied character-for-character. Do not paraphrase, do not clean it up, " +
  "do not fix typos. If you cannot find the answer, return null.\n" +
  '- "page": the page number the quote came from, read from the "--- page N ---" ' +
  "markers in the document. Content before the first marker is page 1.";

function readAnswer(
  result: Record<string, unknown>,
  key: string,
): LlmFieldAnswer {
  const empty: LlmFieldAnswer = { value: null, quote: null, page: null };
  const field = result[key];
  if (typeof field !== "object" || field === null) return empty;

  const obj = field as Record<string, unknown>;
  const value = typeof obj.value === "string" ? obj.value : null;
  const quote = typeof obj.quote === "string" ? obj.quote : null;
  const page =
    typeof obj.page === "number" && Number.isInteger(obj.page)
      ? obj.page
      : null;

  return { value, quote, page };
}

export async function extractDocument(
  db: Database.Database,
  documentId: number,
): Promise<void> {
  //get parsed text from document
  const parsedText = db
    .prepare(DOCUMENT_TEXT_SQL.getByDocumentId)
    .get(documentId) as DocumentText | undefined;

  if (!parsedText) {
    throw new Error(`no parsed text for document ${documentId}`);
  }

  //get document record (original uploaded doc and a schemaId)
  const documentRecord = db.prepare(DOCUMENT_SQL.getById).get(documentId) as
    | DocumentRecord
    | undefined;

  if (!documentRecord) return;

  //retrieve columns details
  const columns = db
    .prepare(SCHEMA_SQL.getColumnsBySchemaIdOrdered)
    .all(documentRecord.schema_id) as SchemaColumns[];

  if (columns.length === 0) return;

  //turn the columns details into json for llms
  const schemaJson = schemaToJsonSchema(columns);
  const inputText = parsedText.text.slice(0, MAX_INPUT_CHARS);

  const request: LlmRequest = {
    system: SYSTEM_PROMPT,

    prompt: [
      "Fields to extract:",
      schemaJson.fieldLines.join("\n"),
      "",
      "Document:",
      '"""',
      inputText,
      '"""',
    ].join("\n"),
    schema: schemaJson.schema,
  };

  const result = (await OllamaProvider.complete(request)) as unknown;

  if (typeof result !== "object" || result === null) {
    throw new Error(`Ollama returned ${typeof result}, expected an object`);
  }

  const answers = result as Record<string, unknown>;
  const columnsById = new Map(columns.map((col) => [col.id, col]));
  const pages: ParsedPage[] = JSON.parse(parsedText.pages_json);

  // Geometry lives in its own column so the review payload can skip it.
  const pageSpans: PageSpans[] = JSON.parse(parsedText.spans_json);
  const spansByPage = new Map(pageSpans.map((p) => [p.page, p]));

  const upsert = db.prepare(EXTRACTED_VALUES_SQL.upsert);

  db.transaction(() => {
    for (const [key, columnId] of schemaJson.keyToColumnId) {
      const column = columnsById.get(columnId);
      if (!column) continue;

      const enumOptions: string[] | null = column.enum_options
        ? JSON.parse(column.enum_options)
        : null;

      const answer = readAnswer(answers, key);
      const coerced = coerce(answer.value, column.data_type, enumOptions);
      const location = resolveQuote(
        answer.quote,
        pages,
        answer.page,
        spansByPage,
      );

      upsert.run(
        documentId,
        columnId,
        answer.value,
        answer.quote,
        coerced.value_text,
        coerced.value_number,
        coerced.value_date,
        location.page,
        location.start,
        location.end,
        // null rather than "[]": the frontend picks its search fallback on
        // source_boxes being null, so "no geometry" and "geometry that came
        // back empty" have to stay distinguishable.
        location.spanIds.length ? JSON.stringify(location.spanIds) : null,
        location.boxes.length ? JSON.stringify(location.boxes) : null,
        location.matchKind,
        location.confidence,
      );
    }
  })();
}
