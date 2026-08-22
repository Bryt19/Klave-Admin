export type TicketType = 'Bug Report' | 'Support Request' | 'Feature Request';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

export interface TicketReply {
  id: string;
  author: string;
  isFounder: boolean;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyOwner: string;
  pharmacyPlan: string;
  type: TicketType;
  subject: string;
  description: string;
  date: string;
  status: TicketStatus;
  screenshotUrl?: string;
  replies: TicketReply[];
  internalNotes: string;
}

export const supportTickets: SupportTicket[] = [
  {
    id: 'TKT001',
    pharmacyId: 'PH003',
    pharmacyName: 'CarePoint Drugs',
    pharmacyOwner: 'Kofi Boateng',
    pharmacyPlan: 'Starter',
    type: 'Bug Report',
    subject: 'Batch expiry dates not saving correctly',
    description: 'When I add a new batch and set the expiry date to any date in 2027, the system saves it as 2026 instead. This has happened 3 times now and I had to delete and re-add the batch. It seems like the year is being decremented by 1 during save.',
    date: '2026-04-12T09:23:00',
    status: 'Open',
    screenshotUrl: 'https://readdy.ai/api/search-image?query=pharmacy%20inventory%20software%20screenshot%20showing%20date%20input%20field%20with%20error%20message%20highlighted%20in%20red%20on%20a%20clean%20white%20dashboard%20interface&width=800&height=500&seq=tkt001&orientation=landscape',
    replies: [],
    internalNotes: 'Check date serialization in batch creation endpoint. Possible timezone offset issue.',
  },
  {
    id: 'TKT002',
    pharmacyId: 'PH007',
    pharmacyName: 'GoldCoast Pharmacy',
    pharmacyOwner: 'Nana Acheampong',
    pharmacyPlan: 'Growth',
    type: 'Support Request',
    subject: 'How to add a second branch to my account?',
    description: 'We are opening a second branch in Elmina next month and I want to know if I can manage both branches from the same Klavora account. If yes, how do I set it up? If not, do I need a separate subscription?',
    date: '2026-04-11T14:05:00',
    status: 'In Progress',
    replies: [
      { id: 'R001', author: 'Founder', isFounder: true, message: 'Hi Nana! Multi-branch support is on our roadmap for Q3 2026. For now, you would need a separate account for each branch. I can offer you a 20% discount on the second subscription — let me know if you\'d like that.', timestamp: '2026-04-11T16:30:00' },
      { id: 'R002', author: 'Nana Acheampong', isFounder: false, message: 'That would be great! Please apply the discount. The new branch will be on the Growth plan as well.', timestamp: '2026-04-12T08:15:00' },
    ],
    internalNotes: 'Apply 20% discount coupon when second account is created. Flag for multi-branch feature prioritization.',
  },
  {
    id: 'TKT003',
    pharmacyId: 'PH010',
    pharmacyName: 'Pharmalink GH',
    pharmacyOwner: 'Kwesi Tetteh',
    pharmacyPlan: 'Growth',
    type: 'Bug Report',
    subject: 'PIN login fails intermittently for staff',
    description: 'Two of my staff members are reporting that their PINs sometimes fail on the first attempt but work on the second. This started happening after the last update. It\'s not consistent — maybe 1 in 5 login attempts fails. Very frustrating for busy periods.',
    date: '2026-04-10T11:45:00',
    status: 'Open',
    replies: [],
    internalNotes: 'Possible race condition in PIN validation. Check auth service logs for failed attempts from PH010.',
  },
  {
    id: 'TKT004',
    pharmacyId: 'PH015',
    pharmacyName: 'PharmaPlus Accra',
    pharmacyOwner: 'Adjoa Boateng',
    pharmacyPlan: 'Scale',
    type: 'Support Request',
    subject: 'Need to export monthly sales report as PDF',
    description: 'I need to submit a monthly sales report to my accountant and the current CSV export is not accepted by their system. Can you add a PDF export option? This is urgent as my accountant needs the report by end of this month.',
    date: '2026-04-09T16:20:00',
    status: 'In Progress',
    replies: [
      { id: 'R003', author: 'Founder', isFounder: true, message: 'Hi Adjoa, PDF export is being added in our next release (April 25th). I\'ll personally notify you when it\'s live. In the meantime, I can generate a PDF report manually for you — just let me know the date range.', timestamp: '2026-04-09T18:00:00' },
    ],
    internalNotes: 'PDF export feature is in dev. Manually generate report for PH015 if needed before April 25.',
  },
  {
    id: 'TKT005',
    pharmacyId: 'PH018',
    pharmacyName: 'Kumasi Central Pharmacy',
    pharmacyOwner: 'Osei Bonsu',
    pharmacyPlan: 'Growth',
    type: 'Support Request',
    subject: 'Mobile Money payment not reflecting after 2 days',
    description: 'I made my monthly subscription payment via MTN Mobile Money on April 10th and received a confirmation SMS, but my account still shows as unpaid. The transaction ID is GH-MTN-20260410-88234. Please help resolve this urgently.',
    date: '2026-04-12T10:30:00',
    status: 'Open',
    replies: [],
    internalNotes: 'Check MoMo webhook logs for transaction GH-MTN-20260410-88234. Likely webhook delivery failure. Manually mark as paid after verification.',
  },
];
