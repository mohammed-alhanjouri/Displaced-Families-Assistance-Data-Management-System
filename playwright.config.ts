import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

const e2eEnv = loadEnv("e2e", process.cwd(), "");

Object.assign(process.env, e2eEnv);

export default defineConfig({
  testDir: "./tests/e2e",

  // The workflows mutate shared Supabase test data, so keep them serial.
  fullyParallel: false,
  workers: 1,
  retries: 0,

  timeout: 45_000,

  expect: {
    timeout: 10_000,
  },

  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "playwright-report",
        open: "never",
      },
    ],
  ],

  use: {
    // Configure the base URL for the application under test.
    baseURL: "http://127.0.0.1:5173",

    // Configure failure evidence collection.
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command:
      "npm run dev -- --mode e2e --host 127.0.0.1 --port 5173 --strictPort",

    url: "http://127.0.0.1:5173",

    // Always launch the e2e-mode app to avoid stale dev-server state.
    reuseExistingServer: false,

    timeout: 120_000,
  },
});
