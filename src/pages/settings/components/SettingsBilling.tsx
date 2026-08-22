import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SettingsBilling() {
  const [testMode, setTestMode] = useState(true);
  
  const [publicKey, setPublicKey] = useState('pk_test_a1b2c3d4e5f6g7h8i9j0');
  const [secretKey, setSecretKey] = useState('sk_test_1234567890abcdef');
  const [revealSecret, setRevealSecret] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Revenue Overview */}
      <div className="rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-heading font-700 mb-1" style={{ color: 'var(--text-secondary)' }}>Current MRR</p>
            <p className="text-[20px] font-mono font-700" style={{ color: 'var(--text-primary)' }}>GH₵ 12,450.00</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-heading font-700 mb-1" style={{ color: 'var(--text-secondary)' }}>Revenue This Month</p>
            <p className="text-[20px] font-mono font-700" style={{ color: 'var(--text-primary)' }}>GH₵ 8,750.00</p>
          </div>
        </div>
        <Link to="/" className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors flex items-center justify-center"
          style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          View Full Metrics <i className="ri-arrow-right-line ml-2"></i>
        </Link>
      </div>

      {/* Paystack Configuration */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Paystack Configuration</h3>
            <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Manage your API keys for subscription billing</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] font-body font-medium" style={{ color: testMode ? 'var(--warning)' : 'var(--success)' }}>
              {testMode ? 'Test Mode' : 'Live Mode'}
            </span>
            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)}
                className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                style={{ right: testMode ? '0' : '1.25rem', borderColor: testMode ? 'var(--warning)' : 'var(--success)' }} />
              <label className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
                style={{ background: testMode ? 'var(--warning)' : 'var(--success)' }}></label>
            </div>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Paystack Public Key</label>
            <input type="password" value={publicKey} onChange={e => setPublicKey(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5 flex justify-between" style={{ color: 'var(--text-secondary)' }}>
              <span>Paystack Secret Key</span>
              <button onClick={() => setRevealSecret(!revealSecret)} className="text-primary hover:underline font-body lowercase tracking-normal">
                {revealSecret ? 'Hide' : 'Reveal'}
              </button>
            </label>
            <input type={revealSecret ? "text" : "password"} value={secretKey} onChange={e => setSecretKey(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <p className="text-[11px] font-body mt-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <i className="ri-lock-line"></i> Requires password confirmation to edit
            </p>
          </div>

          <div className="pt-2">
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Webhook URL</label>
            <div className="flex gap-2">
              <input type="text" value="https://api.klavora.com/webhooks/paystack" readOnly
                className="flex-1 h-10 px-3 rounded-lg text-[13px] font-mono outline-none opacity-80 cursor-not-allowed"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }} />
              <button className="h-10 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shrink-0"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onClick={() => navigator.clipboard.writeText('https://api.klavora.com/webhooks/paystack')}>
                Copy
              </button>
            </div>
            <p className="text-[11px] font-body mt-2" style={{ color: 'var(--text-secondary)' }}>
              Add this URL to your Paystack dashboard to receive subscription events.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-5" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors whitespace-nowrap text-white"
            style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}>
            Save API Keys
          </button>
        </div>
      </div>

    </div>
  );
}
