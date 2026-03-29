import { test, expect } from "@playwright/test";

test.describe("Kanban Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("renders the dashboard header and board", async ({ page }) => {
    await expect(page.getByText("Kanban Dashboard")).toBeVisible();
    await expect(page.getByText("Backlog")).toBeVisible();
    await expect(page.getByText("To Do")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Review")).toBeVisible();
    await expect(page.getByText("Done")).toBeVisible();
  });

  test("defaults to Product Owner view", async ({ page }) => {
    await expect(page.getByText("Product Owner View")).toBeVisible();
    await expect(page.getByText("Release Progress")).toBeVisible();
    await expect(page.getByText("Priority Breakdown")).toBeVisible();
    await expect(page.getByText("Epic Progress")).toBeVisible();
  });

  test("switches to Scrum Master view", async ({ page }) => {
    await page.getByTestId("role-scrum-master").click();
    await expect(page.getByText("Scrum Master View")).toBeVisible();
    await expect(page.getByText("Sprint Burndown")).toBeVisible();
    await expect(page.getByText("Team Workload")).toBeVisible();
    await expect(page.getByText("Cumulative Flow")).toBeVisible();
  });

  test("switches to Developer view", async ({ page }) => {
    await page.getByTestId("role-developer").click();
    await expect(page.getByText("Developer View")).toBeVisible();
    await expect(page.getByText("Your Profile")).toBeVisible();
    await expect(page.getByText("Sprint Stats")).toBeVisible();
    await expect(page.getByText("Alex Chen")).toBeVisible();
  });

  test("Developer view my-tasks filter toggles", async ({ page }) => {
    await page.getByTestId("role-developer").click();
    const toggle = page.getByTestId("my-tasks-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveClass(/teal/);
  });

  test("shows cards with correct content", async ({ page }) => {
    await expect(page.getByText("Set up OAuth 2.0 flow")).toBeVisible();
    await expect(page.getByText("Stripe payment integration")).toBeVisible();
  });

  test("Scrum Master view shows WIP limits on columns", async ({ page }) => {
    await page.getByTestId("role-scrum-master").click();
    const wipBadges = page.locator("text=/\\d+\\/\\d+/");
    expect(await wipBadges.count()).toBeGreaterThan(0);
  });

  test("Scrum Master view shows blocker cards", async ({ page }) => {
    await page.getByTestId("role-scrum-master").click();
    await expect(
      page.getByText("Waiting for Stripe test keys from finance team")
    ).toBeVisible();
  });

  test("Product Owner view filters by epic", async ({ page }) => {
    await page
      .getByRole("button", { name: /User Authentication \d+\// })
      .click();
    const cards = page.locator("[class*='cursor-grab']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(24);
  });
});
