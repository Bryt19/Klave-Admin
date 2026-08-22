import { useEffect, useMemo, useState } from 'react';
import type { Pharmacy } from '@/mocks/pharmacies';
import { activityFeed } from '@/mocks/activity';
import { supportTickets } from '@/mocks/support';
import Badge from '@/components/base/Badge';

interface Props {
  pharmacy: Pharmacy;
  onClose: () => void;
}

export default function PharmacyDrawer({ pharmacy, onClose }: Props) {
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [extensionAmount, setExtensionAmount] = useState('30');
  const [extensionType, setExtensionType] = useState('days');
  const [restoreTxId, setRestoreTxId] = useState('');
  const [settingsLocked, setSettingsLocked] = useState(false);

  const recentActivity = useMemo(() => {
    return activityFeed.filter(a => a.pharmacyId === pharmacy.id).slice(0, 5);
  }, [pharmacy.id]);

  const tickets = useMemo(() => {
    return supportTickets.filter(t => t.pharmacyId === pharmacy.id && t.status !== 'Resolved');
  }, [pharmacy.id]);

  // Handle ESC key and block body scroll
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="relative w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
            <span className="text-primary font-heading font-700 text-[13px]">
              {pharmacy.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-heading font-700 leading-tight" style={{ color: 'var(--text-primary)' }}>
              {pharmacy.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge label={pharmacy.status} />
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
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Details Grid */}
          <div>
            <h3 className="text-[12px] uppercase tracking-widest font-heading font-600 mb-4" style={{ color: 'var(--text-muted)' }}>
              Pharmacy Details
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <p className="text-[11px] font-body mb-1" style={{ color: 'var(--text-secondary)' }}>Owner</p>
                <p className="text-[13px] font-medium font-body truncate" style={{ color: 'var(--text-primary)' }}>{pharmacy.owner}</p>
              </div>
              <div>
                <p className="text-[11px] font-body mb-1" style={{ color: 'var(--text-secondary)' }}>Region</p>
                <p className="text-[13px] font-medium font-body truncate" style={{ color: 'var(--text-primary)' }}>{pharmacy.region}</p>
              </div>
              <div>
                <p className="text-[11px] font-body mb-1" style={{ color: 'var(--text-secondary)' }}>Email</p>
                <p className="text-[13px] font-medium font-body truncate" style={{ color: 'var(--text-primary)' }}>{pharmacy.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-body mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</p>
                <p className="text-[13px] font-mono truncate" style={{ color: 'var(--text-primary)' }}>{pharmacy.phone}</p>
              </div>
              <div>
                <p className="text-[11px] font-body mb-1" style={{ color: 'var(--text-secondary)' }}>Date Joined</p>
                <p className="text-[13px] font-mono truncate" style={{ color: 'var(--text-primary)' }}>{pharmacy.joined}</p>
              </div>
            </div>
          </div>

          {/* Super Admin Controls Accordion */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setIsSuperAdminOpen(!isSuperAdminOpen)}
              className="w-full flex items-center justify-between p-4 cursor-pointer transition-colors"
              style={{ background: isSuperAdminOpen ? 'rgba(0,0,0,0.02)' : 'var(--surface)' }}
            >
              <div className="flex items-center gap-2">
                <i className="ri-shield-keyhole-line text-lg text-primary"></i>
                <h3 className="text-[13px] font-heading font-700 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Super Admin Controls</h3>
              </div>
              <i className={`ri-arrow-down-s-line text-xl transition-transform ${isSuperAdminOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }}></i>
            </button>
            
            {isSuperAdminOpen && (
              <div className="p-4 space-y-5 animate-in slide-in-from-top-2 duration-200" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                
                {/* Extend Account */}
                <div>
                  <p className="text-[12px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Extend Account Access</p>
                  <p className="text-[11px] font-body mb-2" style={{ color: 'var(--text-secondary)' }}>Grant free time bypassing billing</p>
                  <div className="flex gap-2">
                    <input type="number" value={extensionAmount} onChange={e => setExtensionAmount(e.target.value)}
                      className="w-16 h-8 px-2 rounded-md text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                    <select value={extensionType} onChange={e => setExtensionType(e.target.value)}
                      className="h-8 px-2 rounded-md text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow cursor-pointer"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                    </select>
                    <button className="flex-1 h-8 rounded-md text-[12px] font-body font-medium transition-colors cursor-pointer text-white"
                      style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}>
                      Grant Extension
                    </button>
                  </div>
                </div>

                {/* Force Toggle Status */}
                <div>
                  <p className="text-[12px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Force Toggle Status</p>
                  <p className="text-[11px] font-body mb-2" style={{ color: 'var(--text-secondary)' }}>Instantly override active/suspended state</p>
                  <div className="flex gap-2">
                    <button className="flex-1 h-8 rounded-md text-[12px] font-body font-medium transition-colors cursor-pointer"
                      style={{ border: '1px solid var(--success)', color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)' }}>
                      Activate
                    </button>
                    <button className="flex-1 h-8 rounded-md text-[12px] font-body font-medium transition-colors cursor-pointer"
                      style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                      Suspend
                    </button>
                  </div>
                </div>

                {/* Restore Paid Registration */}
                <div>
                  <p className="text-[12px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Restore Paid Registration</p>
                  <p className="text-[11px] font-body mb-2" style={{ color: 'var(--text-secondary)' }}>Fulfill a broken Paystack transaction</p>
                  <div className="flex gap-2">
                    <input type="text" value={restoreTxId} onChange={e => setRestoreTxId(e.target.value)} placeholder="Tx Reference ID"
                      className="flex-1 h-8 px-2 rounded-md text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                    <button disabled={!restoreTxId.trim()} className="h-8 px-3 rounded-md text-[12px] font-body font-medium transition-colors cursor-pointer disabled:opacity-50"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                      Restore
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-heading font-600" style={{ color: 'var(--text-primary)' }}>Toggle Setting Locks</p>
                      <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>Prevent owner from editing core settings</p>
                    </div>
                    <div className="relative inline-block w-8 align-middle select-none transition duration-200 ease-in mt-1 shrink-0">
                      <input type="checkbox" checked={settingsLocked} onChange={(e) => setSettingsLocked(e.target.checked)}
                        className="absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                        style={{ right: settingsLocked ? '0' : '1rem', top: '2px', borderColor: settingsLocked ? 'var(--primary)' : 'var(--border)' }} />
                      <label className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
                        style={{ background: settingsLocked ? 'var(--primary)' : 'var(--surface)' }}></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-heading font-600 text-purple-500">Grant Lifetime Free Tier</p>
                      <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>Bypass all future paywalls</p>
                    </div>
                    <button className="h-7 px-3 rounded-md text-[11px] font-body font-medium transition-colors cursor-pointer"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--surface)' }}>
                      Grant Tier
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Support Tickets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] uppercase tracking-widest font-heading font-600" style={{ color: 'var(--text-muted)' }}>
                Open Tickets
              </h3>
              <Badge label={`${tickets.length}`} showDot={false} variant={tickets.length > 0 ? 'warning' : 'neutral'} />
            </div>
            {tickets.length > 0 ? (
              <div className="space-y-2">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="p-3 rounded-lg border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <p className="text-[13px] font-medium font-body line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                        {ticket.subject}
                      </p>
                      <Badge label={ticket.status} size="sm" showDot={false} />
                    </div>
                    <p className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(ticket.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center rounded-lg border border-dashed" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[12px] font-body" style={{ color: 'var(--text-muted)' }}>No open tickets</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-[12px] uppercase tracking-widest font-heading font-600 mb-4" style={{ color: 'var(--text-muted)' }}>
              Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map(act => (
                  <div key={act.id} className="flex gap-3 relative">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" 
                      style={{ background: act.movement === 'Sale' ? 'var(--primary)' : act.movement === 'Restock' ? 'var(--success)' : 'var(--warning)' }} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-[13px] font-medium font-body truncate" style={{ color: 'var(--text-primary)' }}>
                          {act.drugName}
                        </p>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full whitespace-nowrap"
                          style={{ 
                            background: act.movement === 'Sale' ? 'rgba(var(--primary-rgb), 0.1)' : act.movement === 'Restock' ? 'rgba(var(--success-rgb), 0.1)' : 'rgba(var(--warning-rgb), 0.1)',
                            color: act.movement === 'Sale' ? 'var(--primary)' : act.movement === 'Restock' ? 'var(--success)' : 'var(--warning)'
                          }}>
                          {act.movement}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>
                          <span className="font-mono font-600" style={{ color: 'var(--text-primary)' }}>{act.movement === 'Sale' ? '-' : '+'}{act.quantity}</span> units
                        </p>
                        <span style={{ color: 'var(--text-muted)' }}>&middot;</span>
                        <p className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(act.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center rounded-lg border border-dashed" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[12px] font-body" style={{ color: 'var(--text-muted)' }}>No recent activity</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
