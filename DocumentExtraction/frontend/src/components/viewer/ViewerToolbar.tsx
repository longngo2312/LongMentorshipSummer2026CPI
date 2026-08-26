import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

interface ViewerToolbarProps {
  filename: string;
  fileUrl: string | null;
  /** Omitted by viewers with nothing to page through, e.g. a single image. */
  pageInfo?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
}

export default function ViewerToolbar({
  filename,
  fileUrl,
  pageInfo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: ViewerToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.5,
        py: 0.75,
        borderBottom: 1,
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Typography variant="body2" noWrap title={filename} sx={{ minWidth: 0 }}>
        {filename}
      </Typography>

      <Box sx={{ flexGrow: 1 }} />

      {pageInfo && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ whiteSpace: "nowrap", mr: 1 }}
        >
          {pageInfo}
        </Typography>
      )}

      {onZoomOut && (
        <Tooltip title="Zoom out">
          <IconButton size="small" onClick={onZoomOut}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onZoomReset && (
        <Tooltip title="Fit width">
          <IconButton size="small" onClick={onZoomReset}>
            <ZoomOutMapIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onZoomIn && (
        <Tooltip title="Zoom in">
          <IconButton size="small" onClick={onZoomIn}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Download">
        {/* Object URL, so this saves the already-downloaded blob rather than
            re-requesting a route the browser cannot authenticate. */}
        <span>
          <IconButton
            size="small"
            component="a"
            href={fileUrl ?? undefined}
            download={filename}
            disabled={!fileUrl}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
