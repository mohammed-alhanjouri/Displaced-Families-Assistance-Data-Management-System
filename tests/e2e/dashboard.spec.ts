import { expect, test } from "@playwright/test";
import {
  e2eCamps,
  expectLocatorTextNumberAtLeast,
  expectStatValueLoaded,
  getE2EAccounts,
  loginAs,
  makeUniqueSuffix,
  seedAssistance,
  seedFamily,
  todayInputValue,
} from "./test-helpers";

test.describe("TS-08 dashboard", () => {
  test("manager dashboard loads statistics, charts, recent assistance, and applies filters", async ({
    page,
  }) => {
    const accounts = getE2EAccounts();
    const family = await seedFamily({
      campName: e2eCamps.campA,
      totalMembers: 8,
      isFemaleHeaded: true,
    });
    const provider = `E2E Dashboard Provider ${makeUniqueSuffix()}`;
    await seedAssistance(family, {
      assistanceType: "Medical",
      assistanceDate: todayInputValue(),
      providerOrganization: provider,
      notes: "Dashboard E2E assistance.",
    });

    await loginAs(page, accounts.manager);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await expectStatValueLoaded(page, "Total Families");
    await expectStatValueLoaded(page, "Total Persons");
    await expectStatValueLoaded(page, "High-Vulnerability Families");
    await expectStatValueLoaded(page, "Total Assistance Provided");
    await expectLocatorTextNumberAtLeast(
      page
        .locator("section div")
        .filter({ has: page.getByRole("heading", { name: "Total Families" }) })
        .first()
        .locator("p")
        .first(),
      1,
    );

    await expect(
      page.getByRole("heading", { name: "Families per Location" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Vulnerability Distribution" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Assistance Logs" }),
    ).toBeVisible();
    await expect(page.getByText(provider)).toBeVisible();

    await page.getByLabel("Camp / Location").selectOption({ label: e2eCamps.campA });
    await page.getByLabel(/Date From/).fill(todayInputValue());
    await page.getByLabel(/Date To/).fill(todayInputValue());
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText(provider)).toBeVisible();
    await expect(page.getByText(family.familyHeadName)).toBeVisible();
  });
});
