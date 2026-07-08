import { expect, test } from "@playwright/test";
import {
  e2eCamps,
  getFamilyInformationSection,
  getE2EAccounts,
  loginAs,
  logout,
  searchByNationalId,
  seedFamily,
} from "./test-helpers";

test.describe("TS-07 global search and authorization", () => {
  test("manager searches across camps, while data entry staff cannot access global search", async ({
    page,
  }) => {
    const accounts = getE2EAccounts();
    const campAFamily = await seedFamily({
      campName: e2eCamps.campA,
      familyHeadName: "E2E Global Camp A",
    });
    const campBFamily = await seedFamily({
      campName: e2eCamps.campB,
      familyHeadName: "E2E Global Camp B",
    });

    await loginAs(page, accounts.manager);
    await page.goto("/global-search");
    await expect(page.getByRole("heading", { name: "Global Search" })).toBeVisible();

    await searchByNationalId(page, campAFamily.nationalId);
    await expect(page.getByText(campAFamily.familyHeadName)).toBeVisible();
    await page.getByRole("link", { name: "View Profile" }).click();
    await expect(getFamilyInformationSection(page)).toContainText(
      campAFamily.familyHeadName,
    );

    await page.goto("/global-search");
    await searchByNationalId(page, campBFamily.nationalId);
    await expect(page.getByText(campBFamily.familyHeadName)).toBeVisible();
    await page.getByRole("link", { name: "View Profile" }).click();
    await expect(getFamilyInformationSection(page)).toContainText(
      campBFamily.familyHeadName,
    );

    await logout(page);
    await loginAs(page, accounts.dataEntry, { campName: e2eCamps.campA });
    await page.goto("/global-search");
    await expect(page).toHaveURL(/\/data-entry-dashboard$/);
    await expect(page.getByText("Current Work Location")).toBeVisible();
  });
});
