import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Import all your Context Providers here
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DarkModeProvider } from "./contexts/DarkModeContext.jsx";
import AuthProvider from "./contexts/AuthProvider.jsx"; 
import { SocketProvider } from "./contexts/SocketProvider.jsx";
import { NotificationProvider } from "./contexts/NotificationProvider.jsx";

// 2. Create the Query Client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Level 1: Data Fetching */}
    <QueryClientProvider client={queryClient}>
      {/* Level 2: Theme */}
      <DarkModeProvider>
        {/* Level 3: User Authentication */}
        <AuthProvider>
          {/* Level 4: Real-time Socket (needs User) */}
          <SocketProvider>
            {/* Level 5: Notifications (needs Socket) */}
            <NotificationProvider>
              
              {/* Finally: The App */}
              <App />

            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)