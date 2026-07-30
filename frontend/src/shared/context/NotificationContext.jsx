import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { listLowStock, listProducts } from '@modules/products/services/products.service';

const NotificationContext = createContext(null);

const EXPIRING_SOON_DAYS = 30;
// Tope de páginas al derivar "próximos a vencer" client-side (no hay endpoint
// dedicado en backend). Con más de ~500 productos activos el conteo puede
// quedar incompleto — limitación conocida, documentada en el plan.
const MAX_PAGES = 5;
const PAGE_LIMIT = 100;

async function deriveExpiringSoon() {
  let page = 1;
  const all = [];
  while (page <= MAX_PAGES) {
    const { data, meta } = await listProducts({ status: 'true', page, limit: PAGE_LIMIT });
    all.push(...data);
    if (page * PAGE_LIMIT >= meta.total) break;
    page += 1;
  }
  const now = Date.now();
  return all.filter((p) => {
    if (!p.expiration_date) return false;
    const daysLeft = (new Date(p.expiration_date) - now) / 86400000;
    return daysLeft >= 0 && daysLeft <= EXPIRING_SOON_DAYS;
  });
}

export function NotificationProvider({ children }) {
  const { user } = useUser();
  const [toasts, setToasts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringSoonItems, setExpiringSoonItems] = useState([]);

  const pushToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const refreshAlerts = useCallback(() => {
    listLowStock().then(setLowStockItems).catch(() => {});
    deriveExpiringSoon().then(setExpiringSoonItems).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) {
      setLowStockItems([]);
      setExpiringSoonItems([]);
      return;
    }
    refreshAlerts();
  }, [user, refreshAlerts]);

  const value = {
    toasts,
    pushToast,
    lowStockItems,
    expiringSoonItems,
    alertCount: lowStockItems.length + expiringSoonItems.length,
    refreshAlerts,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
