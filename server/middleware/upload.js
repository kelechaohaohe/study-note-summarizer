// Configures multer to accept a single file upload in memory

import multer from "multer";

const storage = multer.memoryStorage();

// Limit uploads to 10MB and only accept PDF or plain text files.
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or TXT files are supported."));
    }
  },
});