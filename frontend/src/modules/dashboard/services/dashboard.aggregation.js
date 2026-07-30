import { listSales } from '@modules/sales/services/sales.service';
import { listPurchases } from '@modules/purchases/services/purchases.service';

const PAGE_LIMIT = 100;
// Tope de páginas al traer ventas/compras para el dashboard (no hay endpoint
// de agregación en backend). Con más de 1000 registros los totales quedan
// truncados a los más recientes — limitación conocida, ver plan de implementación.
export const MAX_DASHBOARD_PAGES = 10;

async function fetchAllPages(listFn, maxPages = MAX_DASHBOARD_PAGES) {
  let page = 1;
  const all = [];
  while (page <= maxPages) {
    // eslint-disable-next-line no-await-in-loop
    const { data, meta } = await listFn({ page, limit: PAGE_LIMIT });
    all.push(...data);
    if (page * PAGE_LIMIT >= meta.total) {
      return { records: all, truncated: false };
    }
    page += 1;
  }
  return { records: all, truncated: true };
}

export function fetchAllSales(maxPages) {
  return fetchAllPages(listSales, maxPages);
}

export function fetchAllPurchases(maxPages) {
  return fetchAllPages(listPurchases, maxPages);
}

export function getPeriodRange(periodKey, customFrom, customTo) {
  const now = new Date();
  if (periodKey === 'month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };
  }
  if (periodKey === 'last30') {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from, to: now };
  }
  if (periodKey === 'custom' && customFrom && customTo) {
    return { from: new Date(customFrom), to: new Date(`${customTo}T23:59:59`) };
  }
  // 'year' (por defecto)
  return {
    from: new Date(now.getFullYear(), 0, 1),
    to: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
  };
}

export function filterByDateRange(records, dateField, range) {
  return records.filter((r) => {
    const d = new Date(r[dateField]);
    return d >= range.from && d <= range.to;
  });
}

export function sumField(records, field) {
  return records.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
}

export function groupByPaymentMethod(sales, paymentMethods) {
  const nameById = new Map(paymentMethods.map((pm) => [pm.id, pm.name]));
  const totals = new Map();
  sales.forEach((sale) => {
    const name = nameById.get(sale.payment_method_id) ?? `Método #${sale.payment_method_id}`;
    totals.set(name, (totals.get(name) || 0) + (Number(sale.total) || 0));
  });
  return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
}

function bucketKey(date, granularity) {
  if (granularity === 'day') {
    return date.toISOString().slice(0, 10);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function groupByPeriodBucket(sales, purchases, dateFieldSales, dateFieldPurchases, range) {
  const rangeDays = (range.to - range.from) / 86400000;
  const granularity = rangeDays <= 31 ? 'day' : 'month';

  const buckets = new Map();

  sales.forEach((s) => {
    const key = bucketKey(new Date(s[dateFieldSales]), granularity);
    if (!buckets.has(key)) buckets.set(key, { period: key, ventas: 0, compras: 0 });
    buckets.get(key).ventas += Number(s.total) || 0;
  });

  purchases.forEach((p) => {
    const key = bucketKey(new Date(p[dateFieldPurchases]), granularity);
    if (!buckets.has(key)) buckets.set(key, { period: key, ventas: 0, compras: 0 });
    buckets.get(key).compras += Number(p.total) || 0;
  });

  return Array.from(buckets.values()).sort((a, b) => (a.period > b.period ? 1 : -1));
}
