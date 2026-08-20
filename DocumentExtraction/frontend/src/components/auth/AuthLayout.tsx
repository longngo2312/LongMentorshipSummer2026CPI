import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Rendered under the card — the "no account yet?" style link. */
  footer: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        // Tinted wash so the white card reads as a distinct surface.
        background: (theme) =>
          `radial-gradient(circle at 50% 0%, ${theme.palette.primary.light}22, transparent 60%), ${theme.palette.grey[50]}`,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Stack spacing={1} sx={{ alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <DescriptionOutlinedIcon />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            {subtitle}
          </Typography>
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
          {children}
        </Paper>

        <Box sx={{ mt: 3, textAlign: "center" }}>{footer}</Box>
      </Box>
    </Box>
  );
}
