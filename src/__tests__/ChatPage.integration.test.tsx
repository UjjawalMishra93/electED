import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@/services/firebase', () => ({
  analytics: null,
}));

import ChatPage from '@/pages/ChatPage';

function createSseResponse(content: string) {
  const encoder = new TextEncoder();
  const chunks = [encoder.encode(content)];
  let index = 0;

  return {
    ok: true,
    headers: {
      get: () => 'text/event-stream',
    },
    body: {
      getReader: () => ({
        read: async () => {
          if (index >= chunks.length) {
            return { done: true, value: undefined };
          }
          return { done: false, value: chunks[index++] };
        },
        releaseLock: () => {},
      }),
    },
  } as Response;
}

describe('ChatPage integration', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      createSseResponse(
        'data: {"delta":"Hello"}\n\n' +
        'data: {"done":true,"sources":[{"label":"USA.gov","url":"https://usa.gov"}]}\n\n',
      ) as unknown as Response,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the chat page and sends a quick prompt', async () => {
    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/Message input/i);
    fireEvent.change(input, { target: { value: 'What is voting?' } });

    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument());
    expect(screen.getByText(/Sources:/i)).toBeInTheDocument();
  });
});
