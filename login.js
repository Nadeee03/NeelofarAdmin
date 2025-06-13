// import { supabase } from '../utils/supabaseClient.js';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://cghcstaoyaguvuxkedys.supabase.co', // Replace with your URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaGNzdGFveWFndXZ1eGtlZHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzk5NzgsImV4cCI6MjA2Mjg1NTk3OH0.AjEWl55yzfSpj5nOAWHRHgJvE2RCVhkXeKxCr25w84s'                    // Replace with your anon public key
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
