import app from "./app";
import { envVars } from "./app/config/env";



// Start the server:
const bootstrap = async () => {
    try {
        app.listen(envVars.PORT, () => {
            console.log(`The DevHuntr Server is running on port ${envVars.PORT}`);
        })
    } catch (error) {
        console.error("Failed to start server:", error);
    }
}

bootstrap();