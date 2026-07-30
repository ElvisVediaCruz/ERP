import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Package, AlertTriangle, Receipt, ShoppingCart } from 'lucide-react';
import { listProducts } from '@modules/products/services/products.service';
import { listPaymentMethods } from '@modules/payment-methods/services/payment-methods.service';
import { useNotifications } from '@shared/context/NotificationContext';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import {
  fetchAllSales,
  fetchAllPurchases,
  getPeriodRange,
  filterByDateRange,
  sumField,
  groupByPaymentMethod,
  groupByPeriodBucket,
} from '../services/dashboard.aggregation';

const PIE_COLORS = ['#9c3ad6', '#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#6b7280'];

const PERIOD_OPTIONS = [
  { value: 'year', label: 'Año actual' },
  { value: 'month', label: 'Mes actual' },
  { value: 'last30', label: 'Últimos 30 días' },
  { value: 'custom', label: 'Rango personalizado' },
];

export default function DashboardScreen() {
  const { lowStockItems } = useNotifications();
  const [productCount, setProductCount] = useState(null);
  const [period, setPeriod] = useState('year');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [allPurchases, setAllPurchases] = useState([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProducts({ status: 'true', limit: 1 })
      .then(({ meta }) => setProductCount(meta.total))
      .catch(() => {});
    listPaymentMethods().then(setPaymentMethods).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAllSales(), fetchAllPurchases()])
      .then(([salesResult, purchasesResult]) => {
        setAllSales(salesResult.records);
        setAllPurchases(purchasesResult.records);
        setTruncated(salesResult.truncated || purchasesResult.truncated);
      })
      .finally(() => setLoading(false));
  }, []);

  const range = useMemo(
    () => getPeriodRange(period, customFrom, customTo),
    [period, customFrom, customTo]
  );

  const salesInRange = useMemo(
    () => filterByDateRange(allSales, 'sale_date', range),
    [allSales, range]
  );
  const purchasesInRange = useMemo(
    () => filterByDateRange(allPurchases, 'purchase_date', range),
    [allPurchases, range]
  );

  const totalSales = useMemo(() => sumField(salesInRange, 'total'), [salesInRange]);
  const totalPurchases = useMemo(() => sumField(purchasesInRange, 'total'), [purchasesInRange]);
  const paymentPie = useMemo(
    () => groupByPaymentMethod(salesInRange, paymentMethods),
    [salesInRange, paymentMethods]
  );
  const periodSeries = useMemo(
    () => groupByPeriodBucket(salesInRange, purchasesInRange, 'sale_date', 'purchase_date', range),
    [salesInRange, purchasesInRange, range]
  );

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <div className="filters" style={{ marginBottom: 0 }}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {period === 'custom' && (
            <>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </>
          )}
        </div>
      </div>

      {truncated && (
        <div className="low-stock-banner" style={{ background: 'var(--color-info-bg)', borderColor: 'var(--color-info-border)' }}>
          Los indicadores se calculan sobre los {allSales.length} registros de ventas y{' '}
          {allPurchases.length} de compras más recientes. Con más historial los totales pueden no
          ser exactos — pendiente de un endpoint de agregación en backend.
        </div>
      )}

      <div className="kpi-grid">
        <div className="card kpi-card">
          <Receipt size={24} />
          <div>
            <p className="hint">Total de ventas</p>
            <h3>{totalSales.toFixed(2)}</h3>
          </div>
        </div>
        <div className="card kpi-card">
          <ShoppingCart size={24} />
          <div>
            <p className="hint">Total de compras</p>
            <h3>{totalPurchases.toFixed(2)}</h3>
          </div>
        </div>
        <div className="card kpi-card">
          <Package size={24} />
          <div>
            <p className="hint">Productos registrados</p>
            <h3>{productCount ?? '—'}</h3>
          </div>
        </div>
        <div className="card kpi-card">
          <AlertTriangle size={24} />
          <div>
            <p className="hint">Productos con bajo stock</p>
            <h3>{lowStockItems.length}</h3>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner label="Calculando indicadores..." />}

      {!loading && (
        <div className="dashboard-charts">
          <div className="card">
            <h3>Ventas por método de pago</h3>
            {paymentPie.length === 0 ? (
              <p className="hint">Sin ventas en el período seleccionado.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={paymentPie} dataKey="value" nameKey="name" outerRadius={90} label>
                    {paymentPie.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h3>Ventas y compras por período</h3>
            {periodSeries.length === 0 ? (
              <p className="hint">Sin datos en el período seleccionado.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={periodSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#9c3ad6" name="Ventas" />
                  <Line type="monotone" dataKey="compras" stroke="#2563eb" name="Compras" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      <p className="hint" style={{ marginTop: '1rem' }}>
        Nota: el ranking de "productos más vendidos" requiere un endpoint de agregación en backend
        (hoy listar ventas no incluye el detalle de productos) y no está disponible en esta versión.
      </p>
    </div>
  );
}
