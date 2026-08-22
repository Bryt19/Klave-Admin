import { useState } from 'react';

export default function SettingsAccount() {
  const [name, setName] = useState('Kwame Founder');
  const [email, setEmail] = useState('admin@klavora.io');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="space-y-6">
      
      {/* Profile Section */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-5" style={{ color: 'var(--text-primary)' }}>Profile</h3>
        
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden group cursor-pointer" style={{ background: 'var(--primary)' }}>
            <span className="text-white font-heading font-700 text-2xl">KF</span>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="ri-camera-fill text-white text-xl"></i>
            </div>
          </div>
          <div>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Change Photo
            </button>
            <p className="text-[11px] font-body mt-2" style={{ color: 'var(--text-secondary)' }}>JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone Number (Optional)</label>
            <input type="tel" placeholder="e.g. +233 54 123 4567"
              className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
            <div className="flex gap-3">
              <input value={email} onChange={e => setEmail(e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              {email !== 'admin@klavora.io' && (
                <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Confirm Password"
                  className="w-48 h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-5" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors whitespace-nowrap text-white"
            style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}>
            Save Profile
          </button>
        </div>
      </div>

      {/* Password & Security Section */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Password and Security</h3>
        <p className="text-[12px] font-body mb-5" style={{ color: 'var(--text-secondary)' }}>Last password changed: 4 months ago</p>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-5" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors whitespace-nowrap text-white"
            style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}>
            Update Password
          </button>
        </div>
      </div>

      {/* Session Section */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Active Sessions</h3>
            <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Devices currently logged into your account</p>
          </div>
          <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            Revoke All Other Sessions
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid var(--primary)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <i className="ri-macbook-line text-lg"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-heading font-600 truncate" style={{ color: 'var(--text-primary)' }}>Mac OS 14.2 &middot; Chrome</p>
              <p className="text-[12px] font-body text-slate-500">Accra, Ghana &middot; Active Now</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-heading font-700 px-2 py-0.5 rounded-full bg-primary text-white">Current</span>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800" style={{ color: 'var(--text-secondary)' }}>
              <i className="ri-smartphone-line text-lg"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-heading font-600 truncate" style={{ color: 'var(--text-primary)' }}>iOS 17.1 &middot; Safari</p>
              <p className="text-[12px] font-body text-slate-500">Accra, Ghana &middot; Last active 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
