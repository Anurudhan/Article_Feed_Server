import mongoose from 'mongoose';
import { envVaribales } from '../config/env_variables';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(envVaribales.MONGO_URI as string);
    console.log(`MongoDB connected: 🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
