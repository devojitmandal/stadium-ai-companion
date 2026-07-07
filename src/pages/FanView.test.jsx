import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FanView from './FanView';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (table) => {
      if (table === 'stadium_state') {
        return {
          select: () => ({
            order: () => Promise.resolve({
              data: [{ gate_id: 'Gate 3', queue_time_min: 12, congestion_pct: 40, context: {}, history: [] }],
              error: null,
            }),
          }),
        };
      }
      // notifications table
      return {
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      };
    },
  },
}));

vi.mock('../lib/askGemini', () => ({
  askGemini: vi.fn(),
}));

import { askGemini } from '../lib/askGemini';

describe('FanView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the navigation heading', async () => {
    render(<FanView />);
    expect(screen.getByText(/Smart Navigation & Queue Betting/i)).toBeInTheDocument();
  });

  it('shows the predict button', async () => {
    render(<FanView />);
    expect(screen.getByRole('button', { name: /Predict Best Time to Go/i })).toBeInTheDocument();
  });

  it('calls askGemini when Predict is clicked', async () => {
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'Go now.' });
    render(<FanView />);

    // let the mount-time getGateInfo call settle first
    await waitFor(() => expect(askGemini).toHaveBeenCalled());
    askGemini.mockClear();

    fireEvent.click(await screen.findByRole('button', { name: /Predict Best Time to Go/i }));
    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(1));
  });

  it('displays the AI recommendation after prediction', async () => {
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'Go now.' });
    render(<FanView />);

    await waitFor(() => expect(askGemini).toHaveBeenCalled());
    askGemini.mockClear();
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'Go now.' });

    fireEvent.click(await screen.findByRole('button', { name: /Predict Best Time to Go/i }));

    expect(await screen.findByText('Go now.')).toBeInTheDocument();
  });

  it('includes accessibility constraint in the prompt when toggle is checked', async () => {
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'ok' });
    render(<FanView />);

    await waitFor(() => expect(askGemini).toHaveBeenCalled());
    askGemini.mockClear();

    const checkbox = await screen.findByRole('checkbox');
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: /Predict Best Time to Go/i }));

    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(1));
    const promptSent = askGemini.mock.calls[0][0];
    expect(promptSent).toMatch(/wheelchair-accessible routing/i);
  });

  it('shows an inline error message if askGemini fails (no browser alert)', async () => {
    askGemini.mockResolvedValueOnce({ sustainability_tip: 'x', transport_status: 'y' });
    render(<FanView />);

    await waitFor(() => expect(askGemini).toHaveBeenCalled());
    askGemini.mockClear();
    askGemini.mockRejectedValue(new Error('network fail'));

    fireEvent.click(await screen.findByRole('button', { name: /Predict Best Time to Go/i }));

    expect(await screen.findByText(/Couldn't reach AI right now/i)).toBeInTheDocument();
  });
});