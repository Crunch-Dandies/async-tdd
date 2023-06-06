import { test, expect } from "@playwright/test";
import amqplib from "amqplib";
import { Client } from "pg";

let channel: amqplib.Channel;
let pgClient: Client;

test.beforeAll(async () => {
  const connection = await amqplib.connect(
    "amqp://rmuser:rmpassword@localhost:5672"
  );
  channel = await connection.createChannel();
  await channel.assertQueue("todos");

  pgClient = new Client({
    user: "pguser",
    host: "localhost",
    database: "todos",
    password: "pgpassword",
    port: 5432,
  });
  await pgClient.connect();
});

test("executor adds todo from queue to database", () => {
  const title = `test_${Date.now()}`;
  channel.sendToQueue("todos", Buffer.from(title));

  expect(async () => {
    const result = await pgClient.query(
      `SELECT * FROM todos WHERE title = '${title}'`
    );
    expect(result.rows.length).toBe(1);
  }).toPass({ timeout: 5000 });
});
