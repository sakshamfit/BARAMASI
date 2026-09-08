/* ═══════════════════════════════════════════════
   brand — contact channels shared across the site.
   Single source of truth for the WhatsApp ordering
   line. Update the number once here and every
   surface (product · cart · checkout · contact)
   follows.
   ═══════════════════════════════════════════════ */

/* WhatsApp, digits only (international format, no +, spaces or dashes) */
export const WHATSAPP_NUMBER = '916204393039';

/* human-facing display form */
export const WHATSAPP_DISPLAY = '+91 62043 93039';

/* build a wa.me deep link with a prefilled message */
export function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* default opener — "Hi BARAMASI!" with an optional message */
export function openWhatsApp(text) {
  const url = waLink(text);
  /* same-gesture open so the browser doesn't block the new tab */
  window.open(url, '_blank', 'noopener');
}

/* prefilled enquiries used across surfaces */
export const WA_GREETING = 'Hi BARAMASI! 🙏';
