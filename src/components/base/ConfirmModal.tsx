import { useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  requireReason?: boolean;
  reasonLabel?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  requireReason = false,
  reasonLabel = 'Reason',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const variantClass = {
    danger: 'bg-danger hover:bg-danger/90 text-white',
    warning: 'bg-warning hover:bg-warning/90 text-white',
    primary: 'bg-primary hover:bg-primary/90 text-white',
  }[confirmVariant];

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    onConfirm(reason || undefined);
    setStep(1);
    setReason('');
  };

  const handleCancel = () => {
    setStep(1);
    setReason('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
      <div
        className="relative w-full max-w-md rounded-xl p-6 shadow-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            confirmVariant === 'danger' ? 'bg-danger/10' : confirmVariant === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
          }`}>
            <i className={`text-lg ${
              confirmVariant === 'danger' ? 'ri-error-warning-line text-danger' :
              confirmVariant === 'warning' ? 'ri-alert-line text-warning' :
              'ri-information-line text-primary'
            }`} />
          </div>
          <div>
            <h3 className="font-heading font-600 text-[15px]" style={{ color: 'var(--text-primary)' }}>
              {step === 1 ? title : 'Are you absolutely sure?'}
            </h3>
            <p className="text-[13px] mt-1 font-body" style={{ color: 'var(--text-secondary)' }}>
              {step === 1 ? description : 'This action cannot be undone. Please confirm once more.'}
            </p>
          </div>
        </div>

        {step === 2 && requireReason && (
          <div className="mb-4">
            <label className="block text-[11px] uppercase tracking-wide font-body font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {reasonLabel} <span className="text-danger">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Enter reason..."
              className="w-full rounded-lg px-3 py-2 text-[13px] font-body resize-none outline-none focus:ring-1 focus:ring-primary"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="h-9 px-4 rounded-lg text-[13px] font-medium font-body cursor-pointer transition-colors whitespace-nowrap"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              background: 'transparent',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={step === 2 && requireReason && !reason.trim()}
            className={`h-9 px-4 rounded-lg text-[13px] font-medium font-body cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${variantClass}`}
          >
            {step === 1 ? 'Continue' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
