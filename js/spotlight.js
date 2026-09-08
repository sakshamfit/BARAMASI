/* ═══════════════════════════════════════════════
   spotlight — the shared editorial focus system.
   .is-hot   = pointer/keyboard preview
   .is-active = chosen card
   container.has-spotlight quiets the siblings.
   Styling lives in each section's CSS; this only
   conducts the state.
   ═══════════════════════════════════════════════ */

export function createSpotlight(container, cards, onChange) {
  let hot = null;
  let active = null;
  let armed = false;

  function paint() {
    cards.forEach((c, i) => {
      c.classList.toggle('is-active', i === active);
      c.classList.toggle('is-hot', i === hot && i !== active);
    });
    container.classList.toggle('has-spotlight', active !== null || hot !== null);
    if (onChange) onChange({ hot, active });
  }

  cards.forEach((card, i) => {
    /* a card that represents a collection IS the link — tapping anywhere
       on it navigates (inner links keep their own destinations); hover
       remains the preview. Cards without a destination keep the old
       tap-to-select behaviour. */
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (card.dataset.href) { window.location.href = card.dataset.href; return; }
      if (!armed) return;
      active = active === i ? null : i;   /* re-tap gently releases */
      paint();
    });
    card.addEventListener('focusin', () => {
      if (!armed) return;
      hot = i; paint();
    });
    card.addEventListener('focusout', () => {
      if (hot === i) { hot = null; paint(); }
    });
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        e.preventDefault();
        if (card.dataset.href) { window.location.href = card.dataset.href; return; }
        if (!armed) return;
        active = active === i ? null : i;
        paint();
      }
    });
  });

  if (window.matchMedia('(hover: hover)').matches) {
    cards.forEach((card, i) => {
      card.addEventListener('pointerenter', () => {
        if (!armed) return;
        hot = i; paint();
      });
      card.addEventListener('pointerleave', () => {
        if (hot === i) { hot = null; paint(); }
      });
    });
  }

  return {
    arm() { armed = true; },
    setActive(i) {
      if (!armed) return;
      active = i;
      paint();
    },
    get active() { return active; },
  };
}
