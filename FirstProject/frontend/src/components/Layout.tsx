import { AppBar, Box, Button, Container, Toolbar } from '@mui/material'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/schemas', label: 'Schemas' },
  { to: '/upload', label: 'Upload' },
  { to: '/documents', label: 'Documents' },
  { to: '/ask', label: 'Ask' },
]

function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              color="inherit"
              sx={{
                '&.active': {
                  fontWeight: 'bold',
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 3, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}

export default Layout
