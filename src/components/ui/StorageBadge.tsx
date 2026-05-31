import { useData } from '@/context/DataContext';

export function StorageBadge() {
  const { data } = useData();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-pastel-mint bg-pastel-mint/60 px-4 py-2 text-xs font-semibold text-candy-800">
      <span>💾 localStorage connected</span>
      <span className="rounded-lg bg-white/80 px-2 py-0.5">{data.users.length} users</span>
      <span className="rounded-lg bg-white/80 px-2 py-0.5">{data.shipments.length} shipments</span>
      <span className="rounded-lg bg-white/80 px-2 py-0.5">{data.crudRecords.length} CRUD logs</span>
      <span className="rounded-lg bg-white/80 px-2 py-0.5">{data.notifications.filter((n) => !n.is_read).length} unread alerts</span>
    </div>
  );
}

export function FlashMessage({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-xl border border-pastel-mint bg-pastel-mint/70 px-4 py-3 text-sm font-semibold text-candy-800">{message}</div>;
}
