import { connect } from "mongoose";

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("MongoDB connected Successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export default connectDB;
// This code connects to a MongoDB database using Mongoose. It exports a function `connectDB` that attempts to connect to the database using the URI stored in the environment variable `MONGO_URI`. If the connection is successful, it logs a success message; if it fails, it logs the error and exits the process with a failure code. The connection options include `useNewUrlParser` and `useUnifiedTopology` to avoid deprecation warnings.