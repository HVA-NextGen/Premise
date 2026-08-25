import { expect, test } from "@playwright/test";

const briefResponse = {
  ok: true,
  brief: {
    summary: "A focused mobile tool that removes friction from expense capture.",
    problem: {
      statement: "Expense reports arrive late because capture happens long after the job.",
      currentState:
        "Today expenses are entered in a desktop portal that needs a connection.",
      impact: "Finance closes the month late.",
    },
    desiredOutcome: {
      statement: "Expenses are captured at the moment of spend.",
      successIndicators: ["Median time from spend to submission drops below one day."],
    },
    assumptions: ["Technicians carry a smartphone on every job."],
    requirements: [
      {
        title: "Offline receipt capture",
        rationale: "Signal is unreliable at many sites.",
        priority: "must",
      },
    ],
    acceptanceCriteria: [
      "A receipt captured offline syncs automatically when back online.",
    ],
    risks: [
      {
        risk: "Poor OCR accuracy on crumpled receipts.",
        mitigation: "Allow manual correction before submit.",
        severity: "medium",
      },
    ],
    experiments: [
      {
        hypothesis: "Offline capture reduces late submissions.",
        method: "Pilot with one region for a month.",
        successMetric: "Late submissions drop below 10%.",
      },
    ],
  },
};

test("generates and displays a feature plan", async ({ page }) => {
  // Intercept the model call so the test needs no APIM or Azure credentials.
  await page.route("**/api/brief", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(briefResponse),
    });
  });

  await page.goto("/");
  await expect(page.getByText("Ei ominaisuussuunnitelmaa vielä")).toBeVisible();

  await page.getByRole("button", { name: "Lataa esimerkki" }).click();
  await page.getByRole("button", { name: "Luo suunnitelma" }).click();

  await expect(
    page.getByRole("article", { name: "Ominaisuussuunnitelma" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Yhteenveto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ongelma" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Tavoiteltu lopputulos" }),
  ).toBeVisible();
  await expect(page.getByText("Offline receipt capture")).toBeVisible();
});
