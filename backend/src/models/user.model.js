import mongoose, { Schema } from "mongoose";

const userScheme = new Schema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        token: { 
            type: String,
            index: true // Add index for faster queries
        }
    },
    { timestamps: true } // Add created and updated timestamps
);

const User = mongoose.model("User", userScheme);

export { User };