import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddStaffModal({ isOpen, onClose, onSubmit }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Super Admin'>('Admin');
  const [generatePassword, setGeneratePassword] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ firstName, lastName, email, role, generatePassword });
    // Reset form
    setFirstName(''); setLastName(''); setEmail(''); setRole('Admin'); setGeneratePassword(true);
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim();

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
              Add Internal Staff
            </h2>
            <p className="text-[13px] mt-1 font-body" style={{ color: 'var(--text-secondary)' }}>
              Invite a new team member to the Klavora platform.
            </p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-heading font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  First Name
                </label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Ama"
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-heading font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Last Name
                </label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Owusu"
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-heading font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ama@klavora.com"
                className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-heading font-600 mb-2" style={{ color: 'var(--text-secondary)' }}>
                Role & Permissions
              </label>
              <div className="space-y-3">
                {/* Admin Role Card */}
                <label 
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${role === 'Admin' ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <div className="pt-0.5">
                    <input 
                      type="radio" 
                      name="role" 
                      value="Admin" 
                      checked={role === 'Admin'} 
                      onChange={() => setRole('Admin')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-heading font-600" style={{ color: 'var(--text-primary)' }}>Admin</p>
                    <p className="text-[12px] mt-0.5 font-body leading-snug" style={{ color: 'var(--text-secondary)' }}>Client management, pharmacy support, and basic configuration.</p>
                  </div>
                </label>

                {/* Super Admin Role Card */}
                <label 
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${role === 'Super Admin' ? 'border-purple-500 bg-purple-500/5' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <div className="pt-0.5">
                    <input 
                      type="radio" 
                      name="role" 
                      value="Super Admin" 
                      checked={role === 'Super Admin'} 
                      onChange={() => setRole('Super Admin')}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-600 border-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-heading font-600" style={{ color: 'var(--text-primary)' }}>Super Admin</p>
                    <p className="text-[12px] mt-0.5 font-body leading-snug" style={{ color: 'var(--text-secondary)' }}>Full platform access including global billing, pricing, and system settings.</p>
                    {role === 'Super Admin' && (
                      <p className="text-[11px] font-body mt-2 flex items-center gap-1.5" style={{ color: 'var(--warning)' }}>
                        <i className="ri-error-warning-line"></i> Warning: Grants destructive platform privileges.
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Password Toggle */}
            <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-[13px] font-heading font-600" style={{ color: 'var(--text-primary)' }}>Generate Temporary Password</p>
                  <p className="text-[11px] font-body mt-0.5" style={{ color: 'var(--text-secondary)' }}>An invite link will be sent to their email.</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="toggle" 
                    checked={generatePassword}
                    onChange={(e) => setGeneratePassword(e.target.checked)}
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    style={{ right: generatePassword ? '0' : '1.25rem', borderColor: generatePassword ? 'var(--primary)' : 'var(--border)' }}
                  />
                  <label 
                    className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
                    style={{ background: generatePassword ? 'var(--primary)' : 'var(--bg)' }}
                  ></label>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex gap-3 mt-2">
            <button 
              onClick={onClose}
              className="flex-1 h-10 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="flex-1 h-10 rounded-lg text-[13px] font-body font-medium transition-colors text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}
            >
              <i className="ri-mail-send-line"></i> Send Invite
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
