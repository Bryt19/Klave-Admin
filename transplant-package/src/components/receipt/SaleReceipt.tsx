import type { BasketItem } from '@/types';
import { formatTxId } from '@/utils/formatters';

interface SaleReceiptProps {
  pharmacyName: string;
  receiptRef: string;
  date: Date | string | number;
  items: BasketItem[];
  staffName: string;
  notes?: string;
  id?: string;
  className?: string;
  paymentDetails?: {
    method?: string;
    amountTendered?: number;
    reference?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
  };
}

function DashedRule({ className = '' }: { className?: string }) {
  return <div className={`receipt-rule border-t border-dashed border-slate-300 ${className}`} />;
}

function ReceiptRow({
  label,
  value,
  mono = false,
  bold = false,
  title,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
  title?: string;
}) {
  return (
    <div className="receipt-row flex justify-between items-baseline gap-3 py-[3px]" title={title}>
      <span className="receipt-label text-[10px] font-heading font-600 uppercase tracking-wide text-slate-500 shrink-0">
        {label}
      </span>
      <span
        className={`receipt-value text-[10px] text-slate-900 text-right break-all leading-snug ${
          mono ? 'font-mono' : 'font-body'
        } ${bold ? 'font-heading font-700 text-[11px] text-primary-900' : 'font-medium'}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatReceiptDate(date: Date | string | number) {
  const d = new Date(date);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatCurrency(amount: number) {
  return `GHC ${amount.toFixed(2)}`;
}

export default function SaleReceipt({
  pharmacyName,
  receiptRef,
  date,
  items,
  staffName,
  notes,
  id,
  className = '',
  paymentDetails,
}: SaleReceiptProps) {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div
      id={id}
      className={`receipt-root mx-auto w-full max-w-[340px] bg-white font-body ${className}`}
    >
      {/* ── Header ── */}
      <div className="receipt-header px-6 pt-6 pb-4 text-center">
        <p className="receipt-type text-[9px] font-heading font-600 uppercase tracking-[0.2em] text-slate-400 mb-2">
          Pharmacy Sale Receipt
        </p>
        <h2 className="receipt-pharmacy text-base font-heading font-800 text-slate-900 uppercase tracking-wide leading-tight">
          {pharmacyName}
        </h2>

        <DashedRule className="my-4" />

        <div className="flex flex-col items-center gap-1.5">
          <div className="receipt-check w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
            <i className="ri-check-line text-xs text-white" />
          </div>
          <p className="receipt-status text-[10px] font-heading font-700 uppercase tracking-[0.15em] text-emerald-700">
            Sale Complete
          </p>
          <p className="receipt-substatus text-[9px] text-slate-400">
            Transaction recorded successfully
          </p>
        </div>
      </div>

      <DashedRule />

      {/* ── Body ── */}
      <div className="receipt-body relative px-6 py-4">
        <div
          className="receipt-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-[3.5rem] font-heading font-900 uppercase tracking-[0.22em] text-slate-300/10 rotate-[-32deg] whitespace-nowrap">
            Klavora
          </span>
        </div>

        <div className="relative z-10">
          {/* Header Data */}
          <div className="receipt-meta">
            <ReceiptRow label="Receipt No." value={formatTxId(receiptRef)} mono title={receiptRef} />
            <ReceiptRow label="Date" value={formatReceiptDate(date)} mono />
            <ReceiptRow 
              label="Payment" 
              value={paymentDetails?.method ? (paymentDetails.method === 'momo' ? 'Mobile Money' : paymentDetails.method.charAt(0).toUpperCase() + paymentDetails.method.slice(1)) : 'Cash'} 
            />
          </div>

          <DashedRule className="mb-3" />

          {/* Dispensed items */}
          <div className="receipt-items">
            {items.map((item, idx) => (
              <div
                key={`${item.drug_id}-${item.batch_id}-${idx}`}
                className={idx > 0 ? 'pt-3 mt-3 border-t border-dashed border-slate-200' : ''}
              >
                <ReceiptRow label="Medicine" value={item.drug_name} />
                <ReceiptRow label="Exp. Date" value={item.expiry_date} mono />
                <ReceiptRow label="Qty" value={String(item.quantity)} mono />
                <ReceiptRow label="Unit Price" value={formatCurrency(item.unit_price)} mono />
                {items.length > 1 && (
                  <ReceiptRow label="Subtotal" value={formatCurrency(item.subtotal)} mono />
                )}
              </div>
            ))}
          </div>

          <DashedRule className="my-3" />

          {/* Totals */}
          <div className="receipt-summary">
            <ReceiptRow label="Total Due" value={formatCurrency(total)} mono bold />
            {paymentDetails?.method === 'cash' && paymentDetails?.amountTendered !== undefined && (
              <>
                <ReceiptRow label="Amt Tendered" value={formatCurrency(paymentDetails.amountTendered)} mono />
                <ReceiptRow label="Change Due" value={formatCurrency(Math.max(0, paymentDetails.amountTendered - total))} mono />
              </>
            )}
            {paymentDetails?.method === 'momo' && paymentDetails?.reference && (
              <ReceiptRow label="MoMo Ref" value={paymentDetails.reference} mono />
            )}
            {paymentDetails?.method === 'card' && paymentDetails?.reference && (
              <ReceiptRow label="Card Ref" value={paymentDetails.reference} mono />
            )}
            {paymentDetails?.method === 'insurance' && (
              <>
                {paymentDetails?.insuranceProvider && <ReceiptRow label="Ins. Provider" value={paymentDetails.insuranceProvider} />}
                {paymentDetails?.insuranceNumber && <ReceiptRow label="Ins. Number" value={paymentDetails.insuranceNumber} mono />}
              </>
            )}
            <ReceiptRow label="Dispensed By" value={staffName} />
            {notes && <ReceiptRow label="Notes" value={notes} />}
          </div>
        </div>
      </div>

      <DashedRule />

      {/* ── Footer ── */}
      <div className="receipt-footer px-6 py-4 text-center space-y-2">
        <p className="text-[9px] font-heading font-600 text-slate-600 tracking-wide">
          Thank you for your patronage.
        </p>
        <p className="text-[8px] text-slate-400 leading-relaxed">
          Please retain this receipt for your records.
        </p>
        <p className="text-[8px] text-slate-300 pt-1">
          Managed by Klavora Pharmacy Inventory Management
        </p>
      </div>
    </div>
  );
}
