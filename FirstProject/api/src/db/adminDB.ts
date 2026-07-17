/// <reference types="node" />
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_path = path.join(__dirname, "../../db/admin.sqlite");

const adminDB = new Database(DB_path);
adminDB.pragma("journal_mode = WAL");
adminDB.pragma("foreign_keys = ON");

adminDB.exec(
  `
        CREATE table IF NOT EXISTS users (
            id              INTERGET    PRIMARY KEY     AUTOINCREMENT,
            username        TEXT        NOT NULL        UNIQUE,
            email           TEXT        NOT NULL        UNIQUE,
            password_hash  TEXT        NOT NULL,
            tenant_db_path  TEXT        NOT NULL        DEFAULT '',
            created_at      TEXT        NOT NULL        DEFAULT (datetime('now')),
            last_login_at   TEXT 
        )
    `,
);

export default adminDB;
