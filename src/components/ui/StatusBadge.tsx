const colors: Record<string, string> = {
  pending: 'bg-pastel-peach text-candy-800',
  approved: 'bg-pastel-sky text-candy-800',
  processing: 'bg-pastel-lavender text-candy-800',
  packed: 'bg-accent-soft text-primary-dark',
  loaded: 'bg-pastel-lavender text-candy-800',
  dispatched: 'bg-pastel-sky text-candy-800',
  in_transit: 'bg-pastel-mint text-candy-800',
  out_for_delivery: 'bg-pastel-mint text-candy-800',
  delivered: 'bg-pastel-mint text-candy-800 ring-1 ring-pastel-mint',
  cancelled: 'bg-candy-100 text-candy-600',
  issue: 'bg-pastel-rose text-candy-800',
  active: 'bg-pastel-mint text-candy-800',
  inactive: 'bg-candy-100 text-candy-600',
  suspended: 'bg-pastel-rose text-candy-800',
  open: 'bg-pastel-peach text-candy-800',
  in_progress: 'bg-pastel-sky text-candy-800',
  resolved: 'bg-pastel-mint text-candy-800',
  closed: 'bg-candy-100 text-candy-600',
  paid: 'bg-pastel-mint text-candy-800',
  overdue: 'bg-pastel-rose text-candy-800',
  sent: 'bg-pastel-sky text-candy-800',
  confirmed: 'bg-pastel-mint text-candy-800',
  shipped: 'bg-pastel-lavender text-candy-800',
  received: 'bg-pastel-mint text-candy-800',
  available: 'bg-pastel-mint text-candy-800',
  in_use: 'bg-pastel-sky text-candy-800',
  maintenance: 'bg-pastel-peach text-candy-800',
  passed: 'bg-pastel-mint text-candy-800',
  failed: 'bg-pastel-rose text-candy-800',
  normal: 'bg-candy-100 text-candy-700',
  high: 'bg-pastel-peach text-candy-800',
  urgent: 'bg-pastel-rose text-candy-800',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = colors[status] ?? 'bg-candy-100 text-candy-700';
  return (
    <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
