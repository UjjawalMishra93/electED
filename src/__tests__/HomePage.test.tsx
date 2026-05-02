import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';

jest.mock('@/services/electionFacts', () => ({
  useElectionFacts: () => ({
    data: [
      {
        id: 'fact-1',
        topic: 'Voting Rights',
        content: 'Every eligible US citizen may register to vote in their state of residence.',
        source: 'USA.gov',
        sourceUrl: 'https://www.usa.gov/voter-registration',
        lastUpdated: new Date(),
        tags: ['registration', 'rights'],
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

describe('HomePage', () => {
  it('renders the hero and verified facts section', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /Demystify the/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Verified Election Facts/i })).toBeInTheDocument();
    expect(screen.getByText(/Every eligible US citizen may register to vote/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Source: USA.gov/i })).toBeInTheDocument();
  });
});
