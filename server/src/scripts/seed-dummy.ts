import mongoose from "mongoose";
import dotenv from "dotenv";
import { syncDummyTechProducts } from "../services/dummy-product.service.js";

dotenv.config();

const runSeed = async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/kaltech";
    console.log("Connecting to MongoDB...");

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully.");
        console.log("Fetching and synchronizing tech products from DummyJSON...");

        const result = await syncDummyTechProducts();

        console.log("Synchronization completed successfully!");
        console.log(`- Categories synchronized: ${result.categoriesSynced}`);
        console.log(`- Products processed: ${result.productsProcessed}`);
        console.log(`- Products inserted: ${result.productsInserted}`);
        console.log(`- Products updated: ${result.productsUpdated}`);
        console.log("Details by category:");
        for (const detail of result.details) {
            console.log(`  * ${detail.category}: ${detail.count} products`);
        }
    } catch (error) {
        console.error("Error during DummyJSON seeding:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
};

runSeed();
