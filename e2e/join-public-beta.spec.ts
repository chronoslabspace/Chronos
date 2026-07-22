import { test, expect } from "@playwright/test";

test.describe("Join public beta", () => {
  test("opens signup modal from nav and shows OAuth + email options", async ({ page }) => {
    await page.goto("/");

    const openBeta = page.locator('button:has-text("Join public beta")').first();
    await expect(openBeta).toBeVisible();
    await openBeta.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /join the public beta/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /continue with google/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /continue with github/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^sign up$/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^sign in$/i })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /magic link/i })).toBeVisible();
  });
});
