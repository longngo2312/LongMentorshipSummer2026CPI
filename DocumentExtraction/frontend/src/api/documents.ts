import type { DocumentListItem, UploadResponse } from "../types";
import { apiFetch } from "./client";

export function uploadDocument(file: File, schemaId: number) {
  const formData = new FormData();
  formData.append("file", file);
  // Multipart fields are text — the API parses schema_id back to a number.
  formData.append("schema_id", String(schemaId));

  // No headers set here on purpose: apiFetch omits Content-Type for FormData so
  // the browser can add the multipart boundary itself.
  return apiFetch<UploadResponse>("/documents", {
    method: "POST",
    body: formData,
  });
}

export function getDocuments() {
  return apiFetch<DocumentListItem[]>("/documents");
}

export function getDocument(id: number) {
  return apiFetch<DocumentListItem>(`/documents/${id}`);
}

export function deleteDocument(id: number) {
  return apiFetch<void>(`/documents/${id}`, {
    method: "DELETE",
  });
}
