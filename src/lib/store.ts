import type { AppData, RoleKey, User } from '@/types';
import { createAlignedSeedData } from '@/lib/seedData';

export const STORAGE_KEY = 'lms_app_data_v3';
const LEGACY_KEYS = ['lms_app_data_v2', 'lms_app_data_v1'];
const SCHEMA_VERSION = 3;

type DataListener = () => void;
const listeners = new Set<DataListener>();

export function subscribeData(listener: DataListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

function createSeedData(): AppData {
  return createAlignedSeedData();
}

function readLegacyStorage(): Partial<AppData> | null {
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as Partial<AppData>;
    } catch {
      /* try next key */
    }
  }
  return null;
}

/** Merge persisted data with seed defaults so empty collections get demo records */
function normalizeData(data: Partial<AppData>): AppData {
  const seed = createSeedData();
  const pick = <K extends keyof AppData>(key: K, emptyOk = false): AppData[K] => {
    const val = data[key];
    if (val === undefined || val === null) return seed[key];
    if (!emptyOk && Array.isArray(val) && val.length === 0) return seed[key];
    return val as AppData[K];
  };

  return {
    branches: pick('branches'),
    users: pick('users'),
    shipments: pick('shipments'),
    shipmentStatusLogs: pick('shipmentStatusLogs'),
    inventoryItems: pick('inventoryItems'),
    stockMovements: pick('stockMovements'),
    vehicles: pick('vehicles'),
    deliveryRoutes: pick('deliveryRoutes'),
    deliveryAssignments: pick('deliveryAssignments'),
    purchaseOrders: pick('purchaseOrders'),
    invoices: pick('invoices'),
    supportTickets: pick('supportTickets'),
    notifications: pick('notifications'),
    auditLogs: pick('auditLogs'),
    crudRecords: pick('crudRecords'),
    accessLogs: pick('accessLogs'),
    operationalTasks: pick('operationalTasks'),
    logisticsPlans: pick('logisticsPlans'),
    qualityInspections: pick('qualityInspections'),
    packingRecords: pick('packingRecords'),
    loadingRecords: pick('loadingRecords'),
    vehicleMaintenance: pick('vehicleMaintenance'),
    fuelLogs: pick('fuelLogs'),
    nextId: { ...seed.nextId, ...(data.nextId ?? {}) },
  };
}

let memoryData: AppData | null = null;

export function loadData(): AppData {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = readLegacyStorage();
      if (legacy) {
        memoryData = normalizeData(legacy);
        saveData(memoryData, false);
        return memoryData;
      }
    }
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      memoryData = normalizeData(parsed);
      return memoryData;
    }
  } catch {
    /* re-seed below */
  }
  memoryData = createSeedData();
  saveData(memoryData, false);
  return memoryData;
}

export function saveData(data: AppData, notify = true): void {
  memoryData = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (notify) notifyListeners();
}

export function resetData(): AppData {
  memoryData = createSeedData();
  saveData(memoryData);
  return memoryData;
}

export function exportData(): string {
  return JSON.stringify(loadData(), null, 2);
}

export function nextId(data: AppData, key: string): number {
  const id = data.nextId[key] ?? 1;
  data.nextId[key] = id + 1;
  return id;
}

export function getUserByEmail(data: AppData, email: string): User | undefined {
  return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.status === 'active');
}

export function getUserById(data: AppData, id: number): User | undefined {
  return data.users.find((u) => u.id === id);
}

export function getUsersByRole(data: AppData, role: RoleKey): User[] {
  return data.users.filter((u) => u.role === role && u.status === 'active');
}

export function generateTrackingNumber(): string {
  return 'LMS' + Date.now().toString(36).toUpperCase().slice(-8);
}

export function generateTicketNumber(data: AppData): string {
  return 'TKT-' + String(nextId(data, 'supportTickets')).padStart(5, '0');
}

export function generatePONumber(data: AppData): string {
  return 'PO-' + new Date().getFullYear() + '-' + String(nextId(data, 'purchaseOrders')).padStart(3, '0');
}

export function generateInvoiceNumber(data: AppData): string {
  return 'INV-' + new Date().getFullYear() + '-' + String(nextId(data, 'invoices')).padStart(4, '0');
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(n: number): string {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

export { SCHEMA_VERSION };
