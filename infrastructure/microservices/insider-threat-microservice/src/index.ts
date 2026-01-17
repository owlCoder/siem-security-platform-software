import app from "./app";

console.clear();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`\x1b[35m[TCPListen@InsiderThreat]\x1b[0m localhost:${port}`);
});