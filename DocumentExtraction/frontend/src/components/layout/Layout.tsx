import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const links = [
  { to: "/schemas", label: "Schemas" },
  { to: "/upload", label: "Upload" },
  { to: "/documents", label: "Documents" },
  { to: "/query", label: "Query" },
];

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    // Await so the refresh token is revoked before we leave the page.
    await logout();
    navigate("/login");
  }

  const initials = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 0.5, flexWrap: "nowrap", overflowX: "auto" }}>
          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              color="inherit"
              size="small"
              sx={{
                "&.active": { fontWeight: "bold" },
                whiteSpace: "nowrap",
                px: { xs: 1, sm: 2 },
              }}
            >
              {link.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
              {initials}
            </Avatar>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, display: { xs: "none", sm: "block" } }}
            >
              {user?.username}
            </Typography>
            <Tooltip title="Log out">
              <IconButton onClick={handleLogout} size="small" color="inherit">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 3, flexGrow: 1, px: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
