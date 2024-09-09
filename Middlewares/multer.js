const multer = require('multer')
const path = require("path");



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
    
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
      // Check if the uploaded file is an image and has a supported file extension
      if (
        file.mimetype.startsWith("application/") &&
        (file.originalname.endsWith(".pdf") ||
          file.originalname.endsWith(".docx") ||
          file.originalname.endsWith(".txt"))
      ) {
       
        cb(null, true);
      } else {
        cb(new Error("Only   files are allowed!"), false);
      }
    },
  });


  module.exports = upload