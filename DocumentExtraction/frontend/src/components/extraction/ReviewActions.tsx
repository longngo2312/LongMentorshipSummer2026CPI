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
    <Box
      sx={{
        display: "inline-flex",
        gap: "2px",
        bgcolor: "#F1F5F9",
        borderRadius: 1.5,
        p: "2px",
      }}
    >
      <Tooltip title="Accept" arrow>
        <IconButton
          size="small"
          onClick={onAccept}
          sx={{
            borderRadius: 1,
            width: 30,
            height: 30,
            ...(status === "accepted"
              ? {
                  bgcolor: "success.main",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "success.dark" },
                }
              : {
                  color: "text.secondary",
                  "&:hover": { bgcolor: "#E2E8F0", color: "success.main" },
                }),
            transition: "all 150ms ease",
          }}
        >
          <CheckIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit" arrow>
        <IconButton
          size="small"
          onClick={onEdit}
          sx={{
            borderRadius: 1,
            width: 30,
            height: 30,
            ...(status === "edited"
              ? {
                  bgcolor: "secondary.main",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "secondary.dark" },
                }
              : {
                  color: "text.secondary",
                  "&:hover": { bgcolor: "#E2E8F0", color: "secondary.main" },
                }),
            transition: "all 150ms ease",
          }}
        >
          <EditIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Reject" arrow>
        <IconButton
          size="small"
          onClick={onReject}
          sx={{
            borderRadius: 1,
            width: 30,
            height: 30,
            ...(status === "rejected"
              ? {
                  bgcolor: "error.main",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "error.dark" },
                }
              : {
                  color: "text.secondary",
                  "&:hover": { bgcolor: "#E2E8F0", color: "error.main" },
                }),
            transition: "all 150ms ease",
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
