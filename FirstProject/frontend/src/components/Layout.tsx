import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/schemas', label: 'Schemas' },
  { to: '/upload', label: 'Upload' },
  { to: '/documents', label: 'Documents' },
  { to: '/ask', label: 'Ask' },
]

function Layout() {
  return (
    <div>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
