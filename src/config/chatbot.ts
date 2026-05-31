import { PLATFORM, DEVELOPER } from '@/config/brand';
import { SHIPMENT_FLOW } from '@/config/homeFlow';
import { DEMO_PASSWORD, getRoleLabel } from '@/config/roles';
import type { RoleKey } from '@/types';

export type ChatContext = RoleKey | 'guest';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

/** Role-specific quick questions — shown as chips in the chatbot */
export const ROLE_QUICK_QUESTIONS: Record<ChatContext, string[]> = {
  guest: [
    'Ask me anything — I can help with any topic',
    'What is this LMS platform?',
    'Explain the 8-step shipment flow',
    'How do I log in with demo accounts?',
    'What are all 25 roles?',
    'Who built this system?',
    'What can I do before registering?',
    'What is the demo password?',
    'How does data sync across roles?',
  ],
  'super-admin': [
    'How do I add, edit & delete users?',
    'How do I backup and reset demo data?',
    'What can Super Admin see that others cannot?',
    'Explain the CRUD activity log',
    'How many users and shipments exist?',
    'What are system settings?',
    'How do I suspend a user account?',
    'Walk me through all 25 roles',
  ],
  customer: [
    'How do I create a shipment request?',
    'How do I track my package?',
    'What shipment statuses will I see?',
    'How do notifications work for customers?',
    'Can I view shipment history?',
    'What is LMSDEMO001 and its status?',
    'How are invoices created for my deliveries?',
    'What priority levels can I choose?',
  ],
  'shipment-coordinator': [
    'How do I process pending shipments?',
    'What is the difference between approve and process?',
    'How do I flag a shipment issue?',
    'Which shipments need my action now?',
    'Explain LMSDEMO001 workflow',
    'What happens after I approve a shipment?',
    'Who handles packing after me?',
    'How do I track coordinator KPIs?',
  ],
  'packing-staff': [
    'How do I mark a shipment as packed?',
    'Which shipments are ready to pack?',
    'What is the verify packing step?',
    'What status comes after packed?',
    'Explain LMSDEMO002 workflow',
    'How do packing records work?',
    'Who inspects after packing?',
    'What are my dashboard stats?',
  ],
  'quality-assurance': [
    'How do I pass or fail QA inspection?',
    'What happens if inspection fails?',
    'Which shipments need QA review?',
    'Explain LMSDEMO003 workflow',
    'What is conditional inspection?',
    'Who loads cargo after QA pass?',
    'How do I report damaged items?',
    'What compliance pages do I have?',
  ],
  'loading-unloading-staff': [
    'How do I confirm cargo load?',
    'How do I unload delivered shipments?',
    'How do I report damage during loading?',
    'Which shipments are ready to load?',
    'Explain LMSDEMO004 workflow',
    'What is cargo status page?',
    'Who assigns delivery after loading?',
    'What records do I create?',
  ],
  dispatcher: [
    'How do I assign a driver to a shipment?',
    'Which drivers and vehicles are available?',
    'How do delivery routes work?',
    'Explain LMSDEMO004 assignment flow',
    'What happens after dispatch?',
    'How do I monitor active deliveries?',
    'What notifications do drivers get?',
    'What are pending assignments?',
  ],
  driver: [
    'How do I update delivery to in transit?',
    'How do I mark a delivery as completed?',
    'Where are my assigned deliveries?',
    'How do I submit proof of delivery?',
    'Explain LMSDEMO005 driver workflow',
    'How do I report an incident?',
    'What vehicles am I assigned to?',
    'What statuses can I set?',
  ],
  'delivery-personnel': [
    'How do I manage my delivery runs?',
    'How do I capture signatures?',
    'How do I upload delivery evidence?',
    'How do I update delivery progress?',
    'What is different from driver role?',
    'Which shipments are out for delivery?',
    'How do customers get notified?',
    'Explain my dashboard KPIs',
  ],
  'transport-coordinator': [
    'How do I coordinate transport assignments?',
    'How do I monitor fleet movement?',
    'What is the assignments page for?',
    'How do I link routes to shipments?',
    'Who do I work with in the pipeline?',
    'Explain in-transit monitoring',
    'What KPIs should I watch?',
    'How do delivery routes get created?',
  ],
  'route-planner': [
    'How do I create a delivery route?',
    'How do I optimize routes?',
    'What is route efficiency tracking?',
    'How do schedules work?',
    'How are routes linked to dispatch?',
    'What distance metrics matter?',
    'Explain my planning dashboard',
    'Who uses the routes I create?',
  ],
  'logistics-manager': [
    'How do I monitor all shipments?',
    'How do I approve logistics plans?',
    'What staff can I oversee?',
    'Explain operational reports',
    'What KPIs define logistics health?',
    'How does the full pipeline connect?',
    'Which roles report to logistics?',
    'How do I track fleet and warehouse?',
  ],
  'operations-manager': [
    'How do I oversee daily operations?',
    'What operational tasks can I assign?',
    'How do I monitor warehouse and fleet?',
    'Explain cross-role coordination',
    'What reports should I review?',
    'How do I handle bottlenecks?',
    'What is on my operations dashboard?',
    'How do tasks and notifications work?',
  ],
  'warehouse-manager': [
    'How do I manage warehouse operations?',
    'How does inventory connect to shipments?',
    'What stock movements need approval?',
    'Who are packing and loading staff?',
    'Explain warehouse KPIs',
    'How do branches relate to warehouse?',
    'What is on my staff page?',
    'How do I track inbound cargo?',
  ],
  'inventory-controller': [
    'How do I update inventory quantities?',
    'How do stock movements work?',
    'What movement types exist?',
    'Who approves stock movements?',
    'Explain SKU tracking',
    'How does inventory affect shipments?',
    'What are low stock alerts?',
    'How do I create a stock movement?',
  ],
  'fleet-manager': [
    'How do I manage vehicles?',
    'How do fuel logs work?',
    'What vehicle statuses exist?',
    'How do I schedule maintenance?',
    'Who are the drivers I assign to?',
    'Explain fleet dashboard KPIs',
    'How does maintenance connect to fleet?',
    'What reports can I generate?',
  ],
  'maintenance-technician': [
    'How do I view my maintenance jobs?',
    'How do I schedule vehicle repairs?',
    'How do I mark a job complete?',
    'What maintenance types exist?',
    'How am I linked to fleet manager?',
    'Explain my records page',
    'What vehicles need service?',
    'How do I log repair details?',
  ],
  'procurement-officer': [
    'How do I create a purchase order?',
    'How do I manage vendors?',
    'What incoming orders should I track?',
    'How do suppliers confirm POs?',
    'Explain PO status flow',
    'Who receives shipped POs?',
    'What amounts and currencies are used?',
    'How do I monitor procurement KPIs?',
  ],
  'supplier-vendor': [
    'How do I view purchase orders sent to me?',
    'How do I confirm an order?',
    'How do I mark a PO as shipped?',
    'What PO statuses exist?',
    'How do I communicate with procurement?',
    'Explain my dashboard',
    'What shipment info can I see?',
    'How are payments handled?',
  ],
  'finance-officer': [
    'How do I create an invoice for a delivery?',
    'How do I mark invoices as paid?',
    'Which delivered shipments need invoicing?',
    'Explain LMSDEMO005 invoicing',
    'What payment statuses exist?',
    'How do cost reports work?',
    'What currency does the system use?',
    'How do customers receive invoices?',
  ],
  'customer-service': [
    'How do I take a support ticket?',
    'How do I resolve customer inquiries?',
    'What ticket priorities exist?',
    'How do I handle customer requests?',
    'Explain ticket status flow',
    'How am I linked to customers?',
    'What is on my resolve page?',
    'How do I view service reports?',
  ],
  auditor: [
    'How do I review audit reports?',
    'What transactions can I inspect?',
    'How does compliance tracking work?',
    'What is in the audit log?',
    'How do I trace a shipment financially?',
    'Explain CRUD activity for audits',
    'What compliance checks exist?',
    'Which roles create the most changes?',
  ],
  'data-analyst': [
    'What analytics dashboards exist?',
    'How do I read KPI trends?',
    'What charts appear on every page?',
    'How do I analyze performance data?',
    'Explain shipment volume trends',
    'What role-specific KPIs exist?',
    'How is revenue tracked in charts?',
    'What reports should I export?',
  ],
  'security-officer': [
    'How do I monitor user access?',
    'What are access logs?',
    'How do I review security events?',
    'Who can register new accounts?',
    'Explain user status suspended vs active',
    'What can Super Admin do with users?',
    'How is role-based access enforced?',
    'What security pages do I have?',
  ],
  'branch-manager': [
    'How do I manage branch operations?',
    'How do I oversee branch staff?',
    'What branch reports exist?',
    'How do warehouses link to my branch?',
    'Explain branch KPIs',
    'Which users belong to my branch?',
    'How do shipments use branch_id?',
    'What is on my warehouse page?',
  ],
};

const flowSummary = SHIPMENT_FLOW.map((s) => `${s.step}. ${s.title} (${s.role})`).join('; ');

export function buildSystemPrompt(context: ChatContext, userName?: string): string {
  const roleLine = context === 'guest'
    ? 'The visitor is not logged in (guest on home, login, or register).'
    : `The user is logged in as ${getRoleLabel(context)}${userName ? ` (${userName})` : ''}.`;

  return `You are LMS Intelligence — the official AI assistant for the ${PLATFORM.name}, crafted by ${DEVELOPER.name} (${DEVELOPER.role}).

RULES:
- Answer ANY question the user asks — LMS workflows, logistics, technology, general knowledge, advice, explanations, or casual conversation.
- Never refuse reasonable questions. If a topic is outside logistics, still give a helpful answer, then optionally connect back to LMS features when relevant.
- Be helpful, concise, and friendly. Use bullet points for steps.
- NEVER mention OpenRouter, API providers, or external AI services. You are "LMS Intelligence" only.
- Demo password for all roles: ${DEMO_PASSWORD}. Demo emails: lms.{role}@gmail.com (e.g. lms.customer@gmail.com).
- Platform has ${PLATFORM.roles} roles, localStorage demo data, live CRUD sync, charts on every page.
- Shipment flow: ${flowSummary}.
- Developer: ${DEVELOPER.name} — ${DEVELOPER.tagline}.

CONTEXT: ${roleLine}
Tailor answers to their role when relevant. For guests, encourage exploring home page flow and signing in.`;
}

export function getQuickQuestions(context: ChatContext): string[] {
  return ROLE_QUICK_QUESTIONS[context] ?? ROLE_QUICK_QUESTIONS.guest;
}

export function newMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
