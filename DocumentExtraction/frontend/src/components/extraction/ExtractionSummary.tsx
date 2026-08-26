import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { DocumentStatus, ExtractedValueRow } from "../../types";
import DocumentStatusChip from "../document/DocumentStatusChip";
import { countReviewed } from "../../utils/extractedValue";

interface ExtractionSummaryProps {
  documentId: number;
  status: DocumentStatus;
  values: ExtractedValueRow[];
  onApprove: () => void;
}

/**
 * Header for the review gate: what document this is, how far through the
 * reviewer is, and the single action that promotes it to `reviewed`.
 */
export default function ExtractionSummary({
  documentId,
  status,
  values,
  onApprove,
}: ExtractionSummaryProps) {
  const navigate = useNavigate();

  const reviewed = countReviewed(values);
  const total = values.length;
  const percent = total === 0 ? 0 : (reviewed / total) * 100;

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/documents")}
        sx={{ mb: 2 }}
      >
        Back to Documents
      </Button>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Document #{documentId}
            </Typography>
            <DocumentStatusChip status={status} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {reviewed} of {total} fields reviewed
          </Typography>
        </Box>

        <Button
          variant="contained"
          // Nothing should reach the index until a human has ruled on every
          // field — that gate is the whole point of this screen.
          disabled={total === 0 || reviewed < total}
          onClick={onApprove}
          sx={{ flexShrink: 0 }}
        >
          Approve Document
        </Button>
      </Box>

      <LinearProgress variant="determinate" value={percent} />
    </Box>
  );
}
