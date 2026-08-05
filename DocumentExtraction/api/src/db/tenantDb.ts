/// <reference types="node" />
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TENANTS_DIR = path.join(__dirname, "../../db/tenant");
const UPLOADS_DIR = path.join(TENANTS_DIR, "uploads");

export function openTenantDB(tenantDBPath: string) {
  const db = new Database(tenantDBPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(
    // Create tables for each users
    `   
        CREATE TABLE IF NOT EXISTS document_schemas (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS schema_columns (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            schema_id    INTEGER NOT NULL REFERENCES document_schemas(id) ON DELETE CASCADE,
            name         TEXT NOT NULL,
            description  TEXT,
            data_type    TEXT NOT NULL DEFAULT 'text'
                        CHECK(data_type IN ('text','number','date','boolean','enum')),
            enum_options TEXT,
            required     INTEGER NOT NULL DEFAULT 0,
            position     INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS documents (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            schema_id    INTEGER NOT NULL REFERENCES document_schemas(id) ON DELETE CASCADE,
            filename     TEXT NOT NULL,          -- original display name
            mime_type    TEXT NOT NULL,
            storage_path TEXT NOT NULL,          -- server-generated, never client input
            size_bytes   INTEGER NOT NULL,
            status       TEXT NOT NULL DEFAULT 'uploaded'
                        CHECK(status IN ('uploaded','processing','extracted','failed')),
            uploaded_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_documents_schema ON documents(schema_id);
    `,
  );
  return db;
}

export function tenantDBPath(userId: number): string {
  return path.join(TENANTS_DIR, `user_${userId}.sqlite`);
}

export function provisionTenantDB(userId: number): string {
  if (!fs.existsSync(TENANTS_DIR)) {
    fs.mkdirSync(TENANTS_DIR, { recursive: true });
  }
  const dbPath = tenantDBPath(userId);
  openTenantDB(dbPath);
  return dbPath;
}

export function tenantUploadDir(userId: number): string {
  const dir = path.join(UPLOADS_DIR, `user_${userId}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getTenantDb(userId: number) {
  return openTenantDB(tenantDBPath(userId));
}
