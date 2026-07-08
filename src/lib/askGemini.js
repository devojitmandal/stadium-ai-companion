/**
 * Interacts with the secure Supabase Edge Function to communicate with Gemini.
 * This acts as the sole AI gateway for the frontend, ensuring the actual 
 * Gemini API key never leaves the server environment.
 *
 * @param {string} prompt - The fully constructed prompt to send to the LLM.
 * @returns {Promise<Object>} The parsed JSON data returned by the AI.
 */
export async function askGemini(prompt) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/ask-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      // Attempt to parse a graceful error message from the Edge Function
      const errorDetails = await response.json().catch(() => ({}));
      throw new Error(errorDetails.error || `Edge Function failed with status ${response.status}`);
    }

    const data = await response.json();

    // --- THE SAFETY NET ---
    // AI models frequently wrap JSON in markdown blocks (```json ... ```).
    // This strips those characters out before attempting to parse, preventing 500 crashes.
    const cleanJsonText = data.text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanJsonText);

  } catch (error) {
    console.error('askGemini Execution Error:', error);
    // Re-throw the error so the UI components (FanView, etc.) can trigger their local error states
    throw error; 
  }
}