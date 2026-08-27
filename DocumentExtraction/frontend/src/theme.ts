import { createTheme } from "@mui/material/styles";

// Professional navy/blue/green palette — data-dense annotation tool aesthetic.
// Inspired by Labelbox, Scale AI, and DocuSign review interfaces.
const theme = createTheme({
  colorSchemes: {
    light: true,
    dark: false,
  },
  palette: {
    primary: {
      main: "#1E3A5F",
      light: "#2E5A8F",
      dark: "#0F1F35",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#2563EB",
      light: "#5B8DEF",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#059669",
      light: "#34D399",
      dark: "#047857",
    },
    error: {
      main: "#DC2626",
      light: "#F87171",
      dark: "#B91C1C",
    },
    warning: {
      main: "#D97706",
      light: "#FBBF24",
      dark: "#B45309",
    },
    info: {
      main: "#2563EB",
      light: "#93C5FD",
      dark: "#1D4ED8",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
      disabled: "#94A3B8",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: "0.95rem",
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: "0.85rem",
      letterSpacing: "0.02em",
      textTransform: "uppercase" as const,
    },
    body2: {
      fontSize: "0.8125rem",
    },
    caption: {
      fontSize: "0.7rem",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
        sizeSmall: {
          height: 22,
          fontSize: "0.7rem",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#F1F5F9",
            color: "#475569",
            fontWeight: 600,
            fontSize: "0.7rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            borderBottom: "2px solid #E2E8F0",
            padding: "10px 16px",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #F1F5F9",
          padding: "10px 16px",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.MuiTableRow-hover:hover": {
            backgroundColor: "#F8FAFC",
          },
          "&.Mui-selected": {
            backgroundColor: "#EFF6FF",
            "&:hover": {
              backgroundColor: "#DBEAFE",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          fontWeight: 600,
          borderRadius: 6,
        },
        sizeSmall: {
          fontSize: "0.8rem",
          padding: "4px 12px",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: "#E2E8F0",
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: "#E2E8F0",
        },
      },
    },
  },
});

export default theme;