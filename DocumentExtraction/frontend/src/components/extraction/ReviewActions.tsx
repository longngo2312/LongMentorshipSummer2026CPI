import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Tooltip } from "@mui/material";
import type { ReviewStatus } from "../../types";

interface ReviewActionsProps {
  status: ReviewStatus;
  onAccept: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export default function ReviewActions({
  status,
  onAccept,
  onEdit,
  onReject,
}: ReviewActionsProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Tooltip title="Accept">
        <IconButton
          size="small"
          // Filled once chosen, so a reviewer scanning the column can see which
          // rows they have already ruled on without reading the status chip.
          color={status === "accepted" ? "success" : "default"}
          onClick={onAccept}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit">
        <IconButton
          size="small"
          color={status === "edited" ? "info" : "default"}
          onClick={onEdit}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Reject">
        <IconButton
          size="small"
          color={status === "rejected" ? "error" : "default"}
          onClick={onReject}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
