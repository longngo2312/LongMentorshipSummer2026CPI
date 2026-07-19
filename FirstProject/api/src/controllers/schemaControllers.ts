import { Request, Response } from "express";
import adminDB from "../db/adminDB.js";
import { openTenantDB } from "../db/tenantDB.js";
import type { DocumentSchema, SchemaColumns, User } from "../types/index.js";

//helper method to get tenant database based on userId
function getTenantDB(userId: number) {
  const db = adminDB
    .prepare(`SELECT tenant_db_path FROM users WHERE id = ?`)
    .get(userId) as Pick<User, "tenant_db_path">;
  return openTenantDB(db.tenant_db_path);
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
        LEFT JOIN column_schemas ON document_schemas.id = column_schemas.schema_id
        GROUP BY document_schemas.id 
        ORDER BY document_schemas.created_at DESC
    `,
    )
    .get();
  res.json(schema); //send schema back to frontend as a json
}

//get(/:id) get schema details by id
export function getSchemaDetails(req: Request, res: Response) {
  //this will return the schema from document_schema as well as its columns
  const db = getTenantDB(req.user!.userId); //open database whose userid is userid
  const schema = db
    .prepare(`SELECT * FROM document_schemas WHERE id = ?`)
    .get(req.params.id) as DocumentSchema | undefined;

  if (!schema) {
    return res.status(404).json({ error: "Schema Not Found" });
  }
  const schemaColumns = db
    .prepare(`SELECT * FROM schema_columns WHERE schema_id = ?`)
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
    .prepare(`INSERT INTO document_schemas (name, description) VALUES (?, ?)`)
    .run(name, description);

  const insertColumns = db.prepare(
    `INSERT INTO schema_columns (schema_id, name, description, data_type, enum_options, required, position VALUES (?,?,?,?,?,?,?))`,
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
