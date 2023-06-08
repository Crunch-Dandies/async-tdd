import { test, expect } from "@playwright/test";
import amqplib from "amqplib";

const messages: string[] = [];

test.beforeAll(async () => {
  const connection = await amqplib.connect(
    "amqp://rmuser:rmpassword@localhost:5672"
  );
  const channel = await connection.createChannel();
  await channel.assertQueue("todos");
  // await channel.purgeQueue("todos");
  await channel.consume("todos", (message) => {
    if (!message) return;
    messages.push(message.content.toString());
  });
});

test("receiver started", async ({ request }) => {
  const result = await request.post("http://localhost:1500/todo", {
    data: { title: "test" },
  });

  expect(result.ok).toBeTruthy();
});

test("receiver sends messages to the queue", async ({ request }) => {
  const title = `test_${Date.now()}`;
  await request.post("http://localhost:1500/todo", {
    data: { title },
  });

  await expect(() => {
    expect(messages).toEqual(expect.arrayContaining([title]));
  }).toPass({ timeout: 5000 });
});
