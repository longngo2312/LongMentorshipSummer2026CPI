export type ColumnDataType = "text" | "number" | "date" | "boolean" | "enum";

export interface SchemaColumn {
  id: number;
  schema_id: number;
  name: string;
  description: string;
  data_type: ColumnDataType;
  enum_options: string[] | null;
  required: boolean;
  position: number;
}

export interface DocumentSchema {
  id: number;
  name: string;
  description: string | null;
  column_count: number;
  created_at: string;
  updated_at: string;
}

export interface SchemaDetail {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  schemaColumns: SchemaColumn[];
}
export interface User {
  id: number;
  username: string;
  email: string;
}

export type DocumentStatus = "uploaded" | "processing" | "extracted" | "failed";

//Shape returned by POST /documents
export interface DocumentRecord {
  id: number;
  schema_id: number;
  filename: string;
  mime_type: string;
  storage_path: string;
  size_bytes: number;
  status: DocumentStatus;
  uploaded_at: string;
}

//interface return by a GET request
export interface DocumentListItem extends DocumentRecord {
  schema_name: string;
}

export interface UploadResponse {
  document: DocumentRecord;
  jobId: number;
}

export interface UploadItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}
