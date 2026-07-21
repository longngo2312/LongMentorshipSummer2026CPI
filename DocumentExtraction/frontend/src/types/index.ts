export type ColumnDataType = "text" | "number" | "date" | "boolean" | "enum";

export interface SchemaColumn {
  id: number;
  schema_id: number;
  name: string;
  description: string;
  data_type: ColumnDataType;
  enumOptions: string[] | null;
  required: boolean;
  position: number;
}

export interface DocumentSchema {
  id: number;
  name: string;
  description: string;
  columns: SchemaColumn[];
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface User {
  id: number;
  username: string;
  email: string;
}
