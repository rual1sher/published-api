import app from "./app";
import { env } from "./common/config/env.config";
import "@/jobs/post";

const PORT = env.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
