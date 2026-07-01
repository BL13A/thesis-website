import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WebDashboardSummary } from '@/services/warehouseDashboardService';
import type { Inspection, Supplier } from '@/types';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

interface DashboardChartsProps {
  summary: WebDashboardSummary;
  inspections: Inspection[];
  suppliers?: Supplier[];
}

function buildInventoryDistribution(summary: WebDashboardSummary) {
  const inStock = Math.max(
    0,
    summary.totalTiles - summary.lowStockCount - (summary.inventoryBlocked ?? 0),
  );
  return [
    { name: 'Available', value: inStock },
    { name: 'Low Stock', value: summary.lowStockCount },
    { name: 'Blocked', value: summary.inventoryBlocked ?? 0 },
  ].filter((item) => item.value > 0);
}

function buildInspectionTrend(inspections: Inspection[]) {
  const buckets = new Map<string, number>();
  for (const insp of inspections) {
    const month = insp.date?.slice(0, 7) || 'Unknown';
    buckets.set(month, (buckets.get(month) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month, inspections: count }));
}

function buildDefectTrend(inspections: Inspection[]) {
  const buckets = new Map<string, { manual: number; blocked: number }>();
  for (const insp of inspections) {
    const month = insp.date?.slice(0, 7) || 'Unknown';
    const entry = buckets.get(month) ?? { manual: 0, blocked: 0 };
    if (insp.decision === 'Manual') entry.manual += 1;
    if (insp.inventoryStatus === 'Rejected' || insp.decision === 'Rejected') {
      entry.blocked += 1;
    }
    buckets.set(month, entry);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, values]) => ({ month, ...values }));
}

function buildReorderTrend(summary: WebDashboardSummary) {
  return summary.lowStockTiles.slice(0, 6).map((tile) => ({
    sku: tile.name.slice(0, 14),
    stock: tile.stockQuantity,
    reorder: tile.lowStockThreshold,
  }));
}

function buildSupplierPerformance(suppliers: Supplier[]) {
  return suppliers.slice(0, 6).map((supplier) => ({
    name: supplier.name.slice(0, 16),
    performance: supplier.performanceScore ?? 100,
    defectRate: supplier.defectRate ?? 0,
  }));
}

export function DashboardCharts({ summary, inspections, suppliers = [] }: DashboardChartsProps) {
  const inventoryData = buildInventoryDistribution(summary);
  const inspectionTrend = buildInspectionTrend(inspections);
  const defectTrend = buildDefectTrend(inspections);
  const reorderTrend = buildReorderTrend(summary);
  const supplierPerformance = buildSupplierPerformance(suppliers);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="glass-card rounded-2xl border border-border/50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Inventory Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={inventoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {inventoryData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border/50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Monthly Inspection Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={inspectionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="inspections" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border/50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Defect Trend Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defectTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="manual" fill="#f59e0b" name="Manual Review" />
              <Bar dataKey="blocked" fill="#ef4444" name="Inventory Block" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border/50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Reorder Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reorderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="sku" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#3b82f6" name="Current Stock" />
              <Bar dataKey="reorder" fill="#f59e0b" name="Reorder Point" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {supplierPerformance.length > 0 ? (
        <div className="glass-card rounded-2xl border border-border/50 p-6 xl:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Supplier Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="performance" fill="#10b981" name="Delivery Performance %" />
                <Bar dataKey="defectRate" fill="#ef4444" name="Defect Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
