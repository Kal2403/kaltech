import "dotenv/config";
import type { Server } from "node:http";
import mongoose from "mongoose";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { assertCloudinaryConfig } from "./config/cloudinary.js";

const PORT = process.env.PORT || 5000;
let server: Server | null = null;

const startServer = async () => {
    assertCloudinaryConfig();
    await connectDatabase();

    server = app.listen(PORT, () => {
        console.log(`KalTech server running on port ${PORT}`);
    });
};

const gracefulShutdown = async (signal: string) => {
    console.log(`[Shutdown] Recibida senal ${signal}. Iniciando apagado ordenado...`);

    if (server) {
        server.close(async () => {
            console.log("[Shutdown] Servidor HTTP cerrado para nuevas conexiones.");
            try {
                if (mongoose.connection.readyState !== 0) {
                    await mongoose.connection.close(false);
                    console.log("[Shutdown] Conexion con MongoDB cerrada exitosamente.");
                }
                process.exit(0);
            } catch (error) {
                console.error("[Shutdown] Error al cerrar conexion con la base de datos:", error);
                process.exit(1);
            }
        });

        // Temporizador de seguridad para forzar salida si alguna conexion queda colgada
        const forceExitTimer = setTimeout(() => {
            console.error("[Shutdown] Tiempo de espera agotado (10s). Forzando cierre del proceso.");
            process.exit(1);
        }, 10000);
        forceExitTimer.unref();
    } else {
        process.exit(0);
    }
};

process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));

startServer().catch((error) => {
    console.error("[Fatal Error] Error al iniciar el servidor:", error);
    process.exit(1);
});
