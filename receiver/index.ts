import app from "express";
import amqplib from "amqplib";
import bodyParser from "body-parser";

const server = app();

let channel: amqplib.Channel;

const init = async () => {
  const connection = await amqplib.connect(
    "amqp://rmuser:rmpassword@rabbitmq:5672"
  );
  channel = await connection.createChannel();
  await channel.assertQueue("todos");
};

server.use(bodyParser.json());

server.post("/todo", (req, res) => {
  const { title } = req.body;
  channel.sendToQueue("todos", Buffer.from(title));
  res.send("OK");
});

server.listen(1500, () => {
  console.log("Receiver started");
});

init();
