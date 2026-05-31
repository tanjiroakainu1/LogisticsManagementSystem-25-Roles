import { FormEvent, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { ROLE_PAGES, STAT_DEFS, NAV_ICONS, getRoleLabel, getRoleFolder } from '@/config/roles';
import { getExtendedChartData } from '@/lib/chartData';
import { getRoleStats } from '@/lib/stats';
import { formatDateTime, formatCurrency, getUserById, getUsersByRole } from '@/lib/store';
import type { RoleKey } from '@/types';
import {
  assignDelivery, assignTask, approvePlan, approveStockMovement, backupData,
  confirmPO, createInvoice, createPurchaseOrder, createRoute, createShipment, createStockMovement,
  createTicket, completeMaintenanceJob, inspectShipment, loadShipment, markNotificationRead,
  packShipment, payInvoice, processShipment, recordFuelLog, reportDamage, resolveTicket,
  scheduleMaintenance, takeTicket, unloadShipment, updateDeliveryStatus,
  updateInventoryItem, verifyPacking,
} from '@/lib/services';
import { rejectPlan, rejectStockMovement } from '@/lib/extendedServices';
import { UsersManager } from '@/components/admin/UsersManager';
import { renderRoleCrudPages } from '@/components/crud/RoleCrudPages';
import { DEVELOPER } from '@/config/brand';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardHeader, DataTable, EmptyState } from '@/components/ui/Card';
import { DeveloperShowcase } from '@/components/ui/DeveloperCredit';
import { WelcomeBanner } from '@/components/ui/StatGrid';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Props { role: RoleKey; pageKey: string; }

export function RolePageRenderer({ role, pageKey }: Props) {
  const { user } = useAuth();
  const { data, update, mutate, exportJson, reset: resetStore } = useData();
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const [trackInput, setTrackInput] = useState('');

  if (!user) return null;
  const meta = ROLE_PAGES[role][pageKey];
  if (!meta) return <EmptyState message="Page not found" />;

  const stats = getRoleStats(data, role, user);
  const chartData = getExtendedChartData(data, role, user);
  const isReport = ['reports', 'performance', 'dashboard', 'kpis', 'trends', 'audit-reports', 'branch-reports', 'efficiency'].includes(pageKey);
  const isDashboard = pageKey === 'index';

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const shell = (body: ReactNode, megaCharts = false) => (
    <PageShell meta={meta} role={role} pageKey={pageKey} user={user} stats={STAT_DEFS[role]} statValues={stats} chartData={chartData} message={msg || undefined} megaCharts={megaCharts}>
      {body}
    </PageShell>
  );

  // ─── DASHBOARD ───
  if (isDashboard) {
    const pages = ROLE_PAGES[role];
    const quickLinks = Object.entries(pages).filter(([k]) => k !== 'index').slice(0, 4);
    return shell(
      <>
        <WelcomeBanner name={user.full_name} roleLabel={getRoleLabel(role)} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card glow>
            <CardHeader title="Quick Access" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickLinks.map(([k, m]) => (
                <button key={k} type="button" onClick={() => navigate(`/${getRoleFolder(role)}/${k}`)} className="flex min-h-[56px] items-center gap-3 rounded-xl border border-candy-100 p-3 text-left transition hover:border-primary-light hover:bg-primary-soft hover:shadow-md sm:p-4">
                  <span className="shrink-0 text-xl sm:text-2xl">{NAV_ICONS[k]}</span>
                  <span className="truncate text-sm font-bold text-candy-800 sm:text-base">{m.title}</span>
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Connected Workflows" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {['🔗 Shared LMS Database', '📦 Shipment Pipeline', '🔔 Live Notifications', '📊 Cross-Role Reports'].map((w) => (
                <div key={w} className="rounded-xl bg-candy-50 px-4 py-3 text-sm font-semibold text-candy-700">{w}</div>
              ))}
            </div>
          </Card>
        </div>
      </>,
      true
    );
  }

  // ─── REPORTS / ANALYTICS PAGES ───
  if (isReport) {
    const recentAudit = data.auditLogs.slice(0, 15).map((a) => [
      getUserById(data, a.user_id ?? 0)?.full_name ?? 'System',
      a.action,
      a.details ?? '—',
      formatDateTime(a.created_at),
    ]);
    return shell(
      <Card>
        <CardHeader title="Recent Audit Log" />
        <DataTable headers={['User', 'Action', 'Details', 'Date']} rows={recentAudit} />
      </Card>,
      true
    );
  }

  // ─── SUPER ADMIN: USERS ───
  if (role === 'super-admin' && pageKey === 'users') {
    return shell(<UsersManager onFlash={flash} />);
  }

  // ─── SUPER ADMIN: BACKUP ───
  if (role === 'super-admin' && pageKey === 'backup') {
    return shell(<><Card><CardHeader title="System Backup" />
        <p className="mb-4 text-candy-600">Export all system data as JSON backup.</p>
        <button type="button" className="btn btn-primary" onClick={() => { update((d) => { backupData(d); }); const blob = new Blob([exportJson()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lms-backup.json'; a.click(); flash('Backup saved and downloaded'); }}>Download Backup</button>
        <button type="button" className="btn btn-outline mt-3" onClick={() => { if (confirm('Reset all data to demo seed?')) { resetStore(); flash('System reset to demo data'); } }}>Reset Demo Data</button>
      </Card></>
    );
  }

  // ─── CUSTOMER: CREATE SHIPMENT ───
  if (role === 'customer' && pageKey === 'create-shipment') {
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const tracking = mutate((d) => createShipment(d, user, {
        origin: fd.get('origin') as string,
        destination: fd.get('destination') as string,
        description: fd.get('description') as string,
        weight_kg: parseFloat(fd.get('weight_kg') as string) || 1,
        priority: fd.get('priority') as 'normal' | 'high' | 'urgent',
        estimated_delivery: fd.get('estimated_delivery') as string,
      }));
      navigate(`/${getRoleFolder(role)}/track?tracking=${tracking}`);
    };
    return shell(<><Card><form onSubmit={onSubmit} className="space-y-4">
        <div className="form-row"><div className="form-group"><label>Origin *</label><input name="origin" required placeholder="Pickup address" /></div><div className="form-group"><label>Destination *</label><input name="destination" required placeholder="Delivery address" /></div></div>
        <div className="form-group"><label>Description</label><textarea name="description" rows={3} placeholder="Package contents" /></div>
        <div className="form-row"><div className="form-group"><label>Weight (kg)</label><input name="weight_kg" type="number" step="0.01" defaultValue={1} /></div><div className="form-group"><label>Priority</label><select name="priority"><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div></div>
        <div className="form-group"><label>Estimated Delivery</label><input name="estimated_delivery" type="date" /></div>
        <button type="submit" className="btn btn-primary">Submit Shipment Request</button>
      </form></Card></>
    );
  }

  // ─── CUSTOMER: TRACK ───
  if (role === 'customer' && pageKey === 'track') {
    const params = new URLSearchParams(window.location.search);
    const tracking = params.get('tracking') || trackInput;
    const shipment = data.shipments.find((s) => s.tracking_number === tracking && s.customer_id === user.id);
    const logs = data.shipmentStatusLogs.filter((l) => l.shipment_id === shipment?.id);
    return shell(<><Card><div className="form-row items-end"><div className="form-group"><label>Tracking Number</label><input value={trackInput || tracking} onChange={(e) => setTrackInput(e.target.value)} placeholder="LMS..." /></div><button type="button" className="btn btn-primary" onClick={() => setTrackInput(trackInput)}>Track</button></div></Card>
        {shipment ? (<Card><CardHeader title={shipment.tracking_number} action={<StatusBadge status={shipment.status} />} /><p className="mb-4">{shipment.origin} → {shipment.destination}</p><DataTable headers={['Status', 'Notes', 'Date']} rows={logs.map((l) => [l.status, l.notes ?? '—', formatDateTime(l.created_at)])} /></Card>) : tracking ? <Card><EmptyState message="Shipment not found" /></Card> : null}
      </>
    );
  }

  // ─── DISPATCHER: ASSIGN ───
  if (role === 'dispatcher' && pageKey === 'assign') {
    const assignedIds = new Set(data.deliveryAssignments.filter((a) => !['delivered', 'failed'].includes(a.status)).map((a) => a.shipment_id));
    const shipments = data.shipments.filter((s) => ['loaded', 'packed'].includes(s.status) && !assignedIds.has(s.id));
    const drivers = [...getUsersByRole(data, 'driver'), ...getUsersByRole(data, 'delivery-personnel')];
    const vehicles = data.vehicles.filter((v) => v.status === 'available');
    return shell(<>
        {shipments.length === 0 ? <Card><EmptyState message="No shipments ready for dispatch" /></Card> : shipments.map((s) => (
          <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} action={<StatusBadge status={s.status} />} /><p className="mb-4 text-candy-600">{s.origin} → {s.destination}</p>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => assignDelivery(d, user, { shipment_id: s.id, driver_id: parseInt(fd.get('driver_id') as string), vehicle_id: parseInt(fd.get('vehicle_id') as string) || undefined, route_id: parseInt(fd.get('route_id') as string) || undefined })); flash('Delivery assigned!'); }} className="space-y-4">
              <div className="form-row"><div className="form-group"><label>Driver *</label><select name="driver_id" required><option value="">Select</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}</select></div><div className="form-group"><label>Vehicle</label><select name="vehicle_id"><option value="">Select</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number}</option>)}</select></div></div>
              <div className="form-group"><label>Route</label><select name="route_id"><option value="">Select</option>{data.deliveryRoutes.map((r) => <option key={r.id} value={r.id}>{r.route_name}</option>)}</select></div>
              <button type="submit" className="btn btn-primary">Assign Delivery</button>
            </form>
          </Card>
        ))}
      </>
    );
  }

  // ─── SHIPMENT COORDINATOR: PROCESS ───
  if (role === 'shipment-coordinator' && pageKey === 'process') {
    const pending = data.shipments.filter((s) => ['pending', 'processing'].includes(s.status));
    return shell(<>{pending.map((s) => (
        <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} action={<StatusBadge status={s.status} />} /><p className="mb-4">{s.origin} → {s.destination}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => { update((d) => processShipment(d, user, s.id, 'process')); }}>Start Processing</button>
            <button type="button" className="btn btn-outline" onClick={() => { update((d) => processShipment(d, user, s.id, 'approve')); }}>Approve</button>
            <button type="button" className="btn btn-outline text-red-600" onClick={() => { update((d) => processShipment(d, user, s.id, 'issue')); }}>Flag Issue</button>
          </div>
        </Card>
      ))}{pending.length === 0 && <Card><EmptyState message="No pending shipments" /></Card>}</>
    );
  }

  // ─── PACKING STAFF: PACK ───
  if (role === 'packing-staff' && pageKey === 'pack') {
    const toPack = data.shipments.filter((s) => s.status === 'approved');
    return shell(<>{toPack.map((s) => (
        <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} /><p className="mb-4">{s.origin} → {s.destination}</p>
          <button type="button" className="btn btn-primary" onClick={() => { update((d) => packShipment(d, user, s.id)); flash('Packed!'); }}>Mark as Packed</button>
        </Card>
      ))}{toPack.length === 0 && <Card><EmptyState message="No shipments awaiting pack" /></Card>}</>
    );
  }

  // ─── QA: INSPECT ───
  if (role === 'quality-assurance' && pageKey === 'inspect') {
    const toInspect = data.shipments.filter((s) => s.status === 'packed' && !data.qualityInspections.some((q) => q.shipment_id === s.id));
    return shell(<>{toInspect.map((s) => (
        <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} /><div className="flex gap-2"><button type="button" className="btn btn-primary" onClick={() => { update((d) => inspectShipment(d, user, s.id, 'passed')); }}>Pass</button><button type="button" className="btn btn-outline text-red-600" onClick={() => { update((d) => inspectShipment(d, user, s.id, 'failed', 'Damage found')); }}>Fail</button></div></Card>
      ))}{toInspect.length === 0 && <Card><EmptyState message="No shipments pending inspection" /></Card>}</>
    );
  }

  // ─── LOADING STAFF: LOAD ───
  if (role === 'loading-unloading-staff' && pageKey === 'load') {
    const ready = data.shipments.filter((s) => s.status === 'packed' || (s.status === 'loaded' && !data.loadingRecords.some((r) => r.shipment_id === s.id && r.action_type === 'load')));
    return shell(<>{ready.slice(0, 10).map((s) => (
        <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} /><button type="button" className="btn btn-primary" onClick={() => { update((d) => loadShipment(d, user, s.id)); }}>Confirm Load</button></Card>
      ))}</>
    );
  }

  // ─── DRIVER: DELIVERIES ───
  if ((role === 'driver' || role === 'delivery-personnel') && pageKey === 'deliveries') {
    const mine = data.deliveryAssignments.filter((a) => a.driver_id === user.id);
    const rows = mine.map((a) => {
      const s = data.shipments.find((x) => x.id === a.shipment_id);
      return [s?.tracking_number ?? '—', s ? `${s.origin} → ${s.destination}` : '—', <StatusBadge key={a.id} status={a.status} />,
        a.status !== 'delivered' ? <div key="btns" className="flex gap-2"><button type="button" className="btn btn-sm btn-outline" onClick={() => { update((d) => updateDeliveryStatus(d, user, a.id, 'in_transit')); }}>In Transit</button><button type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => updateDeliveryStatus(d, user, a.id, 'delivered')); }}>Delivered</button></div> : 'Done'];
    });
    return shell(<><Card><CardHeader title="My Deliveries" /><DataTable headers={['Tracking', 'Route', 'Status', 'Actions']} rows={rows} /></Card></>);
  }

  // ─── FINANCE: INVOICES ───
  if (role === 'finance-officer' && pageKey === 'invoices') {
    const delivered = data.shipments.filter((s) => s.status === 'delivered' && !data.invoices.some((i) => i.shipment_id === s.id));
    return shell(<>
        {delivered.map((s) => (<Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} /><button type="button" className="btn btn-primary" onClick={() => { update((d) => createInvoice(d, user, s.id, 1500 + s.weight_kg * 50)); flash('Invoice created'); }}>Create Invoice (₱{(1500 + s.weight_kg * 50).toFixed(2)})</button></Card>))}
        <Card className="mt-4"><CardHeader title="All Invoices" /><DataTable headers={['Invoice #', 'Amount', 'Status', 'Action']} rows={data.invoices.map((i) => [i.invoice_number, formatCurrency(i.amount), <StatusBadge key={i.id} status={i.status} />, i.status === 'pending' ? <button key="p" type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => payInvoice(d, user, i.id)); flash('Invoice marked paid'); }}>Mark Paid</button> : '—'])} /></Card>
      </>
    );
  }

  // ─── SUPPLIER: CONFIRM PO ───
  if (role === 'supplier-vendor' && pageKey === 'confirm') {
    const pos = data.purchaseOrders.filter((p) => p.supplier_id === user.id);
    return shell(<>{pos.map((p) => (
        <Card key={p.id} className="mb-4"><CardHeader title={p.po_number} action={<StatusBadge status={p.status} />} /><p className="mb-4">Amount: {formatCurrency(p.total_amount)}</p>
          {p.status === 'sent' && <button type="button" className="btn btn-primary" onClick={() => { update((d) => confirmPO(d, user, p.id, 'confirm')); }}>Confirm Order</button>}
          {p.status === 'confirmed' && <button type="button" className="btn btn-primary" onClick={() => { update((d) => confirmPO(d, user, p.id, 'ship')); }}>Mark Shipped</button>}
        </Card>
      ))}</>
    );
  }

  // ─── PROCUREMENT: CREATE PO ───
  if (role === 'procurement-officer' && pageKey === 'create-po') {
    const suppliers = getUsersByRole(data, 'supplier-vendor');
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createPurchaseOrder(d, user, parseInt(fd.get('supplier_id') as string), parseFloat(fd.get('amount') as string))); flash('PO created'); e.currentTarget.reset(); }} className="space-y-4">
        <div className="form-row"><div className="form-group"><label>Supplier *</label><select name="supplier_id" required><option value="">Select</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div><div className="form-group"><label>Amount (₱) *</label><input name="amount" type="number" required min={1} /></div></div>
        <button type="submit" className="btn btn-primary">Create Purchase Order</button>
      </form></Card></>
    );
  }

  // ─── LOGISTICS MANAGER: APPROVE PLANS ───
  if (role === 'logistics-manager' && pageKey === 'approve') {
    const plans = data.logisticsPlans.filter((p) => p.status === 'pending_approval');
    return shell(<>{plans.map((p) => (
        <Card key={p.id} className="mb-4"><CardHeader title={p.title} /><p className="mb-4">{p.description}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => { update((d) => approvePlan(d, user, p.id)); flash('Plan approved'); }}>Approve</button>
            <button type="button" className="btn btn-outline text-red-600" onClick={() => { update((d) => rejectPlan(d, user, p.id)); flash('Plan rejected'); }}>Reject</button>
          </div>
        </Card>
      ))}{plans.length === 0 && <Card><EmptyState message="No plans pending approval" /></Card>}</>
    );
  }

  // ─── OPERATIONS: ASSIGN TASKS ───
  if (role === 'operations-manager' && pageKey === 'assign') {
    const staff = data.users.filter((u) => u.status === 'active' && u.id !== user.id);
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => assignTask(d, user, fd.get('title') as string, parseInt(fd.get('assign_to') as string))); flash('Task assigned'); e.currentTarget.reset(); }} className="space-y-4">
        <div className="form-group"><label>Task Title *</label><input name="title" required /></div>
        <div className="form-group"><label>Assign To *</label><select name="assign_to" required><option value="">Select staff</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({getRoleLabel(s.role)})</option>)}</select></div>
        <button type="submit" className="btn btn-primary">Assign Task</button>
      </form></Card>
      <Card className="mt-4"><CardHeader title="Active Tasks" /><DataTable headers={['Title', 'Assigned To', 'Status', 'Due']} rows={data.operationalTasks.map((t) => [t.title, getUserById(data, t.assigned_to)?.full_name ?? '—', <StatusBadge key={t.id} status={t.status} />, t.due_date ?? '—'])} /></Card></>
    );
  }

  // ─── WAREHOUSE: APPROVE MOVEMENTS ───
  if (role === 'warehouse-manager' && pageKey === 'approve-movements') {
    const pending = data.stockMovements.filter((m) => m.status === 'pending');
    return shell(<>{pending.map((m) => {
        const item = data.inventoryItems.find((i) => i.id === m.item_id);
        return (<Card key={m.id} className="mb-4"><CardHeader title={item?.name ?? 'Item'} /><p className="mb-4">{m.movement_type} × {m.quantity}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => { update((d) => approveStockMovement(d, user, m.id)); flash('Approved'); }}>Approve</button>
            <button type="button" className="btn btn-outline text-red-600" onClick={() => { update((d) => rejectStockMovement(d, user, m.id)); flash('Rejected'); }}>Reject</button>
          </div>
        </Card>);
      })}{pending.length === 0 && <Card><EmptyState message="No pending movements" /></Card>}</>
    );
  }

  // ─── INVENTORY: TRANSFERS ───
  if (role === 'inventory-controller' && pageKey === 'transfers') {
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createStockMovement(d, user, parseInt(fd.get('item_id') as string), parseInt(fd.get('qty') as string), 'transfer')); flash('Transfer requested'); }} className="space-y-4">
        <div className="form-row"><div className="form-group"><label>Item *</label><select name="item_id" required>{data.inventoryItems.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}</select></div><div className="form-group"><label>Quantity *</label><input name="qty" type="number" required min={1} /></div></div>
        <button type="submit" className="btn btn-primary">Request Transfer</button>
      </form></Card></>
    );
  }

  // ─── FLEET: VEHICLES — handled in RoleCrudPages ───

  // ─── MAINTENANCE: SCHEDULE ───
  if (role === 'maintenance-technician' && pageKey === 'schedule') {
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => scheduleMaintenance(d, user, parseInt(fd.get('vehicle_id') as string), fd.get('type') as string, fd.get('date') as string)); flash('Maintenance scheduled'); }} className="space-y-4">
        <div className="form-row"><div className="form-group"><label>Vehicle *</label><select name="vehicle_id" required>{data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number}</option>)}</select></div><div className="form-group"><label>Type *</label><input name="type" required placeholder="Oil change, tire rotation..." /></div></div>
        <div className="form-group"><label>Date *</label><input name="date" type="date" required /></div>
        <button type="submit" className="btn btn-primary">Schedule</button>
      </form></Card></>
    );
  }

  // ─── CUSTOMER SERVICE: RESOLVE / REQUESTS ───
  if (role === 'customer-service' && ['resolve', 'requests'].includes(pageKey)) {
    const open = data.supportTickets.filter((t) => pageKey === 'resolve' ? ['open', 'in_progress'].includes(t.status) : true);
    return shell(<>{open.map((t) => (
        <Card key={t.id} className="mb-4"><CardHeader title={t.ticket_number} action={<StatusBadge status={t.status} />} /><p className="mb-2 font-bold">{t.subject}</p><p className="mb-4 text-candy-600">{t.description}</p>
          <div className="flex flex-wrap gap-2">
            {t.status === 'open' && <button type="button" className="btn btn-outline" onClick={() => { update((d) => takeTicket(d, user, t.id)); flash('Ticket assigned to you'); }}>Take Ticket</button>}
            {t.status !== 'resolved' && <button type="button" className="btn btn-primary" onClick={() => { update((d) => resolveTicket(d, user, t.id)); flash('Ticket resolved'); }}>Resolve</button>}
          </div>
        </Card>
      ))}{open.length === 0 && <Card><EmptyState message="No tickets" /></Card>}</>
    );
  }

  // ─── PACKING STAFF: VERIFY ───
  if (role === 'packing-staff' && pageKey === 'verify') {
    const records = data.packingRecords.filter((r) => !r.verified);
    return shell(<>{records.map((r) => {
        const s = data.shipments.find((x) => x.id === r.shipment_id);
        return (<Card key={r.id} className="mb-4"><CardHeader title={s?.tracking_number ?? 'Shipment'} /><button type="button" className="btn btn-primary" onClick={() => { update((d) => verifyPacking(d, user, r.id)); flash('Verified'); }}>Verify Contents</button></Card>);
      })}{records.length === 0 && <Card><EmptyState message="All packing records verified" /></Card>}</>
    );
  }

  // ─── LOADING STAFF: UNLOAD / REPORT DAMAGE ───
  if (role === 'loading-unloading-staff' && pageKey === 'unload') {
    const items = data.shipments.filter((s) => s.status === 'in_transit' || s.status === 'out_for_delivery');
    return shell(<>{items.map((s) => (
        <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} /><button type="button" className="btn btn-primary" onClick={() => { update((d) => unloadShipment(d, user, s.id)); flash('Unloaded'); }}>Confirm Unload</button></Card>
      ))}</>
    );
  }
  if (role === 'loading-unloading-staff' && pageKey === 'report-damage') {
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => reportDamage(d, user, parseInt(fd.get('shipment_id') as string), fd.get('notes') as string)); flash('Damage reported'); e.currentTarget.reset(); }} className="space-y-4">
        <div className="form-group"><label>Shipment *</label><select name="shipment_id" required>{data.shipments.map((s) => <option key={s.id} value={s.id}>{s.tracking_number}</option>)}</select></div>
        <div className="form-group"><label>Damage Notes *</label><textarea name="notes" required rows={3} /></div>
        <button type="submit" className="btn btn-primary">Report Damage</button>
      </form></Card></>
    );
  }

  // ─── INVENTORY: UPDATE RECORDS ───
  if (role === 'inventory-controller' && pageKey === 'update-records') {
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => updateInventoryItem(d, user, parseInt(fd.get('item_id') as string), parseInt(fd.get('quantity') as string))); flash('Inventory updated'); }} className="space-y-4">
        <div className="form-row"><div className="form-group"><label>Item *</label><select name="item_id" required>{data.inventoryItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div><div className="form-group"><label>New Quantity *</label><input name="quantity" type="number" required min={0} /></div></div>
        <button type="submit" className="btn btn-primary">Update Record</button>
      </form></Card></>
    );
  }

  // ─── FLEET: FUEL LOG ───
  if (role === 'fleet-manager' && pageKey === 'fuel') {
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => recordFuelLog(d, user, parseInt(fd.get('vehicle_id') as string), parseFloat(fd.get('liters') as string), parseFloat(fd.get('cost') as string))); flash('Fuel logged'); }} className="space-y-4">
        <div className="form-row"><div className="form-group"><label>Vehicle *</label><select name="vehicle_id" required>{data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number}</option>)}</select></div><div className="form-group"><label>Liters *</label><input name="liters" type="number" step="0.1" required /></div></div>
        <div className="form-group"><label>Cost (₱) *</label><input name="cost" type="number" required /></div>
        <button type="submit" className="btn btn-primary">Log Fuel</button>
      </form></Card>
      <Card className="mt-4"><CardHeader title="Fuel History" /><DataTable headers={['Vehicle', 'Liters', 'Cost', 'Date']} rows={data.fuelLogs.map((f) => { const v = data.vehicles.find((x) => x.id === f.vehicle_id); return [v?.plate_number ?? '—', f.liters, formatCurrency(f.cost), formatDateTime(f.logged_at)]; })} /></Card></>
    );
  }

  // ─── ROUTE PLANNER: CREATE ROUTE ───
  if (role === 'route-planner' && pageKey === 'routes') {
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createRoute(d, user, fd.get('name') as string, parseFloat(fd.get('distance') as string))); flash('Route created'); }} className="space-y-4">
        <div className="form-row"><div className="form-group"><label>Route Name *</label><input name="name" required /></div><div className="form-group"><label>Distance (km) *</label><input name="distance" type="number" required /></div></div>
        <button type="submit" className="btn btn-primary">Add Route</button>
      </form></Card>
      <Card className="mt-4"><DataTable headers={['Route', 'Distance', 'Status']} rows={data.deliveryRoutes.map((r) => [r.route_name, r.distance_km + ' km', <StatusBadge key={r.id} status={r.status} />])} /></Card></>
    );
  }

  // ─── MAINTENANCE: JOBS ───
  if (role === 'maintenance-technician' && pageKey === 'jobs') {
    const jobs = data.vehicleMaintenance.filter((j) => j.status !== 'completed');
    return shell(<>{jobs.map((j) => {
        const v = data.vehicles.find((x) => x.id === j.vehicle_id);
        return (<Card key={j.id} className="mb-4"><CardHeader title={v?.plate_number ?? 'Vehicle'} action={<StatusBadge status={j.status} />} /><p className="mb-4">{j.type}</p><button type="button" className="btn btn-primary" onClick={() => { update((d) => completeMaintenanceJob(d, user, j.id)); flash('Job completed'); }}>Mark Complete</button></Card>);
      })}</>
    );
  }

  // ─── SUPER ADMIN: SETTINGS ───
  if (role === 'super-admin' && pageKey === 'settings') {
    return shell(<>
        <DeveloperShowcase className="mb-4" />
        <Card><CardHeader title="System Settings" /><DataTable headers={['Setting', 'Value']} rows={[['Platform', 'Logistics Management System'], ['Developer', DEVELOPER.name], ['Roles', '25'], ['Users', String(data.users.length)], ['Shipments', String(data.shipments.length)]]} /></Card>
        <button type="button" className="btn btn-outline mt-4 text-red-600" onClick={() => { if (confirm('Reset all data?')) { resetStore(); flash('Demo data restored'); } }}>Reset All Data</button></>
    );
  }

  // ─── CUSTOMER: NOTIFICATIONS ───
  if (role === 'customer' && pageKey === 'notifications') {
    const notifs = data.notifications.filter((n) => n.user_id === user.id);
    return shell(<><Card><CardHeader title="My Notifications" /><DataTable headers={['Title', 'Message', 'Read', 'Date']} rows={notifs.map((n) => [n.title, n.message, n.is_read ? 'Yes' : <button key={n.id} type="button" className="btn btn-sm btn-outline" onClick={() => update((d) => markNotificationRead(d, n.id))}>Mark read</button>, formatDateTime(n.created_at)])} /></Card></>
    );
  }

  // ─── EXTENDED CRUD (all roles) ───
  const extended = renderRoleCrudPages({ role, pageKey, user, data, update, flash, shell });
  if (extended) return extended;

  // ─── DEFAULT: GENERIC TABLE PAGES ───
  return shell(<></>);
}
