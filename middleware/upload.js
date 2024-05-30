import path from "path";
import multer from "multer";
import crypto from "node:crypto";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve("tmp"));
  },
  filename(req, file, cb) {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    const suffix = crypto.randomUUID();

    console.log(`${basename}_${suffix}${extname}`);

    cb(null, `${basename}_${suffix}${extname}`);
  },
});

export default multer({ storage });
