import app from "./app";

try {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log("Server is running at", PORT));
} catch (error) {
  console.log(error);
}
