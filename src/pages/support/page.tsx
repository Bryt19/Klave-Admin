import { useState } from 'react';
import Badge from '@/components/base/Badge';
import SelectDropdown from '@/components/base/SelectDropdown';
import SupportDrawer from './components/SupportDrawer';
import { supportTickets as allTickets, type SupportTicket, type TicketStatus } from '@/mocks/support';

function formatTimestamp(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) {
    // Return time if less than 24h
    return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  // Return date if older than 24h
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const typeOptions = [
  { label: 'All Types', value: 'All Types' },
  { label: 'Bug Report', value: 'Bug Report' },
  { label: 'Support Request', value: 'Support Request' },
  { label: 'Feature Request', value: 'Feature Request' }
];

const statusOptions = [
  { label: 'All Statuses', value: 'All Statuses' },
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Resolved', value: 'Resolved' }
];

export default function SupportPage() {
  const [tickets, setTickets] = useState(allTickets);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = tickets.filter(t =>
    (filterType === 'All Types' || t.type === filterType) &&
    (filterStatus === 'All Statuses' || t.status === filterStatus) &&
    (!search || t.pharmacyName.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSaveTicket = (status: TicketStatus, note: string) => {
    if (!selected) return;
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status, internalNotes: note } : t));
    showToast(`Ticket ${selected.id} updated successfully.`);
    setSelected(null); // Close drawer
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-body text-white bg-success shadow-lg">{toast}</div>}
      
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Support</h1>
          <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>{tickets.filter(t => t.status === 'Open').length} open tickets</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full h-9 pl-9 pr-3 rounded-lg text-sm font-body outline-none focus:ring-1 focus:ring-primary"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="w-[180px]">
          <SelectDropdown
            value={filterType}
            onChange={setFilterType}
            options={typeOptions}
          />
        </div>
        <div className="w-[180px]">
          <SelectDropdown
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
          />
        </div>
        <div className="flex items-center gap-1 px-3 rounded-lg text-[12px] font-mono font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {filtered.length} tickets
        </div>
      </div>

      {/* Ticket List */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="py-12 text-center rounded-xl">
            <p className="text-[13px] font-body" style={{ color: 'var(--text-muted)' }}>
              No tickets match your filters.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map(t => (
              <div
                key={t.id}
                onClick={() => setSelected(t)}
                className="px-5 py-4 cursor-pointer transition-colors table-row-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-[12px] font-mono font-700">{t.pharmacyName.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-heading font-600 truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>{t.pharmacyName}</p>
                    <p className="text-[13px] font-body truncate" style={{ color: 'var(--text-secondary)' }}>{t.subject}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 shrink-0">
                  <Badge label={t.type} />
                  <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{formatTimestamp(t.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <SupportDrawer 
          ticket={selected} 
          onClose={() => setSelected(null)} 
          onSave={handleSaveTicket}
        />
      )}
    </div>
  );
}
