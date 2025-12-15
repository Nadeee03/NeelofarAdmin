// import { supabase } from '../utils/supabaseClient.js';

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://cghcstaoyaguvuxkedys.supabase.co', // Replace with your URL
  'sb_publishable_ndl3AMemUASbTUt1WCAD3w_gC9iBiOj'                    // Replace with your anon public key
);

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    errorMsg.textContent = 'Login failed: ' + error.message;
  } else {
    errorMsg.textContent = '';
    // Redirect to dashboard
    window.location.href = './dashboard.html';
  }
});
