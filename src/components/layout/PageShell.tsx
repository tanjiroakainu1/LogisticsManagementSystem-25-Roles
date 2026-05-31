import { ReactNode } from 'react';
import type { AuthUser, RoleKey } from '@/types';
import type { PageMeta } from '@/types';
import type { StatDef } from '@/types';
import type { ExtendedChartData } from '@/lib/chartData';
import { getPageRecordsTable } from '@/lib/pageRecords';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/layout/AppShell';
import { MegaAnalyticsGrid, CompactRoleCharts } from '@/components/charts/AnalyticsGrid';
import { StatGrid } from '@/components/ui/StatGrid';
import { FlashMessage } from '@/components/ui/StorageBadge';
import { PageRecordsTable, SharedCrudTable } from '@/components/ui/SharedCrudTable';
import { DeveloperBadge } from '@/components/ui/DeveloperCredit';

interface PageShellProps {
  meta: PageMeta;
  role: RoleKey;
  pageKey: string;
  user: AuthUser;
  stats: StatDef[];
  statValues: Record<string, string | number>;
  chartData: ExtendedChartData;
  message?: string;
  megaCharts?: boolean;
  children: ReactNode;
}

export function PageShell({
  meta,
  role,
  pageKey,
  user,
  stats,
  statValues,
  chartData,
  message,
  megaCharts = false,
  children,
}: PageShellProps) {
  const { data } = useData();
  const pageTable = getPageRecordsTable(data, role, pageKey, user);

  return (
    <>
      <PageHeader title={meta.title} subtitle={meta.subtitle} role={role} />
      {message ? <FlashMessage message={message} /> : null}
      <StatGrid stats={stats} values={statValues} />
      {megaCharts ? (
        <MegaAnalyticsGrid data={chartData} role={role} />
      ) : (
        <CompactRoleCharts data={chartData} role={role} />
      )}
      {children}
      {pageTable ? (
        <PageRecordsTable title={pageTable.title} headers={pageTable.headers} rows={pageTable.rows} />
      ) : null}
      <SharedCrudTable />
      <div className="mt-4 flex justify-center sm:mt-6">
        <DeveloperBadge />
      </div>
    </>
  );
}
