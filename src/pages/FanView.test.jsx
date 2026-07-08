import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FanView from './FanView';
import { askGemini } from '../lib/askGemini';

// --- MOCKS ---

// Note: vi.mock factories are hoisted. We dynamically import a shared mock 
// factory to ensure the mock data lives inside the factory itself.
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

// --- UTILITIES ---

/**
 * FanView fires an AI call automatically on mount (for sustainability info). 
 * Tests that care about user-triggered calls need to wait for that mount-time 
 * call to settle first, then clear the mock history.
 */
async function renderAndSettleMount() {
  render(<FanView />);
  await waitFor(() => expect(askGemini).toHaveBeenCalled());
  askGemini.mockClear();
}

// --- TEST SUITE ---
describe('FanView Component', () => {
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the core navigation heading on mount', async () => {
    // Act
    render(<FanView />);
    
    // Assert - Changed to match the new UI text
    expect(await screen.findByText(/Smart Navigation/i)).toBeInTheDocument();
  });

  it('renders the prediction trigger button', async () => {
    // Act
    render(<FanView />);
    
    // Assert
    expect(await screen.findByRole('button', { name: /Calculate Best Strategy/i })).toBeInTheDocument();
  });

  it('triggers a single AI call when the prediction button is clicked', async () => {
    // Arrange
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'Go now.' });
    await renderAndSettleMount();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /Calculate Best Strategy/i }));
    
    // Assert
    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(1));
  });

  it('displays the parsed AI recommendation after a successful API return', async () => {
    // Arrange
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'Go now.' });
    await renderAndSettleMount();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /Calculate Best Strategy/i }));

    // Assert
    expect(await screen.findByText('Go now.')).toBeInTheDocument();
  });

  it('injects specific accessibility constraints into the AI prompt when the mode is enabled', async () => {
    // Arrange
    askGemini.mockResolvedValue({ now_wait: 10, later_wait: 15, recommendation: 'ok' });
    await renderAndSettleMount();

    // Act
    // Note: The FanView code changed the aria-label to match the new UI, 
    // so we target the checkbox via its role directly.
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Calculate Best Strategy/i }));

    // Assert
    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(1));
    const [promptSent] = askGemini.mock.calls[0];
    expect(promptSent).toMatch(/wheelchair-accessible routing/i);
  });

  it('displays a graceful inline error message if the Gemini API call fails', async () => {
    // Arrange
    await renderAndSettleMount();
    askGemini.mockRejectedValue(new Error('Network fail'));

    // Act
    fireEvent.click(screen.getByRole('button', { name: /Calculate Best Strategy/i }));

    // Assert (Verifying no alert dialogs pop up)
    expect(await screen.findByText(/Couldn't reach AI right now/i)).toBeInTheDocument();
  });
});