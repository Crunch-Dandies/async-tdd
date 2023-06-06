import { test, expect } from "@playwright/test";

test("created todo appears in list", async ({ request }) => {
  const title = `test_${Date.now()}`;
  await request.post("http://localhost:1500/todo", {
    data: { title },
  });

  await expect
    .poll(
      async () => {
        const response = await request.get("http://localhost:1501/todos");
        return response.json();
      },
      { timeout: 5000 }
    )
    .toEqual(expect.arrayContaining([{ title }]));
});
