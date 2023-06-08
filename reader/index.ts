import app from "express";

import { Client } from "pg";

let pgClient: Client;

const init = async () => {
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

const server = app();

server.get("/todos", async (_, res) => {
  const query = "SELECT * FROM todos";
  const result = await pgClient.query(query);
  res.send(result.rows);
});

server.listen(1501, () => {
  console.log("Reader started");
});

init();
