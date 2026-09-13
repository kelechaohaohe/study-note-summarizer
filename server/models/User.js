import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // creates a unique index on this field
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true, // never store the plain password
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

export const User = mongoose.model("User", userSchema);