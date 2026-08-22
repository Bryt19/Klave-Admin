import { useNavigate } from 'react-router-dom';

const PREMIUM_UNLOCKS = [
  { icon: 'ri-bar-chart-2-line', label: 'Insights Tab', desc: 'Top sellers, slow movers, revenue trends' },
  { icon: 'ri-file-list-3-line', label: 'Full Audit Log', desc: 'Complete history with reversal & reconciliation' },
  { icon: 'ri-team-line', label: 'Unlimited Staff PINs', desc: 'No cap on staff accounts' },
  { icon: 'ri-line-chart-line', label: 'Staff Activity Analytics', desc: 'See who sold what and when' },
  { icon: 'ri-customer-service-2-line', label: 'Priority Support', desc: 'Faster response times from our team' },
  { icon: 'ri-notification-3-line', label: 'Renewal Reminders', desc: 'Never miss a subscription renewal' },
];

interface Props {
  featureName: string;
  onClose: () => void;
}

export default function UpgradeModal({ featureName, onClose }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border-b border-amber-200/50 dark:border-amber-500/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-base"></i>
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500">
              <i className="ri-vip-crown-line text-white text-lg"></i>
            </div>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-body font-medium uppercase tracking-widest">Klave One Feature</p>
              <h2 className="text-base font-heading font-700 text-gray-900 dark:text-white">{featureName} is locked</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
            Subscribe to the Klave One Plan to unlock {featureName} and everything else below.
          </p>
        </div>

        {/* Feature list */}
        <div className="p-5">
          <p className="text-label uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body mb-3">What you unlock with Klave One</p>
          <div className="space-y-3 mb-5">
            {PREMIUM_UNLOCKS.map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 flex-shrink-0">
                  <i className={`${item.icon} text-amber-500 text-sm`}></i>
                </div>
                <div>
                  <p className="text-sm font-body font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 font-body">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-400/30 flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-body mb-0.5">Klave One Plan</p>
              <p className="text-xl font-mono font-700 text-gray-900 dark:text-white">GH₵250<span className="text-sm font-400 text-gray-400">/mo</span></p>
            </div>
            <span className="text-xs font-body text-success-500 bg-success-50 dark:bg-success-500/10 px-2 py-1 rounded-full">14-day free trial</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-btn border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 rounded-btn text-sm font-body cursor-pointer whitespace-nowrap hover:border-gray-400 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => { onClose(); navigate('/signup'); }}
              className="flex-1 h-btn bg-amber-500 hover:bg-amber-600 text-white rounded-btn text-sm font-medium font-body cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-vip-crown-line mr-1.5"></i>
              Subscribe to Klave One
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
