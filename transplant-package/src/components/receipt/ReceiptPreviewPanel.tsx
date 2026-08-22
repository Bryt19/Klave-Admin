import SaleReceipt from './SaleReceipt';
import type { BasketItem } from '@/types';

interface ReceiptPreviewPanelProps {
  pharmacyName: string;
  receiptRef: string;
  date: Date | string | number;
  items: BasketItem[];
  staffName: string;
  notes?: string;
  receiptId?: string;
  onPrint?: () => void;
  showPrintButton?: boolean;
  showHeading?: boolean;
  paymentDetails?: {
    method?: string;
    amountTendered?: number;
    reference?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
  };
}

export default function ReceiptPreviewPanel({
  pharmacyName,
  receiptRef,
  date,
  items,
  staffName,
  notes,
  receiptId,
  onPrint,
  showPrintButton = false,
  showHeading = true,
  paymentDetails,
}: ReceiptPreviewPanelProps) {
  return (
    <div className="space-y-3">
      {showHeading && (
        <h4 className="text-[10px] font-heading font-700 uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Receipt Preview
        </h4>
      )}
      <div className="bg-white dark:bg-surface-dark p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex justify-center">
        <SaleReceipt
          id={receiptId}
          pharmacyName={pharmacyName}
          receiptRef={receiptRef}
          date={date}
          items={items}
          staffName={staffName}
          notes={notes}
          paymentDetails={paymentDetails}
        />
      </div>
      {showPrintButton && onPrint && (
        <button
          type="button"
          onClick={onPrint}
          className="w-full h-9 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-heading font-700 uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm print:hidden"
        >
          <i className="ri-printer-line text-sm" />
          Print Receipt
        </button>
      )}
    </div>
  );
}
