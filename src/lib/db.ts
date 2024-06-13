import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log(`MongoDB Connected`);
  } catch (e) {
    console.error(`Error : ${e}`);
    process.exit(1);
  }
};

export default connectDB;
