import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../Login';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api'; // Import the api util

// 1. MOCK THE API (Prevents Network Error)
vi.mock('../../utils/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// 2. MOCK CONTEXTS (Prevents Navbar Crash)
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ unreadCount: 0, markAllAsRead: vi.fn() }),
}));
vi.mock('../../contexts/DarkModeContext', () => ({
  useDarkMode: () => ({ isDarkMode: false, toggleDarkMode: vi.fn() }),
}));

// Mock Auth Login function
const mockLogin = vi.fn();
const mockContext = { login: mockLogin, loading: false, user: null };

const renderLogin = () => {
  render(
    <AuthContext.Provider value={mockContext}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Login Page UI', () => {
  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('updates input values when typing', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('calls the login API when submitting', async () => {
    // Fake a successful server response
    api.post.mockResolvedValue({ 
      data: { data: { user: { id: 1 }, token: 'abc' } } 
    });

    renderLogin();
    
    // Type in credentials
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass123' } });
    
    // Click Login
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify API was called
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });
});