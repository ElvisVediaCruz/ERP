import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tags, Truck, Package, ShoppingCart, Receipt, Users } from 'lucide-react';
import { useUser } from '@shared/context/UserContext';

const allLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'vendedor'] },
  { to: '/categories', label: 'Categorías', icon: Tags, roles: ['admin'] },
  { to: '/suppliers', label: 'Proveedores', icon: Truck, roles: ['admin'] },
  { to: '/products', label: 'Productos', icon: Package, roles: ['admin'] },
  { to: '/purchases', label: 'Compras', icon: ShoppingCart, roles: ['admin'] },
  { to: '/sales', label: 'Ventas', icon: Receipt, roles: ['admin', 'vendedor'] },
  { to: '/users', label: 'Usuarios', icon: Users, roles: ['admin'] },
];

export default function Sidebar({ collapsed, mobileOpen }) {
  const { hasRole } = useUser();
  const links = allLinks.filter((link) => hasRole(...link.roles));

  const className = ['sidebar', collapsed && 'collapsed', mobileOpen && 'mobile-open']
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={className}>
      <h1>{collapsed ? 'IV' : 'Inventario'}</h1>
      <nav>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
