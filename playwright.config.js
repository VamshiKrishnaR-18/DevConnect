// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0, // Fail immediately so we see errors fast
  
  // 🚀 THIS IS CRITICAL:
  // It tells Playwright to start your "npm run dev" command (Backend + Frontend)
  // before running the tests.
  webServer: {
    command: 'npm run dev', 
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // Wait up to 2 mins for servers to start
  },
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry', // Record video if it fails
    headless: false, // 👀 Let's WATCH the robot work (set to true to hide browser)
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});