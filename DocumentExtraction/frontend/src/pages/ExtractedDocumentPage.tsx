import { Alert, Box, CircularProgress, Paper } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReviewPanel from "../components/extraction/ReviewPanel";
import SplitPane from "../components/layout/SplitPane";
import type { SplitPaneTab } from "../components/layout/SplitPane";
import DocumentViewerPanel from "../components/viewer/DocumentViewerPanel";
import { getReview, saveReview } from "../api/documents";
import { MOCK_REVIEW } from "../mocks/review.mock";
import type { ActiveQuote, ReviewField, ReviewPayload } from "../types";

// Lets the UI be worked on without a running API or a loaded model.
const USE_MOCK = import.meta.env.VITE_MOCK_REVIEW === "true";

export default function ExtractedDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const documentId = Number(id);

  const [payload, setPayload] = useState<ReviewPayload | null>(null);
  // The id the current payload belongs to, so `loading` can be derived instead
  // of flipped synchronously inside the effect.
  const [loadedId, setLoadedId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Unsaved verdicts, keyed by column_id. A key present with a null value means
  // "rejected" — which is why this is a Map rather than a plain object with
  // undefined holes.
  const [edits, setEdits] = useState<Map<number, string | null>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [activeQuote, setActiveQuote] = useState<ActiveQuote | null>(null);
  const [mobileTab, setMobileTab] = useState<SplitPaneTab>("right");

  const load = useCallback(() => {
    const fetching = USE_MOCK
      ? Promise.resolve(MOCK_REVIEW)
      : getReview(documentId);

    return fetching
      .then((data) => {
        setPayload(data);
        setEdits(new Map());
        setLoadError(null);
      })
      .catch((error: unknown) =>
        setLoadError(error instanceof Error ? error.message : String(error)),
      )
      .finally(() => setLoadedId(documentId));
  }, [documentId]);

  const loading = loadedId !== documentId;

  useEffect(() => {
    if (Number.isInteger(documentId) && documentId > 0) load();
  }, [documentId, load]);

  function handleSetValue(columnId: number, value: string | null) {
    setEdits((current) => new Map(current).set(columnId, value));
  }

  function handleQuoteClick(field: ReviewField) {
    if (!field.llm_quote) return;

    setActiveQuote({
      columnId: field.column_id,
      quote: field.llm_quote,
      // Single-page formats (office, images, plain text) carry no page number.
      pageNumber: field.source_page ?? 1,
      start: field.source_start,
      end: field.source_end,
    });
    // On a phone the document is behind a tab, so a click that only sets state
    // would look like nothing happened.
    setMobileTab("left");
  }

  function handleSave() {
    setSaving(true);
    setSaveError(null);

    const payloadEdits = Array.from(edits, ([column_id, value]) => ({
      column_id,
      value,
    }));

    saveReview(documentId, payloadEdits)
      // Refetch rather than patching local state: the server derives each
      // review_status and re-coerces every value, so its copy is the truth.
      .then(() => load())
      .catch((error: unknown) =>
        setSaveError(error instanceof Error ? error.message : String(error)),
      )
      .finally(() => setSaving(false));
  }

  if (!Number.isInteger(documentId) || documentId <= 0) {
    return <Alert severity="error">Invalid document id.</Alert>;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !payload) {
    return <Alert severity="error">{loadError ?? "Document not found."}</Alert>;
  }

  const activeField =
    payload.fields.find(
      (field) => field.column_id === activeQuote?.columnId,
    ) ?? null;

  return (
    <Paper
      variant="outlined"
      // flexGrow against the Layout container's column flex, so the split fills
      // the viewport instead of collapsing to its content height.
      sx={{ flexGrow: 1, minHeight: 0, overflow: "hidden" }}
    >
      <SplitPane
        leftLabel="Document"
        rightLabel="Extracted values"
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
        left={
          <DocumentViewerPanel
            document={payload.document}
            pages={payload.pages}
            activeQuote={activeQuote}
            fallbackValue={activeField?.value_text ?? null}
          />
        }
        right={
          <ReviewPanel
            document={payload.document}
            fields={payload.fields}
            edits={edits}
            activeColumnId={activeQuote?.columnId ?? null}
            saving={saving}
            saveError={saveError}
            onQuoteClick={handleQuoteClick}
            onSetValue={handleSetValue}
            onSave={handleSave}
          />
        }
      />
    </Paper>
  );
}
