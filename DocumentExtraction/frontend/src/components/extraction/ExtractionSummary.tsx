import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { DocumentListItem, ReviewField } from "../../types";
import { countDecided } from "../../utils/extractedValue";
import DocumentStatusChip from "../document/DocumentStatusChip";

interface ExtractionSummaryProps {
  document: DocumentListItem;
  fields: ReviewField[];
  edits: Map<number, string | null>;
  saving: boolean;
  onSave: () => void;
}

/**
 * Header for the review gate: which document, how far through the reviewer is,
 * and the single action that persists every verdict at once.
 */
export default function ExtractionSummary({
  document,
  fields,
  edits,
  saving,
  onSave,
}: ExtractionSummaryProps) {
  const navigate = useNavigate();

  const decided = countDecided(fields, edits);
  const total = fields.length;
  const percent = total === 0 ? 0 : (decided / total) * 100;

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/documents")}
        size="small"
        sx={{ mb: 1 }}
      >
        Documents
      </Button>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} noWrap>
              {document.filename}
            </Typography>
            <DocumentStatusChip status={document.status} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {decided} of {total} fields reviewed
            {edits.size > 0 && ` · ${edits.size} unsaved`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          // The server flips the document to "reviewed" on any save, so hold the
          // button until a human has actually ruled on every field.
          disabled={saving || total === 0 || decided < total || edits.size === 0}
          onClick={onSave}
          sx={{ flexShrink: 0 }}
        >
          {saving ? "Saving…" : "Save Review"}
        </Button>
      </Box>

      <LinearProgress variant="determinate" value={percent} />
    </Box>
  );
}
