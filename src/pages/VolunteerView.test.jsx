import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VolunteerView from './VolunteerView';
import { askGemini } from '../lib/askGemini';

// vi.mock factories are hoisted above all other top-level code, so the
// shared mock factory is imported dynamically inside the factory itself.
// Using the shared factory (instead of a hand-rolled inline mock) means
// this automatically gets .channel()/.removeChannel() support, which
// VolunteerView now needs for its Realtime incidents subscription.
vi.mock('../lib/supabase', async () => {
  const { createSupabaseMock } = await import('../test/mocks/supabase');
  return {
    supabase: createSupabaseMock({
      incidents: { data: [], error: null },
    }),
  };
});

vi.mock('../lib/askGemini', () => ({
  askGemini: vi.fn(),
}));

describe('VolunteerView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the phrasebook heading', async () => {
    render(<VolunteerView />);
    expect(await screen.findByText(/Instant Phrasebook/i)).toBeInTheDocument();
  });

  it('displays generated phrases and cultural tip after a successful generation', async () => {
    askGemini.mockResolvedValue({
      phrases: [{ english: 'Hello', translated: 'Hola', phonetic: 'OH-lah' }],
      cultural_tip: 'Be warm and direct.',
    });

    render(<VolunteerView />);
    fireEvent.click(await screen.findByRole('button', { name: /Generate Translation Cards/i }));

    expect(await screen.findByText('Hola')).toBeInTheDocument();
    expect(await screen.findByText('Be warm and direct.')).toBeInTheDocument();
  });

  it('shows an inline error message if generation fails (never a browser alert)', async () => {
    askGemini.mockRejectedValue(new Error('API failure'));

    render(<VolunteerView />);
    fireEvent.click(await screen.findByRole('button', { name: /Generate Translation Cards/i }));

    expect(await screen.findByText(/Couldn't reach AI/i)).toBeInTheDocument();
  });
});