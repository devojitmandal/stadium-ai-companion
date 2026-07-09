// src/lib/constants.js
//
// Centralized magic strings/numbers used across multiple views. Keeping
// these in one place means a typo becomes an import error instead of a
// silently broken query, and a value only needs updating in one spot.

export const TABLES = {
    STADIUM_STATE: 'stadium_state',
    INCIDENTS: 'incidents',
    NOTIFICATIONS: 'notifications',
  };
  
  export const INCIDENT_STATUS = {
    OPEN: 'open',
    RESOLVED: 'resolved',
  };
  
  export const CONGESTION_THRESHOLDS = {
    CRITICAL_PCT: 75,
    WARNING_PCT: 40,
  };
  
  export const POLL_INTERVALS_MS = {
    DEFAULT: 5000,
  };
  
  export const NOTIFICATION_DISPLAY_LIMIT = 3;