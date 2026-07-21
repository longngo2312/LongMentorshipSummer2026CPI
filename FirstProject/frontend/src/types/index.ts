export type ColumnDataType = 'text' | 'number' | 'date' | 'boolean' | 'enum'

export interface SchemaColumn {
  id: number
  schemaId: number
  name: string
  description: string
  dataType: ColumnDataType
  enumOptions: string[] | null
  required: boolean
  position: number
}

export interface DocumentSchema {
  id: number
  name: string
  description: string
  columns: SchemaColumn[]
  documentCount: number
  createdAt: string
  updatedAt: string
}

export type DocumentStatus = 'uploaded' | 'processing' | 'extracted' | 'failed'

export interface ExtractedValue {
  id: number
  documentId: number
  columnId: number
  valueText: string | null
  valueNumber: number | null
  valueDate: string | null
  confidence: number
  sourceSnippet: string | null
}

export interface Document {
  id: number
  schemaId: number
  filename: string
  mimeType: string
  sizeBytes: number
  status: DocumentStatus
  uploadedAt: string
  extractedValues?: ExtractedValue[]
}

export interface QueryCitation {
  documentId: number
  snippet: string
}

export interface QueryResult {
  answer: string
  documents: Document[]
  citations: QueryCitation[]
}

export interface User {
  id: number
  username: string
  email: string
}
