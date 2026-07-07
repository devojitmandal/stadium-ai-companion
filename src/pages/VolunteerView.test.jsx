import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VolunteerView from './VolunteerView';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  },
}));

vi.mock('../lib/askGemini', () => ({
  askGemini: vi.fn(),
}));

import { askGemini } from '../lib/askGemini';

describe('VolunteerView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the phrasebook heading', async () => {
    render(<VolunteerView />);
    expect(await screen.findByText(/Instant Phrasebook Generator/i)).toBeInTheDocument();
  });

  it('shows generated phrases after clicking generate', async () => {
    askGemini.mockResolvedValue({
      phrases: [{ english: 'Hello', translated: 'Hola', phonetic: 'OH-lah' }],
      cultural_tip: 'Be warm and direct.',
    });

    render(<VolunteerView />);
    fireEvent.click(screen.getByRole('button', { name: /Generate Translation Cards/i }));

    expect(await screen.findByText('Hola')).toBeInTheDocument();
    expect(await screen.findByText('Be warm and direct.')).toBeInTheDocument();
  });

  it('shows inline error instead of alert on failure', async () => {
    askGemini.mockRejectedValue(new Error('fail'));
    render(<VolunteerView />);

    fireEvent.click(screen.getByRole('button', { name: /Generate Translation Cards/i }));

    expect(await screen.findByText(/Couldn't reach AI/i)).toBeInTheDocument();
  });
});