interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
      <p className="text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>
        Page <span className="font-600" style={{ color: 'var(--text-primary)' }}>{currentPage}</span> of <span className="font-600" style={{ color: 'var(--text-primary)' }}>{totalPages}</span>
      </p>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 px-3 rounded-md text-[13px] font-body font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg)]"
          style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--surface)' }}
        >
          <i className="ri-arrow-left-s-line" />
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 px-3 rounded-md text-[13px] font-body font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg)]"
          style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--surface)' }}
        >
          Next
          <i className="ri-arrow-right-s-line" />
        </button>
      </div>
    </div>
  );
}
