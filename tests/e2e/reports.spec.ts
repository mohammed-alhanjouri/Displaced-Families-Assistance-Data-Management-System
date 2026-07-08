import { expect, test } from "@playwright/test";
import {
  e2eCamps,
  getE2EAccounts,
  loginAs,
  makeUniqueSuffix,
  seedAssistance,
  seedFamily,
  todayInputValue,
} from "./test-helpers";

test.describe("TS-09 reports and export", () => {
  test("manager generates a filtered report and triggers the PDF print export", async ({
    page,
  }) => {
    const accounts = getE2EAccounts();
    const family = await seedFamily({ campName: e2eCamps.campA });
    const provider = `E2E Reports Provider ${makeUniqueSuffix()}`;
    await seedAssistance(family, {
      assistanceType: "Cash",
      assistanceDate: todayInputValue(),
      providerOrganization: provider,
      notes: "Reports E2E assistance.",
    });

    await loginAs(page, accounts.manager);
    await page.goto("/reports");
    await expect(
      page.getByRole("heading", { name: "Generate Reports" }),
    ).toBeVisible();

    await page
      .getByLabel("Report Type")
      .selectOption("assistance-history");
    await page.getByLabel("Camp / Location").selectOption({ label: e2eCamps.campA });
    await page.getByLabel("Assistance Type").selectOption("Cash");
    await page.getByLabel("Date From").fill(todayInputValue());
    await page.getByLabel("Date To").fill(todayInputValue());
    await page.getByRole("button", { name: "Generate Report" }).click();

    await expect(
      page.getByRole("heading", {
        name: "Detailed Family Assistance History",
      }),
    ).toBeVisible();
    await expect(page.getByText(provider)).toBeVisible();
    await expect(page.getByText(family.familyHeadName)).toBeVisible();
    await expect(page.getByText(family.nationalId)).toBeVisible();

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Export as PDF" }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    await expect(popup.getByText("Detailed Family Assistance History")).toBeVisible();
    await expect(popup.getByText(provider)).toBeVisible();
  });
});
