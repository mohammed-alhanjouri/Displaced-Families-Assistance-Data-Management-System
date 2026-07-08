import { expect, test } from "@playwright/test";
import {
  e2eCamps,
  getFamilyInformationSection,
  getE2EAccounts,
  loginAs,
  makePhoneNumber,
  searchByNationalId,
  seedFamily,
} from "./test-helpers";

test.describe("TS-04 local search, profile, and update", () => {
  test("data entry staff finds a local family, opens the profile, updates it, and verifies the change", async ({
    page,
  }) => {
    const accounts = getE2EAccounts();
    const family = await seedFamily({
      campName: e2eCamps.campA,
      totalMembers: 4,
    });
    const updatedPhoneNumber = makePhoneNumber();
    const updatedTotalMembers = family.totalMembers + 1;

    await loginAs(page, accounts.dataEntry, { campName: e2eCamps.campA });
    await page.goto("/local-search");
    await searchByNationalId(page, family.nationalId);

    await page.getByRole("link", { name: "View Profile" }).click();
    await expect(
      page.getByRole("heading", { name: "Family Profile" }),
    ).toBeVisible();
    let familyInformation = getFamilyInformationSection(page);
    await expect(familyInformation).toContainText(family.familyHeadName);
    await expect(familyInformation).toContainText(family.phoneNumber);

    await page.getByRole("link", { name: "Update Family" }).click();
    await expect(
      page.getByRole("heading", { name: "Update Family Information" }),
    ).toBeVisible();
    await page.getByLabel(/Phone Number/).fill(updatedPhoneNumber);
    await page.getByLabel(/Total Members/).fill(String(updatedTotalMembers));
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL(new RegExp(`/families/${family.nationalId}$`));
    await expect(page.getByRole("status")).toContainText(
      "Family information updated successfully.",
    );
    familyInformation = getFamilyInformationSection(page);
    await expect(familyInformation).toContainText(updatedPhoneNumber);
    await expect(familyInformation).toContainText(
      `Total Members: ${updatedTotalMembers}`,
    );
  });
});
