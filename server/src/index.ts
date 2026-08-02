import "dotenv/config";

import app from "./app.js";
import { connectDatabase } from "./config/database.js"
import { assertCloudinaryConfig } from "./config/cloudinary.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    assertCloudinaryConfig();
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`KalTech server running on port ${PORT}`);
    });
};

startServer();
