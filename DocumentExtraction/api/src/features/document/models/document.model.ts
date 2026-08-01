export interface DocumentRecord {
  id: number;
  schema_id: number;
  filename: string;
  mime_type: string;
  storage_path: string;
  status: "pending" | "processing" | "complete" | "failed";
  uploaded_at: string;
}
