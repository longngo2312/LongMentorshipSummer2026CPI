import { Request, Response } from "express";
import { openTenantDB, tenantDBPath } from "../db/tenantDB.js";
import type { DocumentSchema, SchemaColumns } from "../types/index.js";

function getTenantDB(userId: number) {
  return openTenantDB(tenantDBPath(userId));
}

//get(/)
export function getAllSchemas(req: Request, res: Response) {
  const { userId } = req.user!;
  const db = getTenantDB(userId);
  const schema = db
    .prepare(
      // query everything in document schema as well as count of total column per schema
      `
    SELECT *, COUNT(DISTINCT id) AS column_count FROM document_schemas
        LEFT JOIN schema_columns ON document_schemas.id = schema_columns.schema_id
        GROUP BY document_schemas.id 
        ORDER BY document_schemas.created_at DESC;
    `,
    )
    .all();
  res.json(schema); //send schema back to frontend as a json
}

//get(/:id) get schema details by id
export function getSchemaDetails(req: Request, res: Response) {
  //this will return the schema from document_schema as well as its columns
  const db = getTenantDB(req.user!.userId); //open database whose userid is userid
  const schema = db
    .prepare(`SELECT * FROM document_schemas WHERE id = ?;`)
    .get(req.params.id) as DocumentSchema | undefined;

  if (!schema) {
    return res.status(404).json({ error: "Schema Not Found" });
  }
  const schemaColumns = db
    .prepare(`SELECT * FROM schema_columns WHERE schema_id = ?;`)
    .all(req.params.id) as SchemaColumns[]; //return every single rows thus the array type

  res.json({ ...schema, schemaColumns }); //return the schema as well as the arrays of rows
}

//post(/) create schema
export function createSchema(req: Request, res: Response) {
  const { name, description, columns } = req.body;
  const db = getTenantDB(req.user!.userId); //open database whose userid is userid
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  if (!Array.isArray(columns)) {
    return res.status(400).json({
      error: "Columns must be an array",
    });
  }
  //inserting rows into db
  const insertSchema = db
    .prepare(`INSERT INTO document_schemas (name, description) VALUES (?, ?);`)
    .run(name, description);

  const insertColumns = db.prepare(
    `INSERT INTO schema_columns (schema_id, name, description, data_type, enum_options, required, position) VALUES (?,?,?,?,?,?,?);`,
  );

  const transaction = db.transaction(() => {
    const { lastInsertRowid } = insertSchema;
    const schemaId = Number(lastInsertRowid);
    for (let i = 0; i < columns.length; i++) {
      let col = columns[i];
      insertColumns.run(
        schemaId,
        col.name,
        col.description,
        col.data_type ?? "text",
        col.enum_options ? JSON.stringify(col.enum_options) : null,
        col.required ? 1 : 0,
        i,
      );
    }
    return schemaId;
  })();

  res.status(200).json({ message: "Create Schema successfully", transaction });
}

//update schema
export function updateSchema(req: Request, res: Response) {
  const { name, description, columns } = req.body;
  const db = getTenantDB(req.user!.userId);

  const existing = db
    .prepare("SELECT id FROM document_schemas WHERE id = ?;")
    .get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Schema not found" });
    return;
  }

  const updateSql = db.prepare(
    `UPDATE document_schemas
     SET name = COALESCE(?, name), 
         description = COALESCE(?, description),
         updated_at = datetime('now')
     WHERE id = ?;`, // Coalesce update the value if not null use the original otherwise
  );

  const deleteColumns = db.prepare(
    "DELETE FROM schema_columns WHERE schema_id = ?;",
  );

  const insertColumn = db.prepare(
    `INSERT INTO schema_columns
      (schema_id, name, description, data_type, enum_options, required, position)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
  );

  db.transaction(() => {
    updateSql.run(name ?? null, description ?? null, req.params.id);
    if (columns !== undefined) {
      deleteColumns.run(req.params.id);
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        insertColumn.run(
          req.params.id,
          col.name,
          col.description ?? null,
          col.data_type ?? "text",
          col.enum_options ? JSON.stringify(col.enum_options) : null,
          col.required ? 1 : 0,
          i,
        );
      }
    }
  })();

  const schema = db
    .prepare("SELECT * FROM document_schemas WHERE id = ?;")
    .get(req.params.id) as DocumentSchema;
  const cols = db
    .prepare(
      "SELECT * FROM schema_columns WHERE schema_id = ? ORDER BY position;",
    )
    .all(req.params.id) as SchemaColumns[];
  res.json({ ...schema, columns: cols });
}

export function deleteSchema(req: Request, res: Response) {
  const db = getTenantDB(req.user!.userId);
  const existing = db
    .prepare("SELECT id FROM document_schemas WHERE id = ?;")
    .get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Schema not found" });
    return;
  }
  db.prepare("DELETE FROM document_schemas WHERE id = ?;").run(req.params.id);
  res.status(204).send();
}
