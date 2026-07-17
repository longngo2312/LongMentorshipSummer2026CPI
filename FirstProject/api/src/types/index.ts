//shape of a row from users table in the admin DB
export interface User {
  id: number;
  username: string;
  password_hash: string;
  email: string;
  tenant_db_path: string;
  created_at: string;
  last_login_at: string | null;
}

export interface JWTpayload {
  userId: number;
  email: string;
}

export interface DocumentSchema {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchemaColumns {
  id: number;
  schema_id: number;
  name: string;
  description: string;
  data_type: "text" | "number" | "date" | "boolean" | "enum";
  enum_options: string | null;
  required: number;
  position: number;
}
