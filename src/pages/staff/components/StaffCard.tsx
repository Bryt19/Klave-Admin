import type { Staff } from '@/mocks/staff';

interface Props {
  staff: Staff;
  onViewActivity: () => void;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function StaffCard({ staff, onViewActivity }: Props) {
  return (
    <div 
      className="p-4 flex flex-col gap-4 rounded-xl transition-colors relative"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: 'var(--primary)' }}>
            <span className="text-white font-heading font-700 text-sm">
              {staff.initials}
            </span>
            {/* Status Indicator */}
            <div 
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
              style={{ 
                borderColor: 'var(--surface)',
                background: staff.status === 'Active' ? 'var(--success)' : 'var(--danger)'
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[14px] font-heading font-600 truncate" style={{ color: 'var(--text-primary)' }}>
                {staff.name}
              </p>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-heading font-700 px-1.5 py-0.5 rounded" style={{ 
                background: staff.role === 'Super Admin' ? 'rgba(168,85,247,0.1)' : 'rgba(14,165,233,0.1)', 
                color: staff.role === 'Super Admin' ? '#A855F7' : '#0EA5E9' 
              }}>
                {staff.role}
              </span>
            </div>
            <p className="text-[11px] font-body truncate" style={{ color: 'var(--text-secondary)' }}>
              {staff.email}
            </p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity summary instead of 3-column stats */}
      {staff.activity.length > 0 ? (
        <div className="flex gap-3 relative mt-1 pt-3" style={{ borderTop: '1px dashed var(--border)' }}>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase tracking-wider font-heading font-700 px-1.5 py-0.5 rounded"
                style={{ 
                  background: 'rgba(var(--text-secondary-rgb), 0.1)',
                  color: 'var(--text-secondary)'
                }}>
                {staff.activity[0].category}
              </span>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                {timeAgo(staff.activity[0].timestamp)}
              </p>
            </div>
            <p className="text-[12px] font-body line-clamp-2" style={{ color: 'var(--text-primary)' }}>
              {staff.activity[0].action}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-1 pt-3 text-center" style={{ borderTop: '1px dashed var(--border)' }}>
          <p className="text-[12px] font-body" style={{ color: 'var(--text-muted)' }}>No recent activity</p>
        </div>
      )}
      
      {/* Footer Action */}
      <button
        onClick={(e) => { e.stopPropagation(); onViewActivity(); }}
        className="w-full h-8 mt-1 rounded-lg text-[12px] font-body font-medium transition-colors flex items-center justify-center gap-1.5"
        style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        View Details
      </button>
    </div>
  );
}
