import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, PolarArea, Radar } from 'react-chartjs-2';
import type { ExtendedChartData } from '@/lib/chartData';
import type { RoleKey } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const palette = ['#6b6578', '#9f8fd4', '#b8aae0', '#7ec4a8', '#f0a8c0', '#f5c98a', '#8eb8e8', '#c9b8e8', '#e8a898', '#91889f', '#6ec9b0', '#d4a574'];

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 10 }, padding: 8, color: '#756d83' } } },
};

function objChart(obj: Record<string, number>, label: string) {
  const keys = Object.keys(obj);
  if (!keys.length) return { labels: ['No data'], datasets: [{ label, data: [0], backgroundColor: ['#e6e2ec'] }] };
  return {
    labels: keys.map((k) => k.replace(/_/g, ' ')),
    datasets: [{ label, data: keys.map((k) => obj[k]), backgroundColor: palette.slice(0, keys.length), borderWidth: 0 }],
  };
}

function ChartBox({ title, height = 'h-48 sm:h-56', children }: { title: string; height?: string; children: React.ReactNode }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader title={title} />
      <div className={`${height} w-full min-w-0`}>{children}</div>
    </Card>
  );
}

/** Full 8+ chart dashboard — dashboards & report pages */
export function MegaAnalyticsGrid({ data, role }: { data: ExtendedChartData; role: RoleKey }) {
  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-2xl border border-candy-200/80 bg-gradient-to-r from-pastel-lavender/80 via-accent-soft/60 to-pastel-mint/70 px-5 py-3">
        <p className="text-sm font-bold text-primary">📊 Live Analytics</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <ChartBox title="Shipments by Status"><Doughnut data={objChart(data.statusCounts, 'Shipments')} options={baseOpts} /></ChartBox>
        <ChartBox title="Shipment Priority"><Pie data={objChart(data.priorityCounts, 'Priority')} options={baseOpts} /></ChartBox>
        <ChartBox title="Fleet Status"><Doughnut data={objChart(data.vehicleCounts, 'Fleet')} options={baseOpts} /></ChartBox>
        <ChartBox title="Delivery Assignments"><Bar data={objChart(data.assignmentCounts, 'Assignments')} options={baseOpts} /></ChartBox>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <ChartBox title="Volume Trend"><Line data={{ labels: data.months, datasets: [{ label: 'Shipments', data: data.shipmentTrend, borderColor: '#6b6578', backgroundColor: 'rgba(107,101,120,0.12)', fill: true, tension: 0.4 }] }} options={baseOpts} /></ChartBox>
        <ChartBox title="Revenue (₱ thousands)"><Bar data={{ labels: data.months, datasets: [{ label: 'Revenue', data: data.revenueTrend, backgroundColor: '#9f8fd4' }] }} options={baseOpts} /></ChartBox>
        <ChartBox title="Support Tickets"><Bar data={objChart(data.ticketCounts, 'Tickets')} options={baseOpts} /></ChartBox>
        <ChartBox title="Purchase Orders"><Pie data={objChart(data.poCounts, 'POs')} options={baseOpts} /></ChartBox>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <ChartBox title="Invoice Status"><Doughnut data={objChart(data.invoiceCounts, 'Invoices')} options={baseOpts} /></ChartBox>
        <ChartBox title="QA Inspections"><Pie data={objChart(data.qaCounts, 'QA')} options={baseOpts} /></ChartBox>
        <ChartBox title="Inventory Stock"><Bar data={{ labels: data.inventoryLabels.length ? data.inventoryLabels : ['SKU'], datasets: [{ label: 'Qty', data: data.inventoryQuantities.length ? data.inventoryQuantities : [0], backgroundColor: palette }] }} options={baseOpts} /></ChartBox>
        <ChartBox title="Fuel Spend (₱ k)"><Line data={{ labels: data.months, datasets: [{ label: 'Fuel', data: data.fuelTrend, borderColor: '#f5c98a', backgroundColor: 'rgba(245,201,138,0.2)', fill: true, tension: 0.4 }] }} options={baseOpts} /></ChartBox>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBox title="Users by Role" height="h-56 sm:h-72"><Bar data={objChart(data.roleCounts, 'Users')} options={{ ...baseOpts, indexAxis: 'y' as const }} /></ChartBox>
        <ChartBox title={`${role.replace(/-/g, ' ')} KPI Radar`} height="h-56 sm:h-72">
          <Radar
            data={{
              labels: data.roleFocus.map((r) => r.label),
              datasets: [{ label: 'KPIs', data: data.roleFocus.map((r) => r.value), backgroundColor: 'rgba(159,143,212,0.25)', borderColor: '#6b6578', pointBackgroundColor: '#9f8fd4' }],
            }}
            options={baseOpts}
          />
        </ChartBox>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ChartBox title="Operational Tasks"><PolarArea data={objChart(data.taskCounts, 'Tasks')} options={baseOpts} /></ChartBox>
        <ChartBox title="Maintenance Jobs"><Bar data={objChart(data.maintenanceCounts, 'Jobs')} options={baseOpts} /></ChartBox>
      </div>
    </div>
  );
}

/** Compact 4-chart strip — every action/list page */
export function CompactRoleCharts({ data, role }: { data: ExtendedChartData; role: RoleKey }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <ChartBox title="Status Mix" height="h-40 sm:h-44"><Doughnut data={objChart(data.statusCounts, 'Status')} options={{ ...baseOpts, plugins: { legend: { display: false } } }} /></ChartBox>
      <ChartBox title="Your KPIs" height="h-40 sm:h-44">
        <Bar
          data={{
            labels: data.roleFocus.map((r) => r.label),
            datasets: [{ data: data.roleFocus.map((r) => r.value), backgroundColor: palette.slice(0, 4) }],
          }}
          options={{ ...baseOpts, plugins: { legend: { display: false } } }}
        />
      </ChartBox>
      <ChartBox title="Trend" height="h-40 sm:h-44">
        <Line data={{ labels: data.months.slice(-4), datasets: [{ data: data.shipmentTrend.slice(-4), borderColor: '#9f8fd4', backgroundColor: 'rgba(159,143,212,0.12)', fill: true, tension: 0.4 }] }} options={{ ...baseOpts, plugins: { legend: { display: false } } }} />
      </ChartBox>
      <ChartBox title="Fleet / Tickets" height="h-40 sm:h-44"><Pie data={objChart({ ...data.vehicleCounts, ...data.ticketCounts }, 'Ops')} options={{ ...baseOpts, plugins: { legend: { display: false } } }} /></ChartBox>
    </div>
  );
}

/** @deprecated use MegaAnalyticsGrid or CompactRoleCharts */
export function AnalyticsGrid(props: ExtendedChartData) {
  return <MegaAnalyticsGrid data={props} role="super-admin" />;
}

export function MiniCharts(props: ExtendedChartData) {
  return <CompactRoleCharts data={props} role="super-admin" />;
}
