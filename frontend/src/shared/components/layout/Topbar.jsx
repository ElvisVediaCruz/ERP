import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useUser } from '@shared/context/UserContext';
import { useNotifications } from '@shared/context/NotificationContext';

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useUser();
  const { lowStockItems, expiringSoonItems, alertCount } = useNotifications();
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <button
        type="button"
        className="btn btn-icon topbar-toggle"
        onClick={onToggleSidebar}
        aria-label="Alternar barra lateral"
      >
        <Menu size={20} />
      </button>

      <span className="topbar-spacer" />

      <div className="notification-wrap">
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => setPanelOpen((v) => !v)}
          aria-label="Notificaciones"
        >
          <Bell size={20} />
          {alertCount > 0 && <span className="badge">{alertCount}</span>}
        </button>

        {panelOpen && (
          <div className="notification-panel card">
            <h3>Notificaciones</h3>
            {alertCount === 0 && <p className="hint">No hay alertas por ahora.</p>}

            {lowStockItems.length > 0 && (
              <div className="notification-group">
                <strong>Stock bajo ({lowStockItems.length})</strong>
                <ul>
                  {lowStockItems.slice(0, 5).map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
                <Link className="btn-link" to="/products/low-stock" onClick={() => setPanelOpen(false)}>
                  Ver todos
                </Link>
              </div>
            )}

            {expiringSoonItems.length > 0 && (
              <div className="notification-group">
                <strong>Próximos a vencer ({expiringSoonItems.length})</strong>
                <ul>
                  {expiringSoonItems.slice(0, 5).map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
                <Link className="btn-link" to="/products/low-stock" onClick={() => setPanelOpen(false)}>
                  Ver todos
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <span>
        {user?.name} {user?.last_name} <span className="hint">— {user?.role_name}</span>
      </span>
      <button type="button" className="btn" onClick={handleLogout}>
        <LogOut size={16} /> Cerrar sesión
      </button>
    </header>
  );
}
