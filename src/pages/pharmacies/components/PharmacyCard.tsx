import type { Pharmacy } from '@/mocks/pharmacies';
import Badge from '@/components/base/Badge';

interface Props {
  pharmacy: Pharmacy;
  onView: () => void;
}

export default function PharmacyCard({ pharmacy, onView }: Props) {
  return (
    <div 
      onClick={onView}
      className="p-4 flex flex-col gap-4 rounded-xl cursor-pointer table-row-hover transition-colors"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
            <span className="text-primary font-heading font-700 text-sm">
              {pharmacy.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-heading font-600 truncate" style={{ color: 'var(--text-primary)' }}>
              {pharmacy.name}
            </p>
            <p className="text-[12px] font-body mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              Joined <span className="font-mono">{pharmacy.joined}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge label={pharmacy.status} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-1 pt-4" style={{ borderTop: '1px dashed var(--border)' }}>
        <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
          <p className="text-[15px] font-mono font-700" style={{ color: 'var(--text-primary)' }}>{pharmacy.staffCount}</p>
          <p className="text-[10px] font-body leading-tight" style={{ color: 'var(--text-secondary)' }}>staff</p>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
          <p className="text-[15px] font-mono font-700" style={{ color: 'var(--text-primary)' }}>{pharmacy.totalTransactions.toLocaleString()}</p>
          <p className="text-[10px] font-body leading-tight" style={{ color: 'var(--text-secondary)' }}>transactions</p>
        </div>
      </div>
      
      <button
        onClick={(e) => { e.stopPropagation(); onView(); }}
        className="w-full h-8 mt-1 rounded-lg text-[12px] font-body font-medium transition-colors flex items-center justify-center gap-1.5"
        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.color = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <i className="ri-profile-line"></i> View Details
      </button>
    </div>
  );
}
