import { ReactNode } from 'react';

export function Card({ children, className = '', glow = false }: { children: ReactNode; className?: string; glow?: boolean }) {
  return <div className={`card min-w-0 ${glow ? 'card-glow' : ''} ${className}`}>{children}</div>;
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-candy-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
      <h2 className="min-w-0 break-words text-base font-bold text-candy-900 sm:text-lg">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ message, icon = '📭' }: { message: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center text-candy-500 sm:py-12">
      <span className="mb-3 text-4xl">{icon}</span>
      <p className="max-w-md text-sm sm:text-base">{message}</p>
    </div>
  );
}

export function DataTable({ headers, rows, minWidth = 540 }: { headers: string[]; rows: (string | ReactNode)[][]; minWidth?: number }) {
  if (!rows.length) return <EmptyState message="No records found" />;
  return (
    <div className="table-scroll rounded-xl border border-candy-200/80">
      <table className="text-left text-sm" style={{ minWidth: `${minWidth}px` }}>
        <thead>
          <tr className="border-b border-candy-100 bg-candy-50/90">
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wide text-candy-500 sm:px-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-candy-50 transition hover:bg-accent-soft/40">
              {row.map((cell, j) => (
                <td key={j} className="max-w-[200px] truncate px-3 py-3 text-candy-700 sm:max-w-none sm:whitespace-nowrap sm:px-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
