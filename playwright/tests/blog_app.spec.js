const { test, expect, beforeEach, describe } = require("@playwright/test");
const { loginWith, createBlog } = require("./helper");

const name = "TestName";
const username = "TestUsername";
const password = "TestPassword";
const title = "TestTitle";
const author = "TestAuthor";
const url = "TestUrl";

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset");
    await request.post("/api/users", {
      data: {
        name: name,
        username: username,
        password: password,
      },
    });

    await page.goto('/');
  });

  test("Login form is shown", async ({ page }) => {
    await expect(page.getByText("Log in to application")).toBeVisible();
    await expect(page.getByText("Username:")).toBeVisible();
    await expect(page.getByText("Password:")).toBeVisible();
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await loginWith(page, username, password);
      await expect(page.getByText("TestName logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await loginWith(page, username, "wrongpassword");
      const errorDiv = await page.locator(".error");
      await expect(errorDiv).toContainText("Wrong username or password");
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, username, password);
    });

    test("a new blog can be created", async ({ page }) => {
      await createBlog(page, title, author, url);

      const confirmDiv = await page.locator(".confirm");
      await expect(confirmDiv).toContainText(
        "a new blog: TestTitle by: TestAuthor added succesfully."
      );
    });

    test("can like to blog", async ({ page }) => {
      // last child because we created a test new blog and likes should be first 0.
      await page.locator("div:last-child > .Blogsbtn").click();
      await expect(page.getByText("Likes: 0")).toBeVisible();
      await page.getByRole("button", { name: "Like" }).click();
      const confirmDiv = await page.locator(".confirm");
      await expect(confirmDiv).toContainText(
        "a blog updated succesfully: TestTitle by: TestAuthor"
      );

      await expect(page.getByText("Likes: 1")).toBeVisible();
    });

    test("only blogs created can delete a blog", async ({ page }) => {
      await createBlog(page, title, author, url);
      const confirmDiv = await page.locator(".confirm");
      await expect(confirmDiv).toContainText(
        "a new blog: TestTitle by: TestAuthor added succesfully."
      );
      await page.reload();
      await page.waitForSelector("div:last-child > .Blogsbtn"); // Wait for the .Blogsbtn button to appear
      await page.locator("div:last-child > .Blogsbtn").click();
      await expect(page.getByText("Creator: TestName")).toBeVisible();

      await page.evaluate(() => {
        window.confirm = () => true;
      });

      await page.getByRole("button", { name: "remove" }).click();
      await expect(confirmDiv).toContainText(
        "a blog deleted succesfully: TestTitle by: TestAuthor."
      );
    });

    test("if other user created: can not delete a blog or see to remove -button", async ({
      page,
    }) => {
      //first because there is other than Test -element first
      await page
        .locator("div")
        .filter({ hasText: /^Title: Ankan tarinat8view$/ })
        .getByTestId("view-button")
        .click();
      await expect(page.getByText("Creator: TestName")).not.toBeVisible();
      await expect(page.getByText("remove")).not.toBeVisible();
    });

    test("blogs are sorted by likes", async ({ page }) => {
      await page.waitForTimeout(1000);
      // Click all the .Blogsbtn buttons
      const blogButtons = await page.$$(".Blogsbtn");
      for (const button of blogButtons) {
        await button.click();
      }

      // Wait for a short time to ensure the like counts have updated
      await page.waitForTimeout(1500); // Adjust timeout as needed

      // Get all elements containing the like counts
      const likeCounts = await page.$$eval(".like-count", (divs) =>
        divs.map((div) => parseInt(div.textContent.match(/Likes: (\d+)/)[1]))
      );

      // Check if the like counts are sorted in descending order
      let sortedCorrectly = true;
      for (let i = 0; i < likeCounts.length - 1; i++) {
        console.log(likeCounts[i]);

        if (likeCounts[i] < likeCounts[i + 1]) {
          sortedCorrectly = false;
          break;
        }
      }

      // Assert that the like counts are sorted correctly
      expect(sortedCorrectly).toBe(true);
    });
  });
});
