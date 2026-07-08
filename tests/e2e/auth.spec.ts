import { expect, test } from "@playwright/test";
import { e2eCamps, getE2EAccounts, loginAs } from "./test-helpers";

test.describe("TS-01 authentication and role routing", () => {
  test("routes valid users by role and rejects invalid credentials", async ({
    page,
  }) => {
    const accounts = getE2EAccounts();

    await page.goto("/login");
    await page.getByLabel("Email / Username").fill(accounts.admin.username);
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: /^Sign in$/ }).click();
    await expect(page.getByText("Invalid login credentials")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);

    await loginAs(page, accounts.admin);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: "System Administrator Dashboard" }),
    ).toBeVisible();

    await loginAs(page, accounts.manager);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "System Administrator Dashboard" }),
    ).toHaveCount(0);

    await loginAs(page, accounts.dataEntry, { campName: e2eCamps.campA });
    await expect(page).toHaveURL(/\/data-entry-dashboard$/);
    await expect(page.getByRole("banner").getByText(e2eCamps.campA)).toBeVisible();
  });
});
