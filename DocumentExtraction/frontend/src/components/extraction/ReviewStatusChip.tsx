import { Chip } from "@mui/material";
import type { ReviewStatus } from "../../types";

const REVIEW_CHIP = {
  unreviewed: { label: "Unreviewed", color: "default" },
  accepted: { label: "Accepted", color: "success" },
  edited: { label: "Edited", color: "info" },
  rejected: { label: "Rejected", color: "error" },
} as const;

interface ReviewStatusChipProps {
  status: ReviewStatus;
  /** Not yet saved — shown outlined so it reads as provisional. */
  pending?: boolean;
}

export default function ReviewStatusChip({
  status,
  pending = false,
}: ReviewStatusChipProps) {
  const chip = REVIEW_CHIP[status];

  return (
    <Chip
      label={pending ? `${chip.label} •` : chip.label}
      color={chip.color}
      size="small"
      variant={pending || status === "unreviewed" ? "outlined" : "filled"}
    />
  );
}
