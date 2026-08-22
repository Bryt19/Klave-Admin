import { useState, useRef, useEffect } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  icon?: string; // e.g., 'ri-map-pin-line'
  placeholder?: string;
  className?: string;
}

export default function SelectDropdown({ value, onChange, options, icon, placeholder = 'Select...', className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={`relative min-w-[160px] ${className}`} ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-9 px-3 flex items-center justify-between rounded-lg text-sm font-body font-medium transition-colors cursor-pointer select-none"
        style={{ 
          background: 'var(--surface)', 
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`, 
          color: 'var(--text-primary)',
          boxShadow: open ? '0 0 0 1px var(--primary)' : 'none'
        }}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <i className={`${icon} text-[14px]`} style={{ color: 'var(--text-muted)' }} />}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <i className={`ri-arrow-down-s-line text-[16px] transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div 
          className="absolute z-50 top-[calc(100%+4px)] left-0 w-full max-h-[240px] overflow-y-auto rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-[13px] font-body transition-colors hover:bg-[var(--bg)] cursor-pointer flex items-center justify-between"
              style={{ color: opt.value === value ? 'var(--primary)' : 'var(--text-primary)' }}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <i className="ri-check-line text-[14px]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
