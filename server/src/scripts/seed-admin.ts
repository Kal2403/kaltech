import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { User } from "../models/User.model.js";

dotenv.config();

export const seedAdmin = async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/kaltech";
    const name = process.env.ADMIN_NAME || "Administrador KalTech";
    const email = (process.env.ADMIN_EMAIL || "admin@kaltech.com").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "Admin1234!";

    console.log("Connecting to MongoDB for admin seeding...");

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB.");

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            let updated = false;
            if (existingUser.role !== "admin") {
                existingUser.role = "admin";
                updated = true;
            }
            if (!existingUser.isActive) {
                existingUser.isActive = true;
                updated = true;
            }

            if (updated) {
                await existingUser.save();
                console.log(`[OK] Usuario existente '${email}' actualizado con rol de Administrador.`);
            } else {
                console.log(`[INFO] El usuario '${email}' ya existe y cuenta con rol de Administrador.`);
            }
        } else {
            if (password.length < 8) {
                throw new Error("Admin password must have at least 8 characters");
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            await User.create({
                name,
                email,
                password: hashedPassword,
                role: "admin",
                isActive: true,
            });

            console.log(`[OK] Administrador inicial creado con éxito:`);
            console.log(`  * Nombre: ${name}`);
            console.log(`  * Email:  ${email}`);
            console.log(`  * Rol:    admin`);
        }
    } catch (error) {
        console.error("Error during admin seeding:", error);
        process.exitCode = 1;
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

// Execute if run directly from CLI
const isDirectExecution = process.argv[1]?.includes("seed-admin");
if (isDirectExecution) {
    seedAdmin().catch(() => {
        process.exit(1);
    });
}
