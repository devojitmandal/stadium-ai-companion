// src/lib/prompts.js
//
// Pure functions that build AI prompts. Kept separate from components so
// they can be unit-tested directly (no rendering, no mocking React) and
// reused if other views ever need similar prompts.

/**
 * Shared safety instructions injected into every prompt to guarantee
 * the LLM returns raw JSON that won't crash JSON.parse().
 */
const STRICT_JSON_RULES = `
  Return strict, raw JSON ONLY. 
  Do NOT wrap the response in markdown blocks (do NOT use \`\`\`json). 
  Return ONLY the requested JSON structure with no other text.
`;

/**
 * Builds the prompt for the Fan View queue prediction feature.
 */
export function buildQueuePredictionPrompt({ gateId, gate, waitTime, needsAccessibility }) {
  const congestion = gate?.congestion_pct ?? 'unknown';
  const queueTime = gate?.queue_time_min ?? 'unknown';
  const history = JSON.stringify(gate?.history ?? []);

  const accessibilityClause = needsAccessibility
    ? 'IMPORTANT CONSTRAINT: This fan requires wheelchair-accessible routing. Avoid stairs and escalators, prioritize elevators and ramps, and explicitly mention estimated extra transit time if the accessible route is longer.'
    : '';

  return `
    You are a stadium queue predictor.
    Current Gate: ${gateId}
    Current Congestion: ${congestion}%
    Current Queue Time: ${queueTime} mins
    Recent History: ${history}

    The fan is deciding: leave their seat for food NOW, or wait ${waitTime} minutes.
    Predict the expected queue time in both cases based on the congestion trend.

    ${accessibilityClause}

    Return strict JSON in this exact format:
    { "now_wait": [number], "later_wait": [number], "recommendation": "[1-2 sentence explanation]" }

    ${STRICT_JSON_RULES}
  `.trim();
}

/**
 * Builds the prompt for contextual transit and sustainability info.
 */
export function buildGateInfoPrompt({ context }) {
  return `
    You are a stadium fan assistant. Gate context: ${JSON.stringify(context ?? {})}

    Based on this, write:
    1. A short, friendly sustainability tip (mention the nearest recycling point if available)
    2. A short transportation status update (metro/parking) in plain language

    Return strict JSON in this exact format:
    { "sustainability_tip": "...", "transport_status": "..." }

    ${STRICT_JSON_RULES}
  `.trim();
}

/**
 * Builds the prompt for the personalized matchday recap.
 */
export function buildRecapPrompt({ sessionStats, gateId, needsAccessibility }) {
  return `
    You are writing a fun, personalized "matchday recap" for a fan leaving the stadium after the FIFA World Cup 2026 match.
    Their session activity: ${JSON.stringify(sessionStats)}
    Gate they used: ${gateId}
    Accessibility mode used: ${needsAccessibility}

    Write a warm, 3-4 sentence recap of their matchday experience, referencing their activity naturally
    (e.g. how many times they checked queue times, whether they got any live alerts).
    Include one lighthearted "fun stat" line.

    Return strict JSON in this exact format:
    { "recap_text": "...", "fun_stat": "..." }

    ${STRICT_JSON_RULES}
  `.trim();
}

/**
 * Builds the prompt for the Organizer View spike analysis feature.
 */
export function buildSpikeAnalysisPrompt({ gate, allGates }) {
  return `
    You are a senior stadium operations analyst for the FIFA World Cup 2026.
    Here is the current operational snapshot of all stadium gates: ${JSON.stringify(allGates)}

    Gate ${gate.gate_id} has breached safe operating margins with ${gate.congestion_pct}% congestion and a ${gate.queue_time_min} minute wait time.
    Sensor Contextual Factors: ${JSON.stringify(gate.context)}

    Provide a 2-3 sentence causal explanation of why this specific bottleneck happened, linking the context variables logically.
    Then, provide exactly 1 short, actionable recommendation for command staff.

    Return strict JSON in this exact format:
    { "explanation": "...", "recommendation": "..." }

    ${STRICT_JSON_RULES}
  `.trim();
}

/**
 * Builds the prompt for the Volunteer View instant phrasebook generator.
 */
export function buildPhrasebookPrompt({ language, situation }) {
  return `
    You are helping a stadium volunteer communicate with a fan who speaks ${language}.
    Situation: ${situation}.
    Generate 5 short phrases the volunteer can read aloud or show on screen:
    - Original English phrase
    - ${language} translation
    - Phonetic pronunciation guide
    Also include 1 short, respectful cultural tip for interacting with people from this culture.

    Return strict JSON in this exact format:
    {
      "phrases": [ {"english": "...", "translated": "...", "phonetic": "..."} ],
      "cultural_tip": "..."
    }

    ${STRICT_JSON_RULES}
  `.trim();
}