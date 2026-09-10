/* ═══════════════════════════════════════════════
   BARAMASI — /admin sign-in.
   Email + password via Supabase Auth (the admin's
   account). Row Level Security does the rest: once
   signed in, /admin can create/edit/delete products.
   ═══════════════════════════════════════════════ */

import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_CONFIGURED } from './config.js';

const form = document.getElementById('authForm');
const email = document.getElementById('email');
const password = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const status = document.getElementById('status');
const title = document.getElementById('authTitle');
const sub = document.getElementById('authSub');
const switchText = document.getElementById('switchText');
const switchBtn = document.getElementById('switchBtn');

let mode = 'signin';   /* 'signin' | 'signup' */

function setStatus(msg, ok = false) {
  status.textContent = msg;
  status.className = 'adm-status ' + (ok ? 'ok' : 'err');
}

function setMode(next) {
  mode = next;
  if (mode === 'signup') {
    title.textContent = 'Create the admin account';
    sub.textContent = 'Set your email and a password, then confirm via the email Supabase sends.';
    switchText.textContent = 'Already have an account?';
    switchBtn.textContent = 'Sign in instead';
    submitBtn.textContent = 'Create account';
  } else {
    title.textContent = 'Sign in';
    sub.textContent = 'Enter your admin email and password.';
    switchText.textContent = 'No account yet?';
    switchBtn.textContent = 'Create the admin account';
    submitBtn.textContent = 'Sign in';
  }
}

async function getClient() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

async function boot() {
  if (!SUPABASE_CONFIGURED) {
    setStatus('Supabase is not configured yet — set js/config.js first (see README).');
    submitBtn.disabled = true;
    switchBtn.disabled = true;
    return;
  }
  try {
    const supabase = await getClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) location.replace('index.html');
  } catch (e) {
    setStatus('Could not reach Supabase: ' + (e.message || e));
  }
}

switchBtn.addEventListener('click', () => setMode(mode === 'signin' ? 'signup' : 'signin'));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setStatus('');
  submitBtn.disabled = true;

  if (!email.value || !password.value) {
    setStatus('Please enter both email and password.');
    submitBtn.disabled = false;
    return;
  }

  try {
    const supabase = await getClient();
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;
      if (data.session) {
        location.replace('index.html');
        return;
      }
      setStatus('Account created — check your email to confirm, then sign in.', true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;
      location.replace('index.html');
    }
  } catch (err) {
    setStatus(err.message || 'Something went wrong.');
  } finally {
    submitBtn.disabled = false;
  }
});

boot();
