console.clear();
import app from "./app";

const port = process.env.PORT || 5790;

app.listen(port, () => {
  console.log(`\x1b[32m[TCPListen@StatusMonitor]\x1b[0m localhost:${port}`);
});
