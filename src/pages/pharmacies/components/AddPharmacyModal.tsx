import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddPharmacyModal({ isOpen, onClose, onSubmit }: Props) {
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [password, setPassword] = useState('');
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ ownerName, ownerEmail, pharmacyName, password: autoGeneratePassword ? undefined : password });
    setOwnerName(''); setOwnerEmail(''); setPharmacyName(''); setPassword(''); setAutoGeneratePassword(true);
  };

  const isFormValid = ownerName.trim() && ownerEmail.trim() && pharmacyName.trim() && (autoGeneratePassword || password.trim());

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="w-full max-w-[480px] rounded-2xl shadow-2xl flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="p-6 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-[18px] font-heading font-700" style={{ color: 'var(--text-primary)' }}>
              Manually Add Pharmacy
            </h2>
            <p className="text-[13px] mt-1 font-body leading-snug" style={{ color: 'var(--text-secondary)' }}>
              Bypass standard registration to instantly create a pharmacy with a 30-day trial.
            </p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Pharmacy Name
              </label>
              <input value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} placeholder="e.g. HealthPlus Pharmacy"
                className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Owner Name</label>
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Kwame Mensah"
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Owner Email</label>
                <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="kwame@example.com"
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <div>
                  <p className="text-[13px] font-heading font-600" style={{ color: 'var(--text-primary)' }}>Auto-Generate Password</p>
                  <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>Send login details via email</p>
                </div>
                <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" checked={autoGeneratePassword} onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                    className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    style={{ right: autoGeneratePassword ? '0' : '1.25rem', borderColor: autoGeneratePassword ? 'var(--primary)' : 'var(--border)' }} />
                  <label className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
                    style={{ background: autoGeneratePassword ? 'var(--primary)' : 'var(--bg)' }}></label>
                </div>
              </label>

              {!autoGeneratePassword && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Custom Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters"
                    className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex gap-3 mt-2">
            <button onClick={onClose}
              className="flex-1 h-10 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!isFormValid}
              className="flex-1 h-10 rounded-lg text-[13px] font-body font-medium transition-colors text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}>
              <i className="ri-building-4-line"></i> Create Pharmacy
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
