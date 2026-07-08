import { expect, test } from "@playwright/test";
import {
  e2eCamps,
  fetchAdminUserByUsername,
  findPaginatedRowByText,
  getE2EAccounts,
  loginAs,
  makeUniqueSuffix,
} from "./test-helpers";

test.describe("TS-02 user and role management", () => {
  test("admin creates, updates, changes role, deactivates, and activates a user", async ({
    page,
  }) => {
    const accounts = getE2EAccounts();
    const suffix = makeUniqueSuffix();
    const username = `e2e_user_${suffix}`.slice(0, 64);
    const originalName = `000 E2E User ${suffix}`;
    const updatedName = `000 E2E Updated ${suffix}`;
    const email = `e2e.user.${suffix}@example.com`;

    await loginAs(page, accounts.admin);
    await page.goto("/user-management");
    await expect(
      page.getByRole("heading", { name: "Manage User Accounts" }),
    ).toBeVisible();

    await page.getByLabel("Full Name").fill(originalName);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(`Pass${suffix}123`);
    await page.getByLabel("Role").selectOption("data_entry_staff");
    await page.getByLabel("Assigned Camp").selectOption({ label: e2eCamps.campA });
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("status")).toContainText("User account created.");
    let row = await findPaginatedRowByText(page, username);
    await expect(row).toContainText(originalName);
    await expect(row).toContainText("Data Entry Staff");
    await expect(row).toContainText(e2eCamps.campA);
    await expect(row).toContainText("Active");

    await row.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Full Name").fill(updatedName);
    await page.getByLabel("Role").selectOption("organization_manager");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("status")).toContainText("User account updated.");
    row = await findPaginatedRowByText(page, username);
    await expect(row).toContainText(updatedName);
    await expect(row).toContainText("Organization Manager");

    let persistedUser = await fetchAdminUserByUsername(username);
    expect(persistedUser).toMatchObject({
      fullName: updatedName,
      username,
      role: "organization_manager",
      status: "active",
    });

    await row.getByRole("button", { name: "Deactivate" }).click();
    await expect(page.getByRole("status")).toContainText(
      "User account deactivated.",
    );
    row = await findPaginatedRowByText(page, username);
    await expect(row).toContainText("Inactive");
    persistedUser = await fetchAdminUserByUsername(username);
    expect(persistedUser?.status).toBe("inactive");

    await row.getByRole("button", { name: "Activate" }).click();
    await expect(page.getByRole("status")).toContainText(
      "User account activated.",
    );
    row = await findPaginatedRowByText(page, username);
    await expect(row).toContainText("Active");
    persistedUser = await fetchAdminUserByUsername(username);
    expect(persistedUser?.status).toBe("active");
  });
});
