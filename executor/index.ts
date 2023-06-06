import amqplib from "amqplib";
import { Client } from "pg";

let channel: amqplib.Channel;
let pgClient: Client;

const init = async () => {
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
};

init().then(() => {
  console.log("Executor: connected to database " + pgClient.database);

  channel.consume("todos", async (message) => {
    if (!message) return;
    const title = message.content.toString();
    await pgClient.query(`INSERT INTO todos (title) VALUES ('${title}')`);
  });
});
