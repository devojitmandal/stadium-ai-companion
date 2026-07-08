import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VolunteerView from './VolunteerView';
import { askGemini } from '../lib/askGemini';

// --- MOCKS ---
vi.mock('../lib/askGemini', () => ({
  askGemini: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      update: () => ({ 
        eq: () => Promise.resolve({ error: null }) 
      }),
    }),
  },
}));

// --- TEST SUITE ---
describe('VolunteerView Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial phrasebook heading successfully', async () => {
    // Act
    render(<VolunteerView />);
    
    // Assert - Changed to match the new UI text
    expect(await screen.findByText(/Instant Phrasebook/i)).toBeInTheDocument();
  });

  it('displays generated AI phrases and cultural tips after form submission', async () => {
    // Arrange: Mock a successful Gemini API response
    askGemini.mockResolvedValue({
      phrases: [{ english: 'Hello', translated: 'Hola', phonetic: 'OH-lah' }],
      cultural_tip: 'Be warm and direct.',
    });

    render(<VolunteerView />);

    // Act: Trigger the generation
    fireEvent.click(screen.getByRole('button', { name: /Generate Translation Cards/i }));

    // Assert: Verify the mocked data renders on screen
    expect(await screen.findByText('Hola')).toBeInTheDocument();
    expect(await screen.findByText('Be warm and direct.')).toBeInTheDocument();
  });

  it('displays an inline error message when the AI generation fails', async () => {
    // Arrange: Mock an API failure
    askGemini.mockRejectedValue(new Error('API Failure'));
    
    render(<VolunteerView />);

    // Act: Trigger the generation
    fireEvent.click(screen.getByRole('button', { name: /Generate Translation Cards/i }));

    // Assert: Verify the fallback UI notice appears
    expect(await screen.findByText(/Couldn't reach AI/i)).toBeInTheDocument();
  });
  
});