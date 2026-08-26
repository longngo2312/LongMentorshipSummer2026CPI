import { Chip } from "@mui/material";
import type { ExtractedValueRow } from "../../types";

const REVIEW_CHIP = {
  unreviewed: { label: "Unreviewed", color: "default" },
  accepted: { label: "Accepted", color: "success" },
  edited: { label: "Edited", color: "info" },
  rejected: { label: "Rejected", color: "error" },
} as const;

interface ReviewStatusChipProps {
  status: ExtractedValueRow["review_status"];
}

export default function ReviewStatusChip({ status }: ReviewStatusChipProps) {
  const chip = REVIEW_CHIP[status];

  return (
    <Chip
      label={chip.label}
      color={chip.color}
      size="small"
      variant={status === "unreviewed" ? "outlined" : "filled"}
    />
  );
}
