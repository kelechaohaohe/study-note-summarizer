import mongoose from "mongoose";

// A single quiz question, embedded inside a Summary document.
const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: (arr) => arr.length === 4, // matches the 4-option rule in llm.js
    },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false } // subdocuments don't need their own _id here
);

const summarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // only created when someone is logged in (see summarize.js)
    },
    fileName: {
      type: String,
      default: null, // null if the user pasted text instead of uploading a file
    },
    sourceTextPreview: {
      type: String, // first ~300 chars of the original notes, for a "history" list later
    },
    summary: { type: String, required: true },
    quiz: { type: [quizQuestionSchema], required: true },
  },
  { timestamps: true }
);

export const Summary = mongoose.model("Summary", summarySchema);