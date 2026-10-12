import mongoose from "mongoose";
import { MONGO_URI } from "./environment.js";
import { logger } from "./logger.js";

// Throws on failure so the process exits instead of running without a database.
export const connectToDatabase = async () => {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB");
};

export const disconnectFromDatabase = async () => {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
};

export const isDatabaseReady = () => mongoose.connection.readyState === 1;
