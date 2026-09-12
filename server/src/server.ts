import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`NOVA API running on http://localhost:${PORT}`);
});
