import { useState, useEffect } from 'react';
import type { SupportTicket, TicketStatus } from '@/mocks/support';
import Badge from '@/components/base/Badge';
import SelectDropdown from '@/components/base/SelectDropdown';

interface Props {
  ticket: SupportTicket;
  onClose: () => void;
  onSave: (status: TicketStatus, note: string) => void;
}



const statusOptions = [
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Resolved', value: 'Resolved' }
];

export default function SupportDrawer({ ticket, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [note, setNote] = useState(ticket.internalNotes || '');

  const isDirty = status !== ticket.status || note !== (ticket.internalNotes || '');

  useEffect(() => {
    // Reset state when ticket changes
    setStatus(ticket.status);
    setNote(ticket.internalNotes || '');
    setLoading(true);
    
    // Simulate network load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [ticket]);

  const handleSave = () => {
    onSave(status, note);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div 
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[480px] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="p-5 flex items-start gap-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
            <span className="text-primary font-heading font-700 text-lg">
              {ticket.pharmacyName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-heading font-700 leading-tight" style={{ color: 'var(--text-primary)' }}>
              {ticket.pharmacyName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge label={ticket.type} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <i className="ri-close-line text-[18px]"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-4 bg-[var(--border)] rounded w-3/4"></div>
              <div className="h-4 bg-[var(--border)] rounded w-1/2"></div>
              <div className="h-32 bg-[var(--border)] rounded w-full mt-4"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Ticket Meta */}
              <div>
                <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>
                  {ticket.subject}
                </p>
                <div className="flex items-center gap-4 text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>
                  <span>{new Date(ticket.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <a href={`mailto:${ticket.pharmacyOwner.toLowerCase().replace(' ', '.')}@example.com`} className="text-primary hover:underline flex items-center gap-1">
                    <i className="ri-mail-line"></i> Contact Pharmacy
                  </a>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <p className="text-[13px] font-body leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {ticket.description}
                </p>
              </div>

              {/* Controls */}
              <div className="space-y-5" style={{ borderTop: '1px dashed var(--border)', paddingTop: '20px' }}>
                <div>
                  <label className="block text-[11px] font-body mb-2" style={{ color: 'var(--text-secondary)' }}>Ticket Status</label>
                  <SelectDropdown
                    value={status}
                    onChange={(v) => setStatus(v as TicketStatus)}
                    options={statusOptions}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-body mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <i className="ri-lock-line text-purple-600 dark:text-purple-400"></i>
                    Internal Notes (Not visible to pharmacy)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a private note about this ticket..."
                    rows={4}
                    className="w-full rounded-lg px-3 py-2 text-[13px] font-body outline-none focus:ring-1 focus:ring-purple-500 transition-shadow resize-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 shrink-0 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleSave}
            disabled={!isDirty || loading}
            className="w-full h-9 rounded-lg text-[13px] font-body font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
