/* ═══════════════════════════════════════════════
   BARAMASI — site configuration.

   These two values are the ONLY public Supabase settings
   the site needs (there is no server, so nothing secret
   can ever live here). Set once, and the live product
   catalogue, the /admin dashboard and image uploads all
   work from this single file.

   SUPABASE_URL               → project URL
   SUPABASE_PUBLISHABLE_KEY   → the public client key
     (sb_publishable_…, or the legacy "anon" key — either works).

   Where to find them:
     Supabase dashboard → Settings → API (or the Connect dialog).

   The publishable key is safe to ship in the browser / commit
   to git — Supabase's Row Level Security is what protects your
   data, not the key. Never paste a `sb_secret_…` / `service_role`
   key here; those bypass RLS and would be exposed to visitors.
   ═══════════════════════════════════════════════ */

export const SUPABASE_URL = 'https://oefosgzdizwbxmutyfia.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3D2Wx1unbbzZC5XtYFCJSg_Y3sy7W93';

/* helper: is a real project configured? */
export const SUPABASE_CONFIGURED =
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('YOUR-PROJECT') &&
  !!SUPABASE_PUBLISHABLE_KEY &&
  !SUPABASE_PUBLISHABLE_KEY.includes('YOUR-');
