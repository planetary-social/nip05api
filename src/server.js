import app from "./app.js";

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

