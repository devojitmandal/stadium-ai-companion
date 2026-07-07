// src/lib/askGemini.js
//
// Calls your Supabase Edge Function instead of Gemini directly.
// This is the ONLY place in the frontend that talks to the AI backend now —
// no API key lives here, because the key never leaves the server.

import { supabase } from './supabase';

export async function askGemini(prompt) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const response = await fetch(`${supabaseUrl}/functions/v1/ask-gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Supabase anon key is fine to expose — see FanView/VolunteerView/OrganizerView notes.
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.text); // same shape you were getting from response.text before
}
