import amqplib from "amqplib";
import { Client } from "pg";

let channel: amqplib.Channel;
let pgClient: Client;

const init = async () => {
  const connection = await amqplib.connect(
    "amqp://rmuser:rmpassword@rabbitmq:5672"
  );
  channel = await connection.createChannel();
  await channel.assertQueue("todos");

  pgClient = new Client({
    user: "pguser",
    host: "pgdb",
    database: "todos",
    password: "pgpassword",
    port: 5432,
  });
  await pgClient.connect();
  await pgClient.query(
    "CREATE TABLE IF NOT EXISTS todos (title VARCHAR(255));"
  );
};

init().then(() => {
  console.log("Executor: connected to database " + pgClient.database);

  channel.consume("todos", async (message) => {
    if (!message) return;
    const title = message.content.toString();
    await pgClient.query(`INSERT INTO todos (title) VALUES ('${title}')`);
  });
});
