import type { SchemaColumns } from "../../schema/models/schema.model.js";
import type { SchemaJson } from "../models/extraction.model.js";

function dedupeSlug(slug: string, used: Set<string>): string {
  if (!used.has(slug)) return slug;
  let suffix = 2;
  while (used.has(`${slug}_${suffix}`)) suffix++;
  return `${slug}_${suffix}`;
}

function slugify(name: string, used: Set<string>): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/#/g, "_number")
    .replace(/[^\w]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  const slug = dedupeSlug(base, used);
  used.add(slug);
  return slug;
}

export function schemaToJsonSchema(columns: SchemaColumns[]): SchemaJson {
  const properties: Record<string, unknown> = {};
  const keyToColumnId = new Map<string, number>();
  const fieldLines: string[] = [];
  const usedSlugs = new Set<string>();
  const required: string[] = [];

  for (const col of columns) {
    const slug = slugify(col.name, usedSlugs);

    // Every property is { value, quote, page }. The quote/page fields let the
    // server verify provenance after extraction.
    const quoteProps = {
      quote: { type: ["string", "null"] },
      page: { type: ["integer", "null"] },
    };

    if (col.data_type === "enum" && col.enum_options) {
      const options: string[] = JSON.parse(col.enum_options);
      properties[slug] = {
        type: "object",
        properties: { value: { enum: [...options, null] }, ...quoteProps },
        required: ["value", "quote", "page"],
        additionalProperties: false,
      };

      const enumList = options.join(", ");
      fieldLines.push(
        col.description
          ? `- ${slug} (enum: ${enumList}): ${col.description}`
          : `- ${slug} (enum: ${enumList})`,
      );
    } else {
      properties[slug] = {
        type: "object",
        properties: { value: { type: ["string", "null"] }, ...quoteProps },
        required: ["value", "quote", "page"],
        additionalProperties: false,
      };

      fieldLines.push(
        col.description
          ? `- ${slug} (${col.data_type}): ${col.description}`
          : `- ${slug} (${col.data_type})`,
      );
    }

    keyToColumnId.set(slug, col.id);
    required.push(slug);
  }

  const schema: Record<string, unknown> = {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };

  return { schema, keyToColumnId, fieldLines };
}
