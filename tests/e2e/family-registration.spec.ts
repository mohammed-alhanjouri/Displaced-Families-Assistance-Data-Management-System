import { expect, test } from "@playwright/test";
import {
  e2eCamps,
  fillFamilyRegistrationForm,
  getE2EAccounts,
  loginAs,
  makeNationalId,
  makePhoneNumber,
  makeUniqueSuffix,
} from "./test-helpers";

test.describe("TS-03 family registration and duplicate prevention", () => {
  test("data entry staff registers a family and duplicate National ID is rejected", async ({
    page,
  }) => {
    const accounts = getE2EAccounts();
    const suffix = makeUniqueSuffix();
    const family = {
      nationalId: makeNationalId(),
      familyHeadName: `E2E Registration ${suffix}`,
      phoneNumber: makePhoneNumber(),
      totalMembers: 5,
      campName: e2eCamps.campA,
      originalResidenceGovernorate: "Gaza",
      originalResidenceCity: "Gaza City",
    };

    await loginAs(page, accounts.dataEntry, { campName: e2eCamps.campA });
    await page.goto("/register-family");
    await expect(
      page.getByRole("heading", { name: "Register New Family" }),
    ).toBeVisible();

    await fillFamilyRegistrationForm(page, family);
    await page.getByRole("button", { name: "Save Registration" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Family registration saved successfully.",
    );

    await fillFamilyRegistrationForm(page, family);
    await page.getByRole("button", { name: "Save Registration" }).click();
    await expect(page.getByRole("alert")).toContainText(
      "This family is already registered.",
    );
    await expect(
      page.getByText("A family with this National ID is already registered."),
    ).toBeVisible();
  });
});
