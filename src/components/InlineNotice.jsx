// src/components/InlineNotice.jsx
//
// Shared banner used across FanView and OrganizerView for errors, broadcast
// messages, and status updates. Previously duplicated with a nearly
// identical toneClasses object in both files — now one definition, used
// everywhere, so a style change only needs to happen in one place.

import { X } from 'lucide-react';

const TONE_CLASSES = {
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  red: 'bg-red-500/10 border-red-500/30 text-red-400',
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
};

export default function InlineNotice({ tone = 'amber', onDismiss, children }) {
  return (
    <div
      role="alert"
      className={`${TONE_CLASSES[tone]} backdrop-blur-md border p-4 rounded-xl text-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg`}
    >
      <div className="flex-1 mt-0.5 leading-relaxed">{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}