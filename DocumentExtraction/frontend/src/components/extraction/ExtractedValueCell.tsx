import { Box, Chip, Typography } from "@mui/material";
import type { ExtractedValueRow } from "../../types";
import { booleanLabel, displayValue } from "../../utils/extractedValue";

interface ExtractedValueCellProps {
  row: ExtractedValueRow;
}

/** Read-only rendering of one extracted value, shaped by its data_type. */
export default function ExtractedValueCell({ row }: ExtractedValueCellProps) {
  const value = displayValue(row);

  if (value === null) {
    return (
      <Typography
        variant="body2"
        color="text.disabled"
        sx={{ fontStyle: "italic" }}
      >
        Not found
      </Typography>
    );
  }

  if (row.data_type === "boolean") {
    return (
      <Chip
        label={booleanLabel(value)}
        size="small"
        variant="outlined"
        color={value === "true" ? "success" : "default"}
      />
    );
  }

  if (row.data_type === "enum") {
    return <Chip label={value} size="small" variant="outlined" />;
  }

  if (row.data_type === "number") {
    return (
      <Box>
        {/* The document's own formatting reads as correct to a reviewer; the
            parsed number underneath is what the query layer will actually use. */}
        <Typography variant="body2">{value}</Typography>
        {row.value_number !== null && (
          <Typography variant="caption" color="text.secondary">
            {row.value_number}
          </Typography>
        )}
      </Box>
    );
  }

  return <Typography variant="body2">{value}</Typography>;
}
