import type { Staff } from '@/mocks/staff';

interface Props {
  staff: Staff;
  onClose: () => void;
}

export default function StaffDetailsDrawer({ staff, onClose }: Props) {
  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div 
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[600px] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header Section */}
        <div className="p-6 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between mb-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center relative shrink-0" style={{ background: 'var(--primary)' }}>
                <span className="text-white font-heading font-700 text-xl">
                  {staff.initials}
                </span>
                <div 
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[3px]"
                  style={{ 
                    borderColor: 'var(--surface)',
                    background: staff.status === 'Active' ? 'var(--success)' : 'var(--danger)'
                  }}
                  title={staff.status}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[20px] font-heading font-700 leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {staff.firstName} {staff.lastName}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider font-heading font-700 px-2 py-0.5 rounded-full" style={{ 
                    background: staff.role === 'Super Admin' ? 'rgba(168,85,247,0.1)' : 'rgba(14,165,233,0.1)', 
                    color: staff.role === 'Super Admin' ? '#A855F7' : '#0EA5E9' 
                  }}>
                    {staff.role}
                  </span>
                </div>
                <p className="text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>
                  {staff.email}
                </p>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Edit Role
            </button>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Force Password Reset
            </button>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors cursor-pointer"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
              Suspend Access
            </button>
          </div>
        </div>

        {/* Scrollable Content (Activity Table) */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg)]">
          <h3 className="text-[14px] font-heading font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Activity Feed</h3>
          
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                  <th className="px-4 py-3 text-[11px] font-heading font-600 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Timestamp</th>
                  <th className="px-4 py-3 text-[11px] font-heading font-600 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Category</th>
                  <th className="px-4 py-3 text-[11px] font-heading font-600 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Action Performed</th>
                  <th className="px-4 py-3 text-[11px] font-heading font-600 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Target</th>
                </tr>
              </thead>
              <tbody>
                {staff.activity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <p className="text-[13px] font-body" style={{ color: 'var(--text-muted)' }}>No recent system activity.</p>
                    </td>
                  </tr>
                ) : (
                  staff.activity.map(act => (
                    <tr key={act.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-default" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(act.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[10px] uppercase tracking-wider font-heading font-700 px-1.5 py-0.5 rounded"
                          style={{ 
                            background: 'rgba(var(--text-secondary-rgb), 0.1)',
                            color: 'var(--text-secondary)'
                          }}>
                          {act.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        <p className="text-[13px] font-body" style={{ color: 'var(--text-primary)' }}>
                          {act.action}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a href="#" className="text-[13px] font-body hover:underline" style={{ color: 'var(--primary)' }}>
                          {act.target}
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
