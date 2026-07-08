import { expect, test } from "@playwright/test";
import {
  e2eCamps,
  getE2EAccounts,
  loginAs,
  makeUniqueSuffix,
  seedFamily,
  todayInputValue,
} from "./test-helpers";

test.describe("TS-06 assistance recording", () => {
  test("data entry staff records assistance and verifies it in assistance history", async ({
    page,
  }) => {
    const accounts = getE2EAccounts();
    const family = await seedFamily({ campName: e2eCamps.campA });
    const provider = `E2E Relief ${makeUniqueSuffix()}`;
    const assistanceDate = todayInputValue();

    await loginAs(page, accounts.dataEntry, { campName: e2eCamps.campA });
    await page.goto(`/add-assistance/${family.nationalId}`);
    await expect(page.getByRole("heading", { name: "Add Assistance" })).toBeVisible();

    await page.getByLabel("Assistance Type").selectOption("Food");
    await page.getByLabel("Assistance Date").fill(assistanceDate);
    await page.getByLabel("Provider Organization").fill(provider);
    await page.getByLabel("Notes").fill("E2E assistance record.");
    await page.getByRole("button", { name: "Save Assistance" }).click();

    await expect(page.getByRole("status")).toContainText(
      "Assistance record saved successfully.",
    );
    await expect(page.getByRole("cell", { name: "Food" })).toBeVisible();
    await expect(page.getByRole("cell", { name: provider })).toBeVisible();

    await page.goto(`/families/${family.nationalId}`);
    await page.getByRole("tab", { name: "Assistance History" }).click();
    await expect(page.getByRole("cell", { name: "Food" })).toBeVisible();
    await expect(page.getByRole("cell", { name: provider })).toBeVisible();
  });
});
