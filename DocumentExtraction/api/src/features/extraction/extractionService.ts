import type Database from "better-sqlite3";
import { DocumentRecord } from "../document/models/document.model.js";
import { DOCUMENT_SQL } from "../document/sqls/document.sql.js";
import { SchemaColumns } from "../schema/models/schema.model.js";
import { SCHEMA_SQL } from "../schema/sqls/schema.sql.js";
import { coerce } from "./coerce.js";
import { LlmRequest } from "./llms/dtos.js";
import { OllamaProvider } from "./llms/ollama.js";
import { DocumentText, LlmFieldAnswer } from "./models/extraction.model.js";
import { schemaToJsonSchema } from "./schemaToJsonSchema.js";
import { DOCUMENT_TEXT_SQL } from "./sql/documentText.sql.js";
import { EXTRACTED_VALUES_SQL } from "./sql/extractedValues.sql.js";

const MAX_INPUT_CHARS = 16000;

const SYSTEM_PROMPT =
  "You extract structured data from documents. Use only information that is " +
  "present in the document. If a field is not stated in the document, return " +
  "null for it. Do not guess.";

function readAnswer(
  result: Record<string, unknown>,
  key: string,
): string | null {
  const field = result[key];
  if (typeof field !== "object" || field === null) return null;

  const value = (field as LlmFieldAnswer).value;
  return typeof value === "string" ? value : null;
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
  const upsert = db.prepare(EXTRACTED_VALUES_SQL.upsert);

  const writeValues = db.transaction(() => {
    for (const [key, columnId] of schemaJson.keyToColumnId) {
      const column = columnsById.get(columnId);
      if (!column) continue;

      // enum_options comes out of SQLite as a raw JSON string.
      const enumOptions: string[] | null = column.enum_options
        ? JSON.parse(column.enum_options)
        : null;

      const raw = readAnswer(answers, key);
      const coerced = coerce(raw, column.data_type, enumOptions);

      upsert.run(
        documentId,
        columnId,
        raw,
        coerced.value_text,
        coerced.value_number,
        coerced.value_date,
      );
    }
  })();
}
