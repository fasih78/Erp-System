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
    limits: {
      fileSize: 1024 * 1024, // 1 MB limit
    },
    fileFilter: function (req, file, cb) {
      // Check if the uploaded file is an image and has a supported file extension
      if (
        file.mimetype.startsWith("image/") &&
        (file.originalname.endsWith(".jpeg") ||
          file.originalname.endsWith(".png") ||
          file.originalname.endsWith(".jpg"))
      ) {
        cb(null, true);

      } else {
        cb(new Error("Only supported image files are allowed!"), false);
      }
    },
  });


  module.exports = upload