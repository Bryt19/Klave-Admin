export const printHtml = (htmlContent: string) => {
  // Check if iframe already exists
  let iframe = document.getElementById(
    "klavora-print-iframe",
  ) as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "klavora-print-iframe";
    // Use off-screen absolute positioning with non-zero size to prevent browsers from optimizing it out
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "600px";
    iframe.style.height = "600px";
    iframe.style.border = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    console.error("Could not access print iframe document");
    return;
  }

  // Clear previous iframe content and force light mode configuration
  doc.open();
  doc.write(
    '<!DOCTYPE html><html><head><title>Klavora Receipt</title><meta name="color-scheme" content="light"></head><body></body></html>',
  );
  doc.close();

  // Copy style links and style elements from parent to iframe to preserve Tailwind styles
  const styles = document.querySelectorAll('link[rel="stylesheet"], style');
  let loadedCount = 0;
  let totalLinks = 0;
  let fired = false;

  const triggerPrint = () => {
    if (!fired) {
      fired = true;
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    }
  };

  styles.forEach((styleNode) => {
    const clone = styleNode.cloneNode(true);
    if (clone.nodeName === "LINK") {
      totalLinks++;
      (clone as HTMLLinkElement).onload = () => {
        loadedCount++;
        if (loadedCount >= totalLinks) {
          triggerPrint();
        }
      };
      (clone as HTMLLinkElement).onerror = () => {
        loadedCount++;
        if (loadedCount >= totalLinks) {
          triggerPrint();
        }
      };
    }
    doc.head.appendChild(clone);
  });

  // Add custom print overrides (force light mode, monospace base, exact print adjust)
  const overrideStyle = doc.createElement("style");
  overrideStyle.textContent = `
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-scheme: light !important;
        /* Force visibility: visible to override index.css global hide rules */
        visibility: visible !important;
      }
      body * {
        visibility: visible !important;
      }
      @page {
        size: auto;
        margin: 5mm;
      }
      body {
        margin: 0px !important;
        padding: 5px !important;
      }
      /* Hide elements with print:hidden explicitly */
      .print\\:hidden, [class*="print:hidden"] {
        display: none !important;
        visibility: hidden !important;
      }
    }
    
    html, body, #klavora-receipt-print, #printable-receipt, #print-receipt, .receipt-root {
      background-color: #ffffff !important;
    }

    html, body {
      font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif !important;
    }

    #print-receipt {
      display: flex !important;
      justify-content: center !important;
      padding: 12px !important;
    }

    .receipt-root {
      max-width: 340px !important;
      width: 100% !important;
      margin: 0 auto !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background-color: #ffffff !important;
      font-family: 'Inter', system-ui, sans-serif !important;
    }

    .receipt-root * {
      box-shadow: none !important;
      text-shadow: none !important;
    }

    .receipt-header {
      text-align: center !important;
      padding: 24px 24px 16px !important;
    }

    .receipt-type {
      color: #94a3b8 !important;
      font-size: 9px !important;
      letter-spacing: 0.2em !important;
      text-transform: uppercase !important;
    }

    .receipt-pharmacy {
      color: #0f172a !important;
      font-size: 16px !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.04em !important;
    }

    .receipt-status {
      color: #047857 !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      letter-spacing: 0.15em !important;
      text-transform: uppercase !important;
    }

    .receipt-substatus {
      color: #94a3b8 !important;
      font-size: 9px !important;
    }

    .receipt-rule {
      border-top: 1px dashed #cbd5e1 !important;
    }

    .receipt-body {
      position: relative !important;
      padding: 16px 24px !important;
    }

    .receipt-label {
      color: #64748b !important;
      font-weight: 600 !important;
      font-size: 10px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.04em !important;
    }

    .receipt-value {
      color: #0f172a !important;
      font-size: 10px !important;
      text-align: right !important;
    }

    .receipt-check {
      background-color: #059669 !important;
      border-radius: 9999px !important;
      width: 28px !important;
      height: 28px !important;
    }

    .receipt-check i {
      color: #ffffff !important;
    }

    .receipt-watermark {
      position: absolute !important;
      inset: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }

    .receipt-watermark span {
      color: rgba(203, 213, 225, 0.1) !important;
      font-size: 3.5rem !important;
      font-weight: 900 !important;
      letter-spacing: 0.22em !important;
      transform: rotate(-32deg) !important;
      text-transform: uppercase !important;
      white-space: nowrap !important;
    }

    .receipt-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: baseline !important;
      gap: 0.75rem !important;
      padding: 3px 0 !important;
    }

    .receipt-footer {
      padding: 16px 24px !important;
      text-align: center !important;
    }

    .receipt-footer p:nth-child(1) {
      color: #475569 !important;
      font-size: 9px !important;
      font-weight: 600 !important;
    }

    .receipt-footer p:nth-child(2) {
      color: #94a3b8 !important;
      font-size: 8px !important;
    }

    .receipt-footer p:nth-child(3) {
      color: #cbd5e1 !important;
      font-size: 8px !important;
    }
  `;
  doc.head.appendChild(overrideStyle);

  // Set the content (wrapped in #print-receipt to match index.css whitelist rules)
  doc.body.innerHTML = `<div id="print-receipt" class="w-full flex flex-col">${htmlContent}</div>`;

  // Trigger print after styles load or fallback timers
  if (totalLinks === 0) {
    setTimeout(triggerPrint, 100);
  } else {
    // Safety fallback trigger
    setTimeout(triggerPrint, 1200);
  }
};
