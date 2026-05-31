import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const rolesDir = path.join(root, 'src', 'roles');

const ROLE_PAGES = {
  'super-admin': ['index', 'users', 'settings', 'reports', 'backup'],
  'logistics-manager': ['index', 'shipments', 'staff', 'approve', 'reports'],
  'operations-manager': ['index', 'tasks', 'assign', 'workflow', 'performance'],
  'warehouse-manager': ['index', 'activities', 'inventory', 'approve-movements', 'reports'],
  'inventory-controller': ['index', 'stock', 'transfers', 'update-records', 'audit'],
  dispatcher: ['index', 'assign', 'schedule', 'monitor', 'routes'],
  'fleet-manager': ['index', 'vehicles', 'maintenance', 'fuel', 'repairs'],
  driver: ['index', 'deliveries', 'update-status', 'proof-of-delivery', 'incidents'],
  'delivery-personnel': ['index', 'deliveries', 'progress', 'signatures', 'evidence'],
  'procurement-officer': ['index', 'purchases', 'create-po', 'incoming', 'vendors'],
  'supplier-vendor': ['index', 'purchase-orders', 'confirm', 'shipment-info'],
  customer: ['index', 'create-shipment', 'track', 'history', 'notifications'],
  'customer-service': ['index', 'inquiries', 'resolve', 'requests', 'reports'],
  'route-planner': ['index', 'optimize', 'schedules', 'efficiency', 'routes'],
  'transport-coordinator': ['index', 'coordinate', 'assignments', 'monitor'],
  'quality-assurance': ['index', 'inspect', 'damaged-items', 'compliance', 'reports'],
  'finance-officer': ['index', 'invoices', 'payments', 'reports', 'costs'],
  auditor: ['index', 'transactions', 'compliance', 'audit-reports'],
  'data-analyst': ['index', 'performance', 'dashboard', 'kpis', 'trends'],
  'security-officer': ['index', 'security', 'access-logs', 'users-access'],
  'maintenance-technician': ['index', 'records', 'repairs', 'schedule', 'jobs'],
  'branch-manager': ['index', 'branch-ops', 'warehouse', 'staff', 'branch-reports'],
  'shipment-coordinator': ['index', 'process', 'track', 'coordinate'],
  'packing-staff': ['index', 'pack', 'records', 'verify'],
  'loading-unloading-staff': ['index', 'load', 'unload', 'cargo-status', 'report-damage'],
};

function toPascalCase(str) {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function pageComponentName(pageKey) {
  if (pageKey === 'index') return 'Dashboard';
  if (pageKey === 'dashboard') return 'AnalyticsDashboard';
  return toPascalCase(pageKey);
}

for (const [role, pages] of Object.entries(ROLE_PAGES)) {
  const rolePath = path.join(rolesDir, role);
  const pagesPath = path.join(rolePath, 'pages');
  fs.mkdirSync(pagesPath, { recursive: true });

  const exports = [];

  for (const pageKey of pages) {
    const compName = pageComponentName(pageKey);
    const fileName = `${compName}.tsx`;
    const content = `import { RolePageRenderer } from '@/components/pages/RolePageRenderer';

export default function ${compName}() {
  return <RolePageRenderer role="${role}" pageKey="${pageKey}" />;
}
`;
    fs.writeFileSync(path.join(pagesPath, fileName), content);
    exports.push({ compName, pageKey, fileName: fileName.replace('.tsx', '') });
  }

  const routeImports = exports
    .map((e) => `import ${e.compName} from './pages/${e.fileName}';`)
    .join('\n');

  const routeEntries = exports
    .map((e) => {
      const routePath = e.pageKey === 'index' ? '' : e.pageKey;
      return `  { path: '${routePath}', element: <${e.compName} /> },`;
    })
    .join('\n');

  const indexContent = `${routeImports}

export const ${toPascalCase(role).replace(/-/g, '')}Routes = [
${routeEntries}
];
`;

  fs.writeFileSync(path.join(rolePath, 'routes.tsx'), indexContent);
}

// Master roles index
const masterImports = Object.keys(ROLE_PAGES)
  .map((role) => {
    const name = toPascalCase(role).replace(/-/g, '') + 'Routes';
    return `import { ${name} } from './${role}/routes';`;
  })
  .join('\n');

const masterExports = Object.keys(ROLE_PAGES)
  .map((role) => {
    const name = toPascalCase(role).replace(/-/g, '') + 'Routes';
    return `  '${role}': ${name},`;
  })
  .join('\n');

fs.writeFileSync(
  path.join(rolesDir, 'index.ts'),
  `${masterImports}

export const roleRouteMap = {
${masterExports}
};
`
);

console.log(`Generated ${Object.keys(ROLE_PAGES).length} role folders`);
