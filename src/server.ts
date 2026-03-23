import app from "./app.js";
import { getEnvVars } from "./app/config/env.js";
import { seedAdminIfEnabled } from "./app/seed/seedAdminOnStart.js";



// Start the server:
const bootstrap = async () => {
    try {
        await seedAdminIfEnabled();

        const { PORT } = getEnvVars();
        const port = PORT ? Number(PORT) : 5000;

        if (Number.isNaN(port)) {
            throw new Error("PORT must be a number");
        }

        app.listen(port, () => {
            console.log(`The DevHuntr Server is running on port ${port}`);
        })
    } catch (error) {
        console.error("Failed to start server:", error);
    }
}

bootstrap();