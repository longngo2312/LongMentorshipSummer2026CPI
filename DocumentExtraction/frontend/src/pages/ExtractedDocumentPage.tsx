import { Container } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import ExtractedValuesTable from "../components/extraction/ExtractedValuesTable";
import ExtractionSummary from "../components/extraction/ExtractionSummary";
import { MOCK_EXTRACTED_DOCUMENT } from "../mocks/extractedDocument.mock";
import type { ExtractedValueRow } from "../types";

export default function ExtractedDocumentPage() {
  const { id } = useParams<{ id: string }>();

  // TODO(wiring): replace the mock seed with the store, which already calls
  // GET /api/extraction/:id:
  //   const document = useExtractedDocumentStore((s) => s.document);
  //   const loading = useExtractedDocumentStore((s) => s.loading);
  //   const fetchExtractedDocument = useExtractedDocumentStore(
  //     (s) => s.fetchExtractedDocument,
  //   );
  //   useEffect(() => { fetchExtractedDocument(Number(id)); }, [id]);
  // Loading and not-found branches go in at the same time — the endpoint
  // distinguishes "no such document" from "extracted nothing yet".
  const [document, setDocument] = useState(MOCK_EXTRACTED_DOCUMENT);

  // Local-only for now. Each of these becomes a PATCH once the review endpoint
  // exists; the row's review_status is what the server ultimately owns.
  function setRow(
    valueId: number,
    update: (row: ExtractedValueRow) => ExtractedValueRow,
  ) {
    setDocument((current) => ({
      ...current,
      values: current.values.map((row) =>
        row.id === valueId ? update(row) : row,
      ),
    }));
  }

  function handleAccept(valueId: number) {
    setRow(valueId, (row) => ({ ...row, review_status: "accepted" }));
  }

  function handleReject(valueId: number) {
    setRow(valueId, (row) => ({ ...row, review_status: "rejected" }));
  }

  function handleSaveEdit(valueId: number, value: string) {
    setRow(valueId, (row) => ({
      ...row,
      // Which column the edit lands in follows data_type, the same split coerce()
      // makes on the server. The server re-coerces on save — this is display only.
      ...(row.data_type === "date"
        ? { value_date: value }
        : { value_text: value }),
      review_status: "edited",
    }));
  }

  function handleApprove() {
    // TODO(wiring): POST the approval, which flips documents.status to
    // "reviewed" and makes the document eligible for indexing.
    setDocument((current) => ({ ...current, status: "reviewed" }));
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ExtractionSummary
        documentId={Number(id) || document.document_id}
        status={document.status}
        values={document.values}
        onApprove={handleApprove}
      />

      <ExtractedValuesTable
        values={document.values}
        onAccept={handleAccept}
        onReject={handleReject}
        onSaveEdit={handleSaveEdit}
      />
    </Container>
  );
}
