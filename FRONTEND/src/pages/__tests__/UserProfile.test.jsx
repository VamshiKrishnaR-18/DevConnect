import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserProfile from '../UserProfile';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api';

// 1. MOCK API
vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

// 2. MOCK CONTEXTS
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ unreadCount: 0, markAllAsRead: vi.fn() }),
}));
vi.mock('../../contexts/DarkModeContext', () => ({
  useDarkMode: () => ({ isDarkMode: false, toggleDarkMode: vi.fn() }),
}));

// Mock Data matching your Schema
const mockUser = {
  _id: '123',
  username: 'testuser',
  email: 'test@example.com',
  followers: [],
  following: [],
  profilepic: '',
};

const mockProfileData = {
  data: {
    data: {
      user: mockUser, // Correct nesting
      posts: [],
    },
  },
};

const renderProfile = () => {
  render(
    <AuthContext.Provider value={{ user: mockUser, loading: false }}>
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('UserProfile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays user data', async () => {
    api.get.mockResolvedValue(mockProfileData);
    renderProfile();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    // Find username
    const usernameElements = await screen.findAllByText('testuser');
    expect(usernameElements.length).toBeGreaterThan(0);
  });

  it('shows "Change profile picture" button when viewing own profile', async () => {
    api.get.mockResolvedValue(mockProfileData);
    
    // Mock useParams to match logged-in user
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useParams: () => ({ username: 'testuser' }),
      };
    });

    renderProfile();

    await waitFor(() => {
      // Check for the Camera Icon Title
      expect(screen.getByTitle(/Change profile picture/i)).toBeInTheDocument();
    });
  });
});