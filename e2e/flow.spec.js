import { test, expect } from '@playwright/test';

test('User Life Cycle: Register -> Post -> Comment -> Delete Post', async ({ page }) => {
  test.setTimeout(60000);

  const uniqueId = Date.now();
  const username = `lifecycle_${uniqueId}`;
  const email = `lifecycle_${uniqueId}@test.com`;
  const password = 'Password123!';
  const postContent = `Delete Me Post ${uniqueId}`;

  console.log(`🤖 Robot User: ${username}`);

  // --- STEP 1: REGISTER ---
  await page.goto('/register');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Register")');
  
  await expect(page).toHaveURL(/\/login/);
  
  // --- STEP 2: LOGIN ---
  await page.fill('input[placeholder="Email"]', email);
  await page.fill('input[placeholder="Password"]', password);
  await page.click('button:has-text("Login")');

  await expect(page).toHaveURL(/\/feed/);

  // --- STEP 3: CREATE POST ---
  await page.fill('textarea', postContent);
  await page.click('button:has-text("Post")');

  // Wait for post to appear
  const postLocator = page.locator('article, div').filter({ hasText: postContent }).first();
  await expect(postLocator).toBeVisible({ timeout: 10000 });

  // --- STEP 4: COMMENT ---
  console.log('💬 Robot is commenting...');
  
  // 👇 FIX: Added .first() to handle cases where 2 comment icons exist
  const commentBtn = postLocator.locator('button svg.lucide-message-circle').locator('..').first();
  await commentBtn.click();
  
  const commentInput = postLocator.locator('input[placeholder*="comment"]');
  await commentInput.fill('Self comment');
  await commentInput.press('Enter');
  
  await expect(postLocator).toContainText('Self comment');

  // --- STEP 5: CHECK NOTIFICATIONS ---
  console.log('🔔 Checking Notifications...');
  await page.click('a[href="/notifications"]');
  await expect(page).toHaveURL(/\/notifications/);
  
  const emptyState = page.getByText(/no notifications/i);
  const markReadBtn = page.getByTitle(/mark all as read/i).or(page.locator('button svg.lucide-check-check'));
  await expect(emptyState.or(markReadBtn).first()).toBeVisible();

  // --- STEP 6: DELETE POST (ON PROFILE) ---
  console.log('👤 Going to Profile to Delete...');
  
  await page.goto(`/profile/${username}`);
  
  const profilePost = page.locator('article, div').filter({ hasText: postContent }).first();
  await expect(profilePost).toBeVisible();

  page.once('dialog', async dialog => {
    console.log(`Dialog says: ${dialog.message()}`);
    await dialog.accept();
  });

  const deleteIcon = profilePost.locator('.lucide-trash, .lucide-trash-2').first();
  await deleteIcon.click();

  // --- STEP 7: VERIFY DELETION ---
  await expect(profilePost).not.toBeVisible();

  console.log('✅ Life Cycle Complete!');
});