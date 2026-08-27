import { Alert, Box } from "@mui/material";
import type { DocumentListItem, ReviewField } from "../../types";
import ExtractedValuesTable from "./ExtractedValuesTable";
import ExtractionSummary from "./ExtractionSummary";

interface ReviewPanelProps {
  document: DocumentListItem;
  fields: ReviewField[];
  edits: Map<number, string | null>;
  activeColumnId: number | null;
  saving: boolean;
  saveError: string | null;
  onQuoteClick: (field: ReviewField) => void;
  onSetValue: (columnId: number, value: string | null) => void;
  onSave: () => void;
}

/** The right half of the split: progress, save, and the field table. */
export default function ReviewPanel({
  document,
  fields,
  edits,
  activeColumnId,
  saving,
  saveError,
  onQuoteClick,
  onSetValue,
  onSave,
}: ReviewPanelProps) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Sticky header area */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2.5,
          pt: 2,
          pb: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <ExtractionSummary
          document={document}
          fields={fields}
          edits={edits}
          saving={saving}
          onSave={onSave}
        />
      </Box>

      {/* Scrollable content area */}
      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: "auto", px: 2.5, py: 2 }}>
        {saveError && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 1.5,
              "& .MuiAlert-message": { fontWeight: 500 },
            }}
          >
            {saveError}
          </Alert>
        )}

        <ExtractedValuesTable
          fields={fields}
          edits={edits}
          activeColumnId={activeColumnId}
          onQuoteClick={onQuoteClick}
          onSetValue={onSetValue}
        />
      </Box>
    </Box>
  );
}
