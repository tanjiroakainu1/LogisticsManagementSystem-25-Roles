/** Public home page — shipment lifecycle flow (guest-facing) */
export const SHIPMENT_FLOW = [
  { step: 1, icon: '📝', title: 'Request Shipment', role: 'Customer', detail: 'Customer submits origin, destination, weight & priority.' },
  { step: 2, icon: '📋', title: 'Process & Approve', role: 'Shipment Coordinator', detail: 'Coordinator reviews, approves, or flags issues.' },
  { step: 3, icon: '📦', title: 'Pack & Verify', role: 'Packing Staff', detail: 'Items are packed and contents verified.' },
  { step: 4, icon: '🔬', title: 'Quality Inspection', role: 'QA Officer', detail: 'Inspection pass/fail before cargo moves forward.' },
  { step: 5, icon: '⬆️', title: 'Load Cargo', role: 'Loading Staff', detail: 'Shipment loaded onto vehicle at the warehouse.' },
  { step: 6, icon: '📡', title: 'Assign Delivery', role: 'Dispatcher', detail: 'Driver, vehicle & route assigned to the shipment.' },
  { step: 7, icon: '🚛', title: 'In Transit', role: 'Driver / Courier', detail: 'Real-time status updates until delivery.' },
  { step: 8, icon: '✅', title: 'Delivered & Invoice', role: 'Finance Officer', detail: 'Proof of delivery, invoicing & payment tracking.' },
] as const;

export const PLATFORM_FEATURES = [
  { icon: '👥', title: '25 Integrated Roles', text: 'Every stakeholder — from customer to super admin — works in one connected platform.' },
  { icon: '📊', title: 'Live Analytics', text: 'Charts, KPIs, and dashboards on every page for data-driven decisions.' },
  { icon: '🔄', title: 'Real-Time CRUD Sync', text: 'Create, update & delete actions sync instantly across all roles via shared activity logs.' },
  { icon: '🔗', title: 'End-to-End Pipeline', text: 'Shipments flow from request to delivery with full audit trail & notifications.' },
  { icon: '🛡️', title: 'Role-Based Access', text: 'Each role sees tailored menus, stats, and actions — secure and organized.' },
  { icon: '💾', title: 'Standalone Demo', text: 'Runs entirely in your browser with aligned seed data — no server required.' },
] as const;

export const HOME_STATS = [
  { label: 'Roles', value: '25' },
  { label: 'Workflow Steps', value: '8+' },
  { label: 'Demo Shipments', value: '11' },
  { label: 'Live Charts', value: '14' },
] as const;
