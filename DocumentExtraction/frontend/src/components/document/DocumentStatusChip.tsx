import { Chip } from "@mui/material";
import type { DocumentStatus } from "../../types";

const STATUS_CHIP = {
  uploaded: { label: "Uploaded", color: "default" },
  processing: { label: "Processing", color: "info" },
  extracted: { label: "Extracted", color: "success" },
  failed: { label: "Failed", color: "error" },
} as const;

interface DocumentStatusChipProps {
  status: DocumentStatus;
}

export default function DocumentStatusChip({
  status,
}: DocumentStatusChipProps) {
  const chip = STATUS_CHIP[status];

  return (
    <Chip
      label={chip.label}
      color={chip.color}
      size="small"
      variant={status === "uploaded" ? "outlined" : "filled"}
    />
  );
}
