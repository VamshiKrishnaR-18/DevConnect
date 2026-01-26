// 👇 REMOVE 'fireEvent' from this line
import { render, screen } from '@testing-library/react'; 
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Feed from '../Feed';
import { AuthContext } from '../../contexts/AuthContext';

// ... (Rest of the file stays exactly the same) ...

// 1. MOCK REACT QUERY
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ setQueryData: vi.fn() }),
    useInfiniteQuery: () => ({
      data: {
        pages: [
          {
            posts: [
              {
                _id: 'post1',
                content: 'Hello World Post',
                author: { username: 'testuser', profilepic: '' },
                likes: [],
                comments: [],
                createdAt: new Date().toISOString(),
              },
            ],
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'success',
    }),
  };
});

// 2. MOCK SOCKET CONTEXT
vi.mock('../../contexts/SocketContext', () => ({
  useSocket: () => ({ on: vi.fn(), off: vi.fn() }),
}));

// 3. MOCK OTHER CONTEXTS
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ unreadCount: 0 }),
}));
vi.mock('../../contexts/DarkModeContext', () => ({
  useDarkMode: () => ({ isDarkMode: false }),
}));

// 4. MOCK API
vi.mock('../../utils/api', () => ({
  default: { post: vi.fn() },
}));

const renderFeed = () => {
  render(
    <AuthContext.Provider value={{ user: { _id: '123', username: 'me' } }}>
      <BrowserRouter>
        <Feed />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Feed Page', () => {
  it('renders the post input box', () => {
    renderFeed();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });

  it('renders posts from React Query', async () => {
    renderFeed();
    expect(await screen.findByText('Hello World Post')).toBeInTheDocument();
  });

  it('renders the Post button', () => {
    renderFeed();
    const postBtn = screen.getByRole('button', { name: /Post/i });
    expect(postBtn).toBeInTheDocument();
  });
});