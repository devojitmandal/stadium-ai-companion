import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FanView from './FanView';
import { askGemini } from '../lib/askGemini';

// vi.mock factories are hoisted above all other top-level code, so the
// shared mock factory is imported dynamically inside the factory itself.
vi.mock('../lib/supabase', async () => {
  const { createSupabaseMock } = await import('../test/mocks/supabase');
  return {
    supabase: createSupabaseMock({
      stadium_state: {
        data: [{
          gate_id: 'Gate 3',
          queue_time_min: 12,
          congestion_pct: 40,
          context: {},
          history: [],
        }],
        error: null,
      },
      notifications: { data: [], error: null },
    }),
  };
});

vi.mock('../lib/askGemini', () => ({
  askGemini: vi.fn(),
}));

/**
 * FanView fires an AI call automatically on mount (gate-aware sustainability
 * info). Tests that care about a user-triggered call wait for that
 * mount-time call to settle first, then clear it, so call counts and
 * prompt inspection only reflect the action under test.
 */
async function renderAndSettleMount() {
  render(<FanView />);
  await waitFor(() => expect(askGemini).toHaveBeenCalled());
  askGemini.mockClear();
}

describe('FanView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the navigation heading', async () => {
    render(<FanView />);
    expect(await screen.findByText(/Smart Navigation/i)).toBeInTheDocument();
  });

  it('shows the predict button', async () => {
    render(<FanView />);
    expect(await screen.findByRole('button', { name: /Calculate Best Strategy/i })).toBeInTheDocument();
  });

  it('calls askGemini exactly once when Predict is clicked', async () => {
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'Go now.' });
    await renderAndSettleMount();

    fireEvent.click(screen.getByRole('button', { name: /Calculate Best Strategy/i }));
    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(1));
  });

  it('displays the AI recommendation after a successful prediction', async () => {
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'Go now.' });
    await renderAndSettleMount();

    fireEvent.click(screen.getByRole('button', { name: /Calculate Best Strategy/i }));

    expect(await screen.findByText('Go now.')).toBeInTheDocument();
  });

  it('includes the accessibility constraint in the prompt when the toggle is checked', async () => {
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'ok' });
    await renderAndSettleMount();

    fireEvent.click(screen.getByRole('checkbox', { name: /enable accessibility mode/i }));
    fireEvent.click(screen.getByRole('button', { name: /Calculate Best Strategy/i }));

    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(1));
    const [promptSent] = askGemini.mock.calls[0];
    expect(promptSent).toMatch(/wheelchair-accessible routing/i);
  });

  it('shows an inline error message if the prediction call fails (never a browser alert)', async () => {
    await renderAndSettleMount();
    askGemini.mockRejectedValue(new Error('network fail'));

    fireEvent.click(screen.getByRole('button', { name: /Calculate Best Strategy/i }));

    expect(await screen.findByText(/Couldn't reach AI right now/i)).toBeInTheDocument();
  });
});