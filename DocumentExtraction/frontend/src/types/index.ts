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
export interface User {
  id: number;
  username: string;
  email: string;
}
