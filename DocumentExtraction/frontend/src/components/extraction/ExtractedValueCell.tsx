import { Chip, Typography } from "@mui/material";
import type { ReviewField } from "../../types";
import { booleanLabel } from "../../utils/extractedValue";

interface ExtractedValueCellProps {
  field: ReviewField;
  /** Unsaved edit, when the reviewer has changed this field in this session. */
  pendingValue: string | null | undefined;
}

/** Read-only rendering of one value, shaped by its data_type. */
export default function ExtractedValueCell({
  field,
  pendingValue,
}: ExtractedValueCellProps) {
  const value = pendingValue === undefined ? field.value_text : pendingValue;

  if (value === null || value === "") {
    return (
      <Typography
        variant="body2"
        color="text.disabled"
        sx={{ fontStyle: "italic" }}
      >
        {pendingValue === null ? "Rejected" : "Not found"}
      </Typography>
    );
  }

  if (field.data_type === "boolean") {
    return (
      <Chip
        label={booleanLabel(value)}
        size="small"
        variant="outlined"
        color={value === "true" ? "success" : "default"}
      />
    );
  }

  if (field.data_type === "enum") {
    return <Chip label={value} size="small" variant="outlined" />;
  }

  return <Typography variant="body2">{value}</Typography>;
}
