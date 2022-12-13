import multer from "multer";

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format!" }, false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
